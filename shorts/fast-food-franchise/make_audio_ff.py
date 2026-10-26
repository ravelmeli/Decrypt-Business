"""v4 sound design: voice-forward mix. SFX/music sit well below the voice; scene transitions use the bundled
whoosh-short.mp3 (Pixabay licence, see CREDITS.md). Reads assets/timing.json so sounds land on the picture cues."""
import json, subprocess, sys, os, wave
import numpy as np

SR = 48000
ROOT, OUT = sys.argv[1], sys.argv[2]
T = json.load(open(f"{ROOT}/assets/timing.json"))
DUR = 70.2; N = int(DUR * SR)
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

# ---------------- SFX cue sheet (fast-food franchise) ----------------
for cut in T["cuts"]: add(sfx, cut - WH_PEAK, WH, 1.0)                      # scene transitions: whoosh-short.mp3
starts = [0.0] + T["cuts"]
for s0 in starts:                                                         # tiles ripple in at each scene start
    for k in range(5): add(sfx, s0 + 0.03 + k * 0.07, click(), 0.28)
add(sfx, 0.0, thud(60), 0.6)
def pops(t0, n, step=0.1, g=0.3, f0=520, df=40):
    for i in range(n): add(sfx, t0 + i * step, pop(f0 + df * i, 240), g)
# A burger
pops(0.2, 6, 0.1, 0.4, 420, 60)
for k in range(10): add(sfx, 0.3 + k * 0.08 + 0.25, clink(1700 + 90 * (k % 4)), 0.3)
for k in range(9): add(sfx, 2.3 + k * 0.1, pop(800 - 30 * k, 400), 0.25)
# B restaurant + queue
add(sfx, 4.9, pop(500, 200), 0.45); pops(5.2, 12, 0.1, 0.18, 560, 25)
# C pie
pops(8.9, 6, 0.18, 0.4, 480, 50); add(sfx, 10.2, sparkle(0.8, 2093), 0.4); add(sfx, 10.2, pop(900, 400), 0.35)
# D follow the money -> entry
add(sfx, 14.0, pop(500, 200), 0.4); pops(14.6, 6, 0.28, 0.2, 700, 0)
add(sfx, 16.3, pop(560, 240), 0.45); pops(17.2, 8, 0.08, 0.2, 600, 20); add(sfx, 20.0, thud(60), 0.6); add(sfx, 20.0, pop(500, 220), 0.4)
for k in range(12): add(sfx, 20.4 + k * 0.12 + 0.25, clink(1700 + 90 * (k % 4)), 0.28)
# E brand takes
pops(23.9, 4, 0.15, 0.35, 480, 40); add(sfx, 24.4, thud(90), 0.5)
for k in range(8): add(sfx, 24.7 + k * 0.45, clink(1500 + 80 * (k % 3)), 0.2)
# F royalty + marketing
add(sfx, 29.0, thud(55), 0.7); add(sfx, 29.6, pop(600, 260), 0.4); add(sfx, 31.6, pop(560, 240), 0.4); add(sfx, 31.5, pop(720, 320), 0.3)
for k in range(10): add(sfx, 30.0 + k * 0.6, clink(1600 + 100 * (k % 3)), 0.18)
# G rent 20 years
add(sfx, 36.2, thud(55), 0.7); add(sfx, 36.4, pop(500, 220), 0.4)
for k in range(20): add(sfx, 37.6 + k * 0.05, click(), 0.22)
add(sfx, 38.6, thud(100), 0.7); add(sfx, 38.6, clink(1200), 0.4)
# H ingredients + staff
pops(40.7, 4, 0.1, 0.35, 520, 40); add(sfx, 41.0, pop(500, 200), 0.4); add(sfx, 41.2, riser(0.8), 0.14); add(sfx, 43.2, riser(0.8), 0.14); pops(41.8, 4, 0.15, 0.25, 620, 30)
# I the sum
add(sfx, 46.95, pop(560, 240), 0.5)
for k in range(10): add(sfx, 47.1 + k * 0.05, click(), 0.2)
for k in range(9): add(sfx, 47.9 + k * 0.1, pop(900 - 40 * k, 420), 0.25)
# J brand skims each sale
add(sfx, 49.6, pop(540, 230), 0.45); add(sfx, 49.7, thud(60), 0.6); add(sfx, 50.2, pop(600, 260), 0.35)
for k in range(10): add(sfx, 50.6 + k * 0.5, clink(1700 + 90 * (k % 4)), 0.22); add(sfx, 50.6 + k * 0.5 - 0.1, click(), 0.25)
# K risk stays with the franchisee
add(sfx, 54.5, pop(500, 200), 0.45); add(sfx, 54.7, pop(560, 240), 0.4); add(sfx, 54.8, riser(1.0), 0.14)
add(sfx, 55.4, riser(0.9), 0.12); add(sfx, 56.3, thud(50), 0.9)
# L contract
add(sfx, 58.9, pop(520, 220), 0.5); add(sfx, 59.5, pop(560, 240), 0.4); add(sfx, 61.2, thud(70), 0.9); add(sfx, 61.2, click(), 0.8)
add(sfx, 62.6, pop(560, 240), 0.45); add(sfx, 62.8, pop(500, 220), 0.45)
for i in range(6): add(sfx, 63.0 + i * 0.35, pop(900, 400), 0.2); add(sfx, 64.0 + i * 0.35, clink(1900 if i % 2 == 0 else 1400), 0.35)
# M finale
add(sfx, 66.5, pop(520, 220), 0.5); pops(66.6, 5, 0.1, 0.3, 560, 40); add(sfx, 65.0, riser(1.3), 0.45)
for k, f in enumerate([1568, 1976, 2349, 2637]): add(sfx, T["burst"] + 0.05 + k * 0.07, sparkle(0.7, f), 0.45)
for k in range(T["rain"][2]): add(sfx, T["rain"][0] + k * T["rain"][1] + 0.8, clink(1500 + (k * 7919 % 6) * 120), 0.3)
add(sfx, T["plaque"] - WH_PEAK, WH, 1.0); add(sfx, T["plaque"] + 0.35, thud(70), 0.6)
for k, f in enumerate([1318, 1568, 1760, 2093, 2637]): add(sfx, 67.9 + k * 0.22, sparkle(0.8, f), 0.3)
add(sfx, T["loopFlash"] - 0.05, WH, 0.9)
# cards
for tp in [0.3, 3.1, 9.6, 10.4, 14.3, 17.4, 20.2, 24.4, 29.2, 29.6, 31.6, 36.6, 38.0, 41.2, 43.2, 46.95, 47.5, 50.0, 55.0, 59.4, 63.2]: add(sfx, tp, pop(980, 520, 0.1), 0.22)

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
lvl = 0.085 + 0.10 * np.clip((x - 64.8) / 2.5, 0, 1)
lvl *= 1 - np.clip((x - 69.2) / 0.95, 0, 1)
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
