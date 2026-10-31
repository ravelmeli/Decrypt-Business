"""v4 sound design: voice-forward mix. SFX/music sit well below the voice; scene transitions use the bundled
whoosh-short.mp3 (Pixabay licence, see CREDITS.md). Reads assets/timing.json so sounds land on the picture cues."""
import json, subprocess, sys, os, wave
import numpy as np

SR = 48000
ROOT, OUT = sys.argv[1], sys.argv[2]
T = json.load(open(f"{ROOT}/assets/beats.json"))
DUR = T["dur"]; N = int(DUR * SR)
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

# ---------------- SFX cue sheet (theme park, driven by beats.json) ----------------
Tm = T["times"]
for cut in T["cuts"]: add(sfx, cut - WH_PEAK, WH, 0.9)                       # camera cuts: whoosh-short.mp3
add(sfx, 0.0, thud(60), 0.6); add(sfx, 0.0, WH, 0.6)
for n in T["notes"]: add(sfx, n["t0"], pop(980, 520, 0.1), 0.24)               # annotation pills
for k in T["kws"]: add(sfx, k["t0"], thud(90), 0.4); add(sfx, k["t0"], pop(700, 300), 0.3)   # giant keywords
for p in T["panels"]:                                                          # data panels: swoosh + bar ticks
    add(sfx, p["t0"] - 0.05, WH, 0.35)
    for q in range(4): add(sfx, p["t0"] + 0.35 + q * 0.2, click(), 0.25)
for s in T["stamps"]: add(sfx, s["t0"], thud(55), 0.8); add(sfx, s["t0"], click(), 0.7)   # stamps slam
add(sfx, Tm["gate"], pop(520, 220), 0.45); add(sfx, Tm["ticket"], sparkle(0.6, 1760), 0.35); add(sfx, Tm["ticket"], pop(700, 300), 0.4)
for key in ("burger", "drink", "gift", "photo"): add(sfx, Tm["stall_" + key] - 0.3, pop(560, 240), 0.4)
add(sfx, Tm["cash"] - 0.2, thud(70), 0.6)
for k in range(10): add(sfx, Tm["cash"] + 0.2 + k * 0.1 + 0.3, clink(1700 + 90 * (k % 4)), 0.28)
for k in range(14): add(sfx, Tm["flow"] + 0.3 + k * 0.4, clink(1500 + 100 * (k % 5)), 0.2)
add(sfx, Tm["flow"] + 4.5, riser(0.9), 0.2)
for k in range(8): add(sfx, Tm["build"] + 0.15 * k, pop(420 + 50 * k, 200), 0.3)
for i in range(24): add(sfx, Tm["build"] + 0.7 + i * 0.22, click(), 0.3)
add(sfx, Tm["build"] + 6.5, WH, 0.5)
for i in range(12): add(sfx, Tm["calendar"] + i * 0.08, pop(500 + 40 * i, 220), 0.25)
add(sfx, Tm["calendar"], thud(60), 0.6)
add(sfx, Tm["night"] - 0.3, ding(660), 0.25)
rr = np.random.default_rng(3)
for k in range(46): add(sfx, Tm["rain"] + k * 0.12, click(), 0.12 + 0.05 * float(rr.random()))   # rain ticks
add(sfx, Tm["spend"] + 1.2, riser(1.0), 0.35)
add(sfx, Tm["finale"], riser(1.2), 0.35)
for k, f in enumerate([1318, 1568, 1760, 2093, 2637]): add(sfx, Tm["brand"] + k * 0.18, sparkle(0.8, f), 0.3)
add(sfx, Tm["brand"], thud(70), 0.6)
add(sfx, T["dur"] - 0.75, WH, 0.9)

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
lvl = 0.085 + 0.10 * np.clip((x - (DUR - 7.0)) / 2.5, 0, 1)
lvl *= 1 - np.clip((x - (DUR - 1.1)) / 0.95, 0, 1)
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
