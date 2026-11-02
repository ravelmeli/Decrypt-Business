"""Single voice file: find each script line's exact [start,end] by aligning the script to the Whisper words, then snapping the boundaries to the acoustic silences."""
import json, re, difflib, wave, numpy as np
D = "voice/"
lines = [l.strip() for l in open("script.txt", encoding="utf-8") if l.strip()]
wh = json.load(open(D + "transcript.json")); wh = wh["words"] if isinstance(wh, dict) else wh
norm = lambda t: re.sub(r"[^\w]", "", t.lower().replace("’", "'"))
W = []
for x in wh:
    t = x["text"]
    if t.endswith("%"):
        n = t[:-1]; a, b = x["start"], x["end"]; d = (b - a) / 3
        W += [dict(t=norm(n), s=a, e=a + d), dict(t="pour", s=a + d, e=a + 2 * d), dict(t="cent", s=a + 2 * d, e=b)]
    else: W.append(dict(t=norm(t), s=x["start"], e=x["end"]))
toks = []; owner = []
for i, l in enumerate(lines):
    for d in l.split(): toks.append(norm(d)); owner.append(i)
sm = difflib.SequenceMatcher(None, toks, [w["t"] for w in W], autojunk=False); m = {}
for a, b, n in sm.get_matching_blocks():
    for k in range(n): m[a + k] = W[b + k]
w_ = wave.open(D + "voice.wav"); sr = w_.getframerate(); y = np.frombuffer(w_.readframes(w_.getnframes()), dtype=np.int16).astype(float) / 32768
hop = int(sr * 0.005); db = 20 * np.log10(np.array([np.sqrt(np.mean(y[i:i + hop * 2] ** 2) + 1e-12) for i in range(0, len(y) - hop * 2, hop)]) + 1e-9)
def quiet_after(t, lim=-42):
    i = int(t / 0.005)
    while i < len(db) - 12 and not (db[i:i + 12] < lim).all(): i += 1
    return i * 0.005
def loud_after(t, lim=-42):
    i = int(t / 0.005)
    while i < len(db) - 1 and db[i] < lim: i += 1
    return i * 0.005
first, last = {}, {}
for k, wd in m.items():
    i = owner[k]; first[i] = min(first.get(i, 1e9), wd["s"]); last[i] = max(last.get(i, 0), wd["e"])
miss = [i for i in range(len(lines)) if i not in first]
assert not miss, f"lines not found in the transcript: {miss}"
# silent runs (< -38 dB, >= 0.15 s), adjacent ones merged
pz = []; i = 0
while i < len(db):
    if db[i] < -38:
        j = i
        while j < len(db) and db[j] < -38: j += 1
        if (j - i) * 0.005 >= 0.15: pz.append([i * 0.005, j * 0.005])
        i = j
    else: i += 1
mg = []
for p in pz:
    if mg and p[0] - mg[-1][1] < 0.12: mg[-1][1] = p[1]
    else: mg.append(p)
out = []
for i, l in enumerate(lines):
    out.append({"i": i, "text": l, "start": None, "end": None})
out[0]["start"] = max(0.0, first[0] - 0.05)
for i in range(len(lines) - 1):
    cand = [p for p in mg if p[0] >= last[i] - 0.35 and p[0] <= last[i] + 1.0]
    if cand: p = min(cand, key=lambda p: abs(p[0] - last[i])); out[i]["end"] = round(p[0], 3); out[i + 1]["start"] = round(p[1], 3)
    else: mid = (last[i] + first[i + 1]) / 2; out[i]["end"] = round(mid - 0.05, 3); out[i + 1]["start"] = round(mid + 0.05, 3); print("no pause between", i, i + 1)
out[-1]["end"] = round(min(len(y) / sr, last[len(lines) - 1] + 0.1), 3)
json.dump(out, open(D + "lines.json", "w"), ensure_ascii=False, indent=1)
print(len(out), "lines; matched tokens", len(m), "/", len(toks), "; duration", round(len(y) / sr, 2))
for o in out: print(o["i"], o["start"], o["end"], o["text"][:42])
