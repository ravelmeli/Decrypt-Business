"""Synthesise the sound design (SFX + music bed) for the Short and mix it under the voice-over.
Reads video-v3/assets/timing.json so sounds land on the same cues as the picture. Deterministic (seeded)."""
import json, subprocess, sys
import numpy as np

SR = 48000
ROOT = sys.argv[1]  # video project dir
OUT = sys.argv[2]
T = json.load(open(f"{ROOT}/assets/timing.json"))
DUR = 60.32
N = int(DUR * SR)
rng = np.random.default_rng(11)

# --- voice (resampled to 48 kHz mono) ---
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", f"{ROOT}/assets/voiceover.wav", "-ar", str(SR), "-ac", "1", "-f", "f32le", "-"], capture_output=True, check=True).stdout
voice = np.frombuffer(raw, dtype=np.float32).copy()
voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
voice /= max(1e-6, np.abs(voice).max()) / 0.8

# voice envelope for ducking
win = int(0.12 * SR)
env = np.convolve(np.abs(voice), np.ones(win) / win, mode="same")
env = np.clip(env / np.percentile(env, 95), 0, 1)
env = np.convolve(env, np.ones(int(0.2 * SR)) / int(0.2 * SR), mode="same")

sfx = np.zeros(N, dtype=np.float32)
mus = np.zeros(N, dtype=np.float32)

def add(buf, t, sig, g=1.0):
    i = int(t * SR)
    if i >= N or i < 0: return
    j = min(N, i + len(sig))
    buf[i:j] += (sig[: j - i] * g).astype(np.float32)

def tt(d): return np.arange(int(d * SR)) / SR

def pop(f0=620, f1=240, d=0.14):
    x = tt(d); f = f1 + (f0 - f1) * np.exp(-x * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 24)

def click(d=0.02):
    x = tt(d); n = rng.standard_normal(len(x)); n = np.diff(n, prepend=0)
    return n * np.exp(-x * 220) * 0.5

def clink(f=1900, d=0.35):
    x = tt(d); return (np.sin(2 * np.pi * f * x) + 0.6 * np.sin(2 * np.pi * f * 1.5 * x + 1) + 0.3 * np.sin(2 * np.pi * f * 2.4 * x)) * np.exp(-x * 11) * 0.5

def thud(f=70, d=0.3):
    x = tt(d); fr = 45 + (f * 1.8 - 45) * np.exp(-x * 20); return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-x * 11)

def ding(f=880, d=0.7):
    x = tt(d); return (np.sin(2 * np.pi * f * x) + 0.4 * np.sin(2 * np.pi * f * 2 * x)) * np.exp(-x * 6)

def whoosh(d=0.4, lo=0.04, hi=0.5):
    n = int(d * SR); x = np.linspace(0, 1, n); nz = rng.standard_normal(n)
    a = lo + (hi - lo) * np.sin(np.pi * x) ** 1.5; y = np.zeros(n); s = 0.0
    for i in range(n): s += a[i] * (nz[i] - s); y[i] = s
    return y * np.sin(np.pi * x) ** 2 * 2.2

def riser(d):
    n = int(d * SR); x = np.linspace(0, 1, n); nz = rng.standard_normal(n); y = np.zeros(n); s = 0.0
    a = 0.02 + 0.4 * x ** 2
    for i in range(n): s += a[i] * (nz[i] - s); y[i] = s
    sw = np.sin(2 * np.pi * np.cumsum(200 + 1400 * x ** 2) / SR)
    return (y * 1.8 + sw * 0.25) * x ** 1.6

def sparkle(d=0.5, f=2200):
    x = tt(d); return np.sin(2 * np.pi * f * x) * np.exp(-x * 9) * 0.6

# ---------------- SFX cue sheet ----------------
c1 = T["crane1"]
for k in range(6): add(sfx, 0.02 + k * 0.07, click(), 0.35)
add(sfx, c1, pop(500, 200), 0.5)
for k in range(7): add(sfx, c1 + 0.3 + k * 0.14, pop(420 + 60 * k, 200 + 30 * k), 0.42)
add(sfx, c1 + 1.4, pop(700, 300), 0.5); add(sfx, c1 + 1.55, pop(800, 350), 0.45)
add(sfx, c1 + 1.6, whoosh(0.7, 0.03, 0.3), 0.35)
for i in range(3): add(sfx, c1 + 2.1 + i * 0.15, thud(80), 0.45)
add(sfx, c1 + 2.4, pop(900, 400), 0.4)
for i, tp in enumerate([2.6, 2.8, 3.0, 3.1, 3.3, 3.4, 3.5, 3.6, 3.7, 3.9, 4.1, 4.3]): add(sfx, tp + 0.2, pop(560, 260), 0.18)
c = T["coins1"]
for k in range(c["n"]): add(sfx, c["t0"] + k * c["step"] + 0.3, clink(1700 + 90 * (k % 4)), 0.5)
for cut in T["cuts"]: add(sfx, cut - 0.12, whoosh(0.28), 0.55)
for tp in T["cards"]: add(sfx, tp, pop(980, 520, 0.1), 0.3)
for tp in T["cost"]: add(sfx, tp, thud(75), 0.55); add(sfx, tp, pop(500, 220), 0.3)
add(sfx, T["meter"], pop(500, 220), 0.4)
for k in range(24): add(sfx, 16.0 + k * 0.1, click(), 0.25 + 0.01 * k)
add(sfx, 16.0, riser(2.4), 0.12)
for i in range(8): add(sfx, T["weeksIn"] + i * 0.12, pop(600 + 40 * i, 280), 0.3)
for i in range(8): add(sfx, T["weeksRed"] + i * 0.3, thud(110), 0.4)
add(sfx, T["loan"], thud(60), 0.6)
d_ = T["debt"]
for k in range(6): add(sfx, d_["t0"] + k * d_["step"], thud(65 + 6 * k), 0.55)
for k in range(7): add(sfx, T["crane2"] + 0.3 + k * 0.14, pop(500 + 55 * k, 240 + 25 * k), 0.34)
add(sfx, T["crane2"] + 0.1, pop(520, 220), 0.4)
for tp in T["bars"]: add(sfx, tp, pop(520, 220), 0.45)
for tp in T["pads"]: add(sfx, tp, pop(560, 240), 0.45)
add(sfx, 44.4, ding(988), 0.35); add(sfx, 44.9, ding(1319), 0.35)
f_ = T["floors"]
for k in range(4): add(sfx, f_["t0"] + k * f_["step"], pop(500 + 60 * k, 220), 0.5); add(sfx, f_["t0"] + k * f_["step"] + 0.5, clink(2400), 0.22)
add(sfx, T["roof"], pop(900, 400), 0.5)
c2 = T["coins2"]
for k in range(c2["n"]): add(sfx, c2["t0"] + k * c2["step"] + 0.3, clink(1700 + 90 * (k % 4)), 0.5)
for i in range(8): add(sfx, T["weeksGreen"] + i * 0.35, pop(700 + 50 * i, 300), 0.3)
add(sfx, 55.0, riser(1.1), 0.5)
add(sfx, T["plaque"], whoosh(0.5, 0.03, 0.4), 0.7); add(sfx, T["plaque"] + 0.35, thud(70), 0.7)
for k, f in enumerate([1318, 1568, 1760, 2093, 2637]): add(sfx, 56.5 + k * 0.22, sparkle(0.8, f), 0.35)

# ---------------- music bed ----------------
bpm = 96; beat = 60 / bpm
chords = [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 67]]
mf = lambda m: 440 * 2 ** ((m - 69) / 12)
def pluck(f, d=0.45):
    x = tt(d); return (np.sin(2 * np.pi * f * x) + 0.35 * np.sin(2 * np.pi * 2 * f * x) + 0.12 * np.sin(2 * np.pi * 3 * f * x)) * np.exp(-x * 9) * np.minimum(1, x * 400)
def bass(f, d=0.6):
    x = tt(d); return np.sin(2 * np.pi * f * x) * np.exp(-x * 4) * np.minimum(1, x * 300)
def hat(d=0.05):
    x = tt(d); n = np.diff(rng.standard_normal(len(x)), prepend=0); return n * np.exp(-x * 90) * 0.5
step = beat / 2; nsteps = int(DUR / step)
arp = [0, 1, 2, 3, 2, 1, 2, 3]
for s in range(nsteps):
    t = s * step; bar = int(t // (beat * 4)) % 4; ch = chords[bar]; bi = s % 8
    add(mus, t, pluck(mf(ch[arp[bi]] + 12)), 0.5 if bi % 2 == 0 else 0.32)
    if bi == 0: add(mus, t, bass(mf(ch[0] - 24)), 0.9)
    if bi == 4: add(mus, t, bass(mf(ch[0] - 24)), 0.6)
    if bi % 2 == 1: add(mus, t, hat(), 0.25)
x = np.arange(N) / SR
pad = sum(np.sin(2 * np.pi * mf(m) * x) for m in [48, 55, 60, 64]) * 0.03 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.25 * x))
mus += pad.astype(np.float32)
# music level curve: gentle bed, swell into the finale, fade at the very end
lvl = 0.22 + 0.0 * x
lvl += 0.22 * np.clip((x - 54.5) / 2.5, 0, 1)
lvl *= 1 - np.clip((x - 59.3) / 1.0, 0, 1)
mus = mus * lvl * (1 - 0.55 * env)
sfx_d = sfx * (1 - 0.35 * env)

mix = voice + sfx_d * 0.75 + mus * 1.0
mix = np.tanh(mix * 1.05)
st = np.stack([mix, mix], axis=1)
tmp = f"{OUT}.tmp.wav"
import wave
with wave.open(tmp, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(st, -1, 1) * 32767).astype("<i2").tobytes())
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", "loudnorm=I=-15:TP=-1.5:LRA=9", "-ar", str(SR), OUT], check=True)
import os; os.remove(tmp)
print("ok", OUT)
