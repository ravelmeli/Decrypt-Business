"""Exact word times: line boundaries are known by construction (lines.json); whisper words are only used for the inner distribution,
rescaled linearly into each line's exact [start,end], then snapped to the nearest acoustic onset (energy rise) within +-0.1 s."""
import json, re, difflib, wave, numpy as np
D = "v3/voice/"
lines = json.load(open(D + "lines.json")); wh = json.load(open(D + "transcript.json"))
wh = wh["words"] if isinstance(wh, dict) else wh
norm = lambda t: re.sub(r"[^\w]", "", t.lower().replace("’", "'"))
# whisper tokens, splitting "85%" into 85 pour cent
W = []
for x in wh:
    t = x["text"]
    if t.endswith("%"):
        n = t[:-1]; a, b = x["start"], x["end"]; d = (b - a) / 3
        W += [dict(t=norm(n), s=a, e=a + d), dict(t="pour", s=a + d, e=a + 2 * d), dict(t="cent", s=a + 2 * d, e=b)]
    else:
        W.append(dict(t=norm(t), s=x["start"], e=x["end"]))
# acoustic onset curve
w_ = wave.open(D + "voice.wav"); sr = w_.getframerate(); y = np.frombuffer(w_.readframes(w_.getnframes()), dtype=np.int16).astype(float) / 32768
hop = int(sr * 0.005); env = np.array([np.sqrt(np.mean(y[i:i + hop * 2] ** 2) + 1e-12) for i in range(0, len(y) - hop * 2, hop)]); db = 20 * np.log10(env + 1e-9)
rise = np.diff(db, prepend=db[0])
def snap(t, lo, hi):
    a, b = int(max(lo, t - 0.1) / 0.005), int(min(hi, t + 0.1) / 0.005)
    if b <= a: return t
    seg = rise[a:b]; k = int(np.argmax(seg))
    return t if seg[k] < 6 else (a + k) * 0.005
out = []; errs = []
wi = 0
for L in lines:
    toks = [t for t in re.findall(r"[\w'’]+|[.,:;!?]", L["text"].replace("-", " ")) if re.match(r"[\w]", t)]
    # keep punctuation attached later: rebuild display tokens from the text split on spaces
    disp = L["text"].split()
    sp = [norm(d) for d in disp]
    # whisper words belonging to this line: by time window
    ws = [x for x in W if x["s"] >= L["start"] - 0.35 and x["s"] < L["end"] + 0.05 and x["e"] <= L["end"] + 0.5]
    wn = [x["t"] for x in ws]
    sm = difflib.SequenceMatcher(None, sp, wn, autojunk=False); m = {}
    for a, b, n in sm.get_matching_blocks():
        for k in range(n): m[a + k] = ws[b + k]
    # script tokens with " pour cent" -> keep separate spoken tokens, but multiword like l'entrée have apostrophes -> single token ok
    st = [None] * len(disp)
    for k, x in m.items(): st[k] = x["s"]
    # linear interpolation for unmatched by char weight
    n = len(disp); known = [k for k in range(n) if st[k] is not None]
    if known:
        w0 = ws[0]["s"]; w1 = ws[-1]["e"]
        # rescale whisper range -> exact range
        sc = lambda t: L["start"] + (t - w0) / max(1e-6, (w1 - w0)) * (L["end"] - L["start"])
        for k in known: st[k] = sc(st[k])
    else:
        st = [L["start"] + (L["end"] - L["start"]) * k / n for k in range(n)]
    # fill unmatched
    for k in range(n):
        if st[k] is None:
            p = max([j for j in range(k) if st[j] is not None], default=None); q = min([j for j in range(k + 1, n) if st[j] is not None], default=None)
            t0 = st[p] if p is not None else L["start"]; t1 = st[q] if q is not None else L["end"]
            pi = p if p is not None else -1; qi = q if q is not None else n
            st[k] = t0 + (t1 - t0) * (k - pi) / (qi - pi)
    st[0] = L["start"] if abs(st[0] - L["start"]) < 0.25 else st[0]
    sn = []
    for k, t in enumerate(st):
        lo = (sn[-1] + 0.12) if sn else L["start"] - 0.02
        t2 = snap(t, lo, L["end"]); t2 = max(t2, lo); sn.append(t2); errs.append(abs(t2 - t))
    for k in range(n):
        e_ = sn[k + 1] if k + 1 < n else L["end"]
        out.append(dict(line=L["i"], t=disp[k], s=round(sn[k], 3), e=round(e_, 3), matched=k in m))
# merge "N pour cent" -> "N %"
M = []; i = 0
while i < len(out):
    if i + 2 < len(out) and out[i + 1]["t"].lower().startswith("pour") and out[i + 2]["t"].lower().startswith("cent") and re.match(r"\d", out[i]["t"]):
        M.append(dict(line=out[i]["line"], t=out[i]["t"] + " %" + re.sub(r"^cent", "", out[i + 2]["t"]).replace("cent", ""), s=out[i]["s"], e=out[i + 2]["e"], matched=out[i]["matched"])); i += 3
    else: M.append(out[i]); i += 1
json.dump(M, open(D + "words.json", "w"), ensure_ascii=False, indent=0)
open("v3/video/assets/words.js", "w").write("window.WORDS=" + json.dumps([[m["t"], m["s"], m["e"]] for m in M], ensure_ascii=False) + ";")
print(len(M), "words; matched", sum(m["matched"] for m in out), "/", len(out), "; mean snap shift", round(float(np.mean(errs)), 3), "max", round(float(max(errs)), 3))
for m in M[:14] + M[-6:]: print(m["line"], m["t"], m["s"], m["e"], m["matched"])
