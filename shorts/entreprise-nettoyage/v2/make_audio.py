"""v3 mix: voice only (processed) + ONE whoosh on the single big subject change. No music, no ticks. Target about -11.5 LUFS."""
import json, subprocess, sys
import numpy as np
SR = 48000
ROOT = "video"; B = json.load(open(f"{ROOT}/assets/beats.json")); DUR = B["dur"]; N = int(DUR * SR)
def decode(path, flt=None):
    cmd = ["ffmpeg", "-v", "error", "-i", path] + (["-af", flt] if flt else []) + ["-ar", str(SR), "-ac", "1", "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype=np.float32).copy()
voice = decode("../voice/voice.wav", "highpass=f=90,equalizer=f=3200:t=q:w=1.1:g=2.5,acompressor=threshold=-20dB:ratio=3:attack=6:release=90:makeup=3")
voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
mix = voice / max(1e-6, np.abs(voice).max()) * 0.85
wh = decode(f"{ROOT}/assets/sfx/whoosh-short.mp3"); WH_PEAK = 0.1645
wh = wh / np.abs(wh).max() * 0.3
i = int(round((B["times"]["whoosh"] - WH_PEAK) * SR)); mix[i:i + len(wh)] += wh[: N - i]
import wave
w_ = wave.open("/tmp/mix_pre.wav", "wb"); w_.setnchannels(1); w_.setsampwidth(2); w_.setframerate(SR); w_.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes()); w_.close()
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", "/tmp/mix_pre.wav", "-af", "loudnorm=I=-11.5:TP=-1.0:LRA=7", "-ar", "48000", "-ac", "1", f"{ROOT}/assets/mix.wav"], check=True)
print(subprocess.run(["ffmpeg", "-nostats", "-i", f"{ROOT}/assets/mix.wav", "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr.split("Summary:")[-1])
