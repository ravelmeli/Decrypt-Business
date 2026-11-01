"""Generate a voice-over line by line with Gemini TTS so every line boundary is known EXACTLY.
Usage: GEMINI_API_KEY=... python3 tools_tts_lines.py script.txt outdir [--gap 0.32] [--voice en-us-koda] [--style "..."]
Writes outdir/line_XX.wav (trimmed + level-matched), outdir/voice.wav (assembled, 24 kHz mono) and outdir/lines.json
([{i, text, start, end}] in seconds on the assembled timeline)."""
import argparse, base64, json, os, subprocess, sys, time, urllib.request
import numpy as np
ap = argparse.ArgumentParser(); ap.add_argument("script"); ap.add_argument("out")
ap.add_argument("--voice", default="en-us-koda"); ap.add_argument("--style", default="High energy, elongated vowels")
ap.add_argument("--model", default="gemini-3.8-flash-tts"); ap.add_argument("--gap", type=float, default=0.32); ap.add_argument("--lead", type=float, default=0.25); ap.add_argument("--target", type=float, default=0.0, help="aim for this total duration (s) with a gentle pitch-preserving tempo change, max 1.15x")
a = ap.parse_args(); key = os.environ.get("GEMINI_API_KEY") or sys.exit("Set GEMINI_API_KEY in the environment.")
SR = 24000; os.makedirs(a.out, exist_ok=True)
lines = [l.strip() for l in open(a.script, encoding="utf-8") if l.strip()]
def tts(text):
    body = {"contents": [{"parts": [{"text": text, "speech_metadata": {"speaker": "narrateur", "style": a.style}}]}],
            "generationConfig": {"responseModalities": ["AUDIO"], "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": a.voice}}}}}
    req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{a.model}:generateContent", data=json.dumps(body).encode(),
                                 headers={"Content-Type": "application/json", "x-goog-api-key": key})
    for k in range(6):
        try:
            r = json.load(urllib.request.urlopen(req, timeout=300)); return base64.b64decode(r["candidates"][0]["content"]["parts"][0]["inlineData"]["data"])
        except Exception as e: time.sleep(15 * (k + 1) if "429" in str(e) else 2 * (k + 1)); err = e
    raise SystemExit(f"TTS failed: {err}")
def pcm(wavbytes):
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", "pipe:0", "-ar", str(SR), "-ac", "1", "-f", "f32le", "-"], input=wavbytes, capture_output=True, check=True).stdout
    return np.frombuffer(p, dtype=np.float32).copy()
def trim(x):
    env = np.convolve(np.abs(x), np.ones(240) / 240, "same"); idx = np.where(env > 10 ** (-44 / 20))[0]
    s, e = max(0, idx[0] - int(0.05 * SR)), min(len(x), idx[-1] + int(0.08 * SR)); return x[s:e]
clips = []
for i, text in enumerate(lines):
    cached = f"{a.out}/line_{i:02d}.wav"      # resume: an existing line is reused; delete its file to redo just that line
    if os.path.exists(cached) and os.path.getsize(cached) > 1000:
        x = pcm(open(cached, "rb").read()); clips.append(x); print(i, f"{len(x) / SR:.2f}s (cached)", text[:48], flush=True); continue
    x = trim(pcm(tts(text))); rms = np.sqrt(np.mean(x ** 2)); x = x * (10 ** (-20 / 20) / rms)      # same speech level on every line
    x = x * np.minimum(1, np.linspace(0, 1, 120).tolist() + [1] * (len(x) - 120)) if False else x
    fade = int(0.006 * SR); x[:fade] *= np.linspace(0, 1, fade); x[-fade:] *= np.linspace(1, 0, fade)
    clips.append(x); print(i, f"{len(x) / SR:.2f}s", text[:48], flush=True)
    open(f"{a.out}/line_{i:02d}.wav", "wb").write(subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "pipe:0", "-f", "wav", "-"], input=x.tobytes(), capture_output=True).stdout)
if a.target:
    gaps = a.gap * len(clips) + 0.22 * 4 + a.lead; speech = sum(len(c) for c in clips) / SR; f = min(1.15, max(1.0, speech / max(1.0, a.target - gaps)))
    if f > 1.01:
        def stretch(x):
            p = subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "pipe:0", "-af", f"atempo={f:.4f}", "-f", "f32le", "-"], input=x.tobytes(), capture_output=True, check=True).stdout
            return np.frombuffer(p, dtype=np.float32).copy()
        clips = [stretch(c) for c in clips]
    print(f"tempo x{f:.3f} (speech {speech:.1f}s -> {sum(len(c) for c in clips) / SR:.1f}s)")
t = a.lead; timeline = []; parts = [np.zeros(int(a.lead * SR), dtype=np.float32)]
for i, x in enumerate(clips):
    timeline.append({"i": i, "text": lines[i], "start": round(t, 3), "end": round(t + len(x) / SR, 3)}); parts.append(x); t += len(x) / SR
    gap = a.gap + (0.22 if lines[i].rstrip().endswith(("marge.", "revenir.", "calendrier.", "inégale.")) else 0.0)     # slightly longer breath at topic changes
    parts.append(np.zeros(int(gap * SR), dtype=np.float32)); t += gap
v = np.concatenate(parts); peak = np.abs(v).max(); v = v * (0.9 / peak)
open(f"{a.out}/voice.wav", "wb").write(subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "pipe:0", "-f", "wav", "-"], input=v.tobytes(), capture_output=True).stdout)
json.dump(timeline, open(f"{a.out}/lines.json", "w"), ensure_ascii=False, indent=1)
print("total", round(len(v) / SR, 2), "s;", len(lines), "lines")
