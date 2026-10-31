"""Generate a voice-over WAV from a script with Gemini TTS.
Usage:  GEMINI_API_KEY=... python3 tts_gemini.py script.txt out.wav [--voice en-us-koda] [--style "High energy, elongated vowels"]
The script is plain text, one idea per line. The key is read from the environment only (never stored in a file)."""
import argparse, base64, json, os, sys, urllib.request

ap = argparse.ArgumentParser()
ap.add_argument("script"); ap.add_argument("out")
ap.add_argument("--voice", default="en-us-koda")
ap.add_argument("--style", default="High energy, elongated vowels")   # the "Promote" preset in AI Studio
ap.add_argument("--model", default="gemini-3.8-flash-tts")
a = ap.parse_args()
key = os.environ.get("GEMINI_API_KEY")
if not key: sys.exit("Set GEMINI_API_KEY in the environment (do not write it in a file).")
text = " ".join(l.strip() for l in open(a.script, encoding="utf-8") if l.strip())
body = {"contents": [{"parts": [{"text": text, "speech_metadata": {"speaker": "narrateur", "style": a.style}}]}],
        "generationConfig": {"responseModalities": ["AUDIO"], "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": a.voice}}}}}
req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{a.model}:generateContent",
                             data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": key})
resp = json.load(urllib.request.urlopen(req, timeout=300))
audio = base64.b64decode(resp["candidates"][0]["content"]["parts"][0]["inlineData"]["data"])
open(a.out, "wb").write(audio)
print("wrote", a.out, len(audio), "bytes", resp.get("usageMetadata", {}).get("totalTokenCount"), "tokens")
