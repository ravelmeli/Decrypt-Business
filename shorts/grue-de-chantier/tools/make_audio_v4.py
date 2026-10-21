"""v4 sound design: voice-forward mix. SFX/music sit well below the voice; scene transitions use the bundled
whoosh-short.mp3 (Pixabay licence, see CREDITS.md). Reads assets/timing.json so sounds land on the picture cues."""
import json, subprocess, sys, os, wave
import numpy as np

SR = 48000
ROOT, OUT = sys.argv[1], sys.argv[2]
T = json.load(open(f"{ROOT}/assets/timing.json"))
DUR = 60.32; N = int(DUR * SR)
rng = np.random.default_rng(11)

def decode(path, flt=None):
    cmd = ["ffmpeg", "-v", "error", "-i", path] + (["-af", flt] if flt else []) + ["-ar", str(SR), "-ac", "1", "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype=np.float32).copy()

# voice: clean-up + presence + gentle compression, then level to a fixed peak
voice = decode(f"{ROOT}/assets/voiceover.wav", "highpass=f=90,equalizer=f=3200:t=q:w=1.1:g=2.5,acompressor=threshold=-20dB:ratio=3:attack=6:release=90:makeup=3")
voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
voice *= 0.85 / max(1e-6, np.abs(voice).max())

win = int(0.12 * SR)
env = np.convolve(np.abs(voice), np.ones(win) / win, mode="same")
env = np.clip(env / np.percentile(env, 95), 0, 1)
env = np.convolve(env, np.ones(int(0.25 * SR)) / int(0.25 * SR), mode="same")

sfx = np.zeros(N, dtype=np.float32); mus = np.zeros(N, dtype=np.float32)
def add(buf, t, sig, g=1.0):
    i = int(round(t * SR))
    if i >= N: return
    if i < 0: sig = sig[-i:]; i = 0
    j = min(N, i + len(sig)); buf[i:j] += (sig[: j - i] * g).astype(np.float32)
def tt(d): return np.arange(int(d * SR)) / SR
def pop(f0=620, f1=240, d=0.14):
    x = tt(d); f = f1 + (f0 - f1) * np.exp(-x * 28); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 24)
def click(d=0.02):
    x = tt(d); n = np.diff(rng.standard_normal(len(x)), prepend=0); return n * np.exp(-x * 220) * 0.5
def clink(f=1900, d=0.35):
    x = tt(d); return (np.sin(2 * np.pi * f * x) + 0.6 * np.sin(2 * np.pi * f * 1.5 * x + 1) + 0.3 * np.sin(2 * np.pi * f * 2.4 * x)) * np.exp(-x * 11) * 0.5
def thud(f=70, d=0.3):
    x = tt(d); fr = 45 + (f * 1.8 - 45) * np.exp(-x * 20); return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-x * 11)
def ding(f=880, d=0.7):
    x = tt(d); return (np.sin(2 * np.pi * f * x) + 0.4 * np.sin(2 * np.pi * f * 2 * x)) * np.exp(-x * 6)
def riser(d):
    n = int(d * SR); x = np.linspace(0, 1, n); nz = rng.standard_normal(n); y = np.zeros(n); s = 0.0
    a = 0.02 + 0.4 * x ** 2
    for i in range(n): s += a[i] * (nz[i] - s); y[i] = s
    sw = np.sin(2 * np.pi * np.cumsum(200 + 1400 * x ** 2) / SR)
    return (y * 1.8 + sw * 0.25) * x ** 1.6
def sparkle(d=0.5, f=2200):
    x = tt(d); return np.sin(2 * np.pi * f * x) * np.exp(-x * 9) * 0.6

WH = decode(f"{ROOT}/assets/sfx/whoosh-short.mp3"); WH /= np.abs(WH).max()
WH_PEAK = 0.1645  # energy peak inside the file, so the swell lands on the cut

# ---------------- SFX cue sheet ----------------
c1 = T["crane1"]
add(sfx, 0.0, thud(60), 0.6)
for k in range(6): add(sfx, 0.02 + k * 0.07, click(), 0.30)
add(sfx, c1, pop(500, 200), 0.5)
for k in range(7): add(sfx, c1 + 0.3 + k * 0.14, pop(420 + 60 * k, 200 + 30 * k), 0.40)
add(sfx, c1 + 1.4, pop(700, 300), 0.5); add(sfx, c1 + 1.55, pop(800, 350), 0.45)
for i in range(3): add(sfx, c1 + 2.1 + i * 0.15, thud(80), 0.40)
add(sfx, c1 + 2.4, pop(900, 400), 0.4)
for tp in [2.6, 2.8, 3.0, 3.1, 3.3, 3.4, 3.5, 3.6, 3.7, 3.9, 4.1, 4.3]: add(sfx, tp + 0.2, pop(560, 260), 0.16)
c = T["coins1"]
for k in range(c["n"]): add(sfx, c["t0"] + k * c["step"] + 0.3, clink(1700 + 90 * (k % 4)), 0.45)
for cut in T["cuts"]: add(sfx, cut - WH_PEAK, WH, 1.0)           # scene transitions: whoosh-short.mp3
for tp in T["cards"]: add(sfx, tp, pop(980, 520, 0.1), 0.28)
for tp in T["cost"]: add(sfx, tp, thud(75), 0.5); add(sfx, tp, pop(500, 220), 0.28)
add(sfx, T["meter"], pop(500, 220), 0.4)
for k in range(24): add(sfx, 16.0 + k * 0.1, click(), 0.22 + 0.01 * k)
add(sfx, 16.0, riser(2.4), 0.10)
add(sfx, T["hourglass"], pop(600, 260), 0.4)
ch = T["chain"]
for k in range(ch[2]): add(sfx, ch[0] + k * ch[1], click(), 0.5); add(sfx, ch[0] + k * ch[1], pop(700 - 25 * k, 400), 0.18)
for i in range(8): add(sfx, T["weeksIn"] + i * 0.12, pop(600 + 40 * i, 280), 0.28)
for i in range(8): add(sfx, T["weeksRed"] + i * 0.3, thud(110), 0.38)
add(sfx, T["loan"], thud(60), 0.55)
d_ = T["debt"]
for k in range(6): add(sfx, d_["t0"] + k * d_["step"], thud(65 + 6 * k), 0.5)
add(sfx, T["balance"], pop(620, 260), 0.4); add(sfx, T["balance"] + 2.7, thud(50), 0.7)
for k in range(7): add(sfx, T["crane2"] + 0.3 + k * 0.14, pop(500 + 55 * k, 240 + 25 * k), 0.30)
add(sfx, T["crane2"] + 0.1, pop(520, 220), 0.4)
for tp in T["bars"]: add(sfx, tp, pop(520, 220), 0.42)
for tp in T["pads"]: add(sfx, tp, pop(560, 240), 0.42)
add(sfx, 44.4, ding(988), 0.3); add(sfx, 44.9, ding(1319), 0.3)
f_ = T["floors"]
for k in range(4): add(sfx, f_["t0"] + k * f_["step"], pop(500 + 60 * k, 220), 0.45); add(sfx, f_["t0"] + k * f_["step"] + 0.5, clink(2400), 0.2)
add(sfx, T["roof"], pop(900, 400), 0.5)
b = T["burst"]
for k, f in enumerate([1568, 1976, 2349, 2637]): add(sfx, b + 0.05 + k * 0.07, sparkle(0.7, f), 0.45)
r = T["rain"]
rr = np.random.default_rng(5)
for k in range(r[2]): add(sfx, r[0] + k * r[1] + 0.8, clink(1500 + int(rr.integers(0, 6)) * 120), 0.34)
c2 = T["coins2"]
for k in range(c2["n"]): add(sfx, c2["t0"] + k * c2["step"] + 0.3, clink(1700 + 90 * (k % 4)), 0.4)
for i in range(8): add(sfx, T["weeksGreen"] + i * 0.35, pop(700 + 50 * i, 300), 0.28)
add(sfx, 55.0, riser(1.1), 0.45)
add(sfx, T["plaque"] - WH_PEAK, WH, 1.0); add(sfx, T["plaque"] + 0.35, thud(70), 0.6)
for k, f in enumerate([1318, 1568, 1760, 2093, 2637]): add(sfx, 56.5 + k * 0.22, sparkle(0.8, f), 0.3)
add(sfx, T["loopFlash"] - 0.05, WH, 0.9)

# ---------------- music bed (kept well under the voice) ----------------
bpm = 96; beat = 60 / bpm
chords = [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 67]]
mf = lambda m: 440 * 2 ** ((m - 69) / 12)
def pluck(f, d=0.45):
    x = tt(d); return (np.sin(2 * np.pi * f * x) + 0.35 * np.sin(2 * np.pi * 2 * f * x) + 0.12 * np.sin(2 * np.pi * 3 * f * x)) * np.exp(-x * 9) * np.minimum(1, x * 400)
def bass(f, d=0.6):
    x = tt(d); return np.sin(2 * np.pi * f * x) * np.exp(-x * 4) * np.minimum(1, x * 300)
def hat(d=0.05):
    x = tt(d); n = np.diff(rng.standard_normal(len(x)), prepend=0); return n * np.exp(-x * 90) * 0.5
step = beat / 2; arp = [0, 1, 2, 3, 2, 1, 2, 3]
for s in range(int(DUR / step)):
    t = s * step; ch_ = chords[int(t // (beat * 4)) % 4]; bi = s % 8
    add(mus, t, pluck(mf(ch_[arp[bi]] + 12)), 0.5 if bi % 2 == 0 else 0.32)
    if bi == 0: add(mus, t, bass(mf(ch_[0] - 24)), 0.9)
    if bi == 4: add(mus, t, bass(mf(ch_[0] - 24)), 0.6)
    if bi % 2 == 1: add(mus, t, hat(), 0.2)
x = np.arange(N) / SR
mus += (sum(np.sin(2 * np.pi * mf(m) * x) for m in [48, 55, 60, 64]) * 0.03 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.25 * x))).astype(np.float32)
lvl = 0.085 + 0.10 * np.clip((x - 54.8) / 2.5, 0, 1)
lvl *= 1 - np.clip((x - 59.4) / 0.9, 0, 1)
mus = mus * lvl * (1 - 0.7 * env)
sfx_d = sfx * (1 - 0.5 * env)

SFX_BUS = 0.17
mix = voice + sfx_d * SFX_BUS + mus
mix = np.tanh(mix * 1.05)

def write(path, sig):
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(np.stack([sig, sig], 1), -1, 1) * 32767).astype("<i2").tobytes())
tmp = OUT + ".tmp.wav"; write(tmp, mix)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", str(SR), OUT], check=True); os.remove(tmp)

# report: how loud is each stem relative to the voice (short-term RMS, dB)
def rms_db(sig, a=0, b=None):
    s = sig[int(a * SR): int((b or DUR) * SR)]; return 20 * np.log10(np.sqrt(np.mean(s ** 2)) + 1e-9)
act = env > 0.3
vr = 20 * np.log10(np.sqrt(np.mean(voice[act] ** 2)))
print(f"voice RMS (speaking): {vr:.1f} dBFS")
print(f"sfx   RMS while speaking: {20*np.log10(np.sqrt(np.mean((sfx_d*SFX_BUS)[act]**2))+1e-9):.1f} dBFS  | sfx peak {20*np.log10(np.abs(sfx_d*SFX_BUS).max()):.1f} dBFS")
print(f"music RMS while speaking: {20*np.log10(np.sqrt(np.mean(mus[act]**2))+1e-9):.1f} dBFS")
print("ok", OUT)
