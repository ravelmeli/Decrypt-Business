"""Resolve the beat sheet (notes, giant keywords, panels, stamps, camera shots, prop times) against the real word timings.
Reads transcript.json (word-level, from Whisper) and writes video/assets/beats.js (window.BEATS) + words.js."""
import json, re, sys
ROOT = "."
words = json.load(open(f"{ROOT}/transcript.json"))
norm = lambda t: re.sub(r"[^\w']", "", t.lower().replace("’", "'"))
# sentences end on a word that finishes with a dot
S = []; cur = []
for w in words:
    cur.append(w)
    if w["text"].endswith("."): S.append(cur); cur = []
if cur: S.append(cur)
print("sentences:", len(S))
def s(i, o=0.0): return round(S[i][0]["start"] + o, 2)
def e(i, o=0.0): return round(S[i][-1]["end"] + o, 2)
def w(i, word, o=0.0, which=0, end=False):
    hits = [x for x in S[i] if norm(x["text"]) == norm(word)]
    if not hits: raise SystemExit(f"word {word!r} not in sentence {i}: {[x['text'] for x in S[i]]}")
    x = hits[which]; return round((x["end"] if end else x["start"]) + o, 2)
DUR = round(words[-1]["end"] + 0.5, 2)

B = {"dur": DUR, "times": {}, "notes": [], "kws": [], "panels": [], "stamps": [], "shots": [], "cuts": []}
T = B["times"]
def note(t0, t1, text, kind, anchor, dx=0, dy=-110): B["notes"].append(dict(t0=t0, t1=t1, text=text, kind=kind, anchor=anchor, dx=dx, dy=dy))
def kw(t0, t1, text, color="gold", rot=-3): B["kws"].append(dict(t0=t0, t1=t1, text=text, color=color, rot=rot))
def panel(t0, t1, pid, y=560): B["panels"].append(dict(t0=t0, t1=t1, id=pid, y=y))
def stamp(t0, t1, text, kind, x, y, rot=-6): B["stamps"].append(dict(t0=t0, t1=t1, text=text, kind=kind, x=x, y=y, rot=rot))
def shot(t0, t1, p0, l0, p1=None, l1=None, fov=44, ease="l", cut=True):
    B["shots"].append(dict(t0=t0, t1=t1, p0=p0, l0=l0, p1=p1 or p0, l1=l1 or l0, fov=fov, ease=ease))
    if cut: B["cuts"].append(t0)

# ---- S0 : the ticket ----
T["gate"] = s(0, 0.0); T["ticket"] = s(0, 0.6); T["queue"] = s(0, 0.3)
shot(0.0, e(0, 0.05), [0, 2.4, 36], [0, 3, 14], [0, 2.0, 25], [0, 3.2, 14], 46, "io", cut=False)
note(s(0, 0.5), e(0, 0.1), "ENTRÉE", "gold", "gate", 0, -120)
note(w(0, "billet", -0.2), e(0, 0.2), "BILLET", "white", "ticket", 150, -40)
kw(w(0, "billet", -0.1), e(0, 0.2), "BILLET", "gold")
# ---- S1 : 55 % ----
shot(s(1, -0.05), e(1, 0.05), [-14, 24, 30], [0, 0, 6], [12, 22, 24], [0, 0, 4], 44, "io")
panel(s(1, 0.3), e(1, 0.0), "p1", 560)
kw(w(1, "moitié", -0.2), e(1, 0.0), "55 %", "gold")
stamp(s(1, 0.5), e(1, -0.2), "ORDRE DE GRANDEUR", "blue", 540, 480, -3)
# ---- S2 : repas, boisson, souvenir, photo (quick cuts) ----
items = [("repas", "burger", -5, 7, "REPAS", [-1.5, 2.5, 11], [-5, 1.2, 7]), ("boisson", "drink", -5, 2, "BOISSON", [-2.0, 2.4, 6], [-5, 1.2, 2]),
         ("souvenir", "gift", 5, 7, "SOUVENIR", [2.0, 2.6, 11], [5, 1.2, 7]), ("photo", "photo", 5, 2, "PHOTO", [1.5, 2.5, 6.5], [5, 1.2, 2])]
for k, (word, key, sx, sz, label, cp, cl) in enumerate(items):
    t0 = w(2, word, -0.15); t1 = (w(2, items[k + 1][0], -0.15) if k < 3 else e(2, 0.1))
    T["stall_" + key] = t0
    shot(t0, t1, [cp[0] + (-2 if sx < 0 else 2), cp[1] + 0.5, cp[2] + 3], cl, cp, cl, 48, "l")
    note(t0 + 0.1, t1 - 0.05, label, "gold", "stall_" + key, 0, -150)
    kw(t0, t1, label, "gold" if k % 2 == 0 else "white", -3 if k % 2 == 0 else 3)
# ---- S3 : the margin ----
T["cash"] = s(3, 0.0)
shot(s(3, -0.05), e(3, 0.1), [0, 6.5, 10], [0, 1.4, -3], [0, 3.2, 6], [0, 1.8, -3], 44, "io")
note(s(3, 0.6), e(3, 0.1), "LA MARGE", "green", "cash", 0, -150)
kw(w(3, "marge", -0.3), e(3, 0.1), "MARGE", "green")
# ---- S4 : 18 % (US analysis) ----
T["teddy"] = s(4, 0.0)
shot(s(4, -0.05), e(4, 0.05), [9, 3.6, 12.5], [5, 1.3, 7], [7, 2.6, 13.5], [5, 1.3, 7], 46, "io")
panel(s(4, 1.2), e(4, 0.0), "p2", 600)
stamp(s(4, 0.3), s(4, 4.5), "ANALYSE US · 2004", "blue", 540, 470, -4)
kw(w(4, "18", -0.2), e(4, 0.0), "18 %", "red")
note(s(4, 0.8), s(4, 4.8), "COÛT DE LA MARCHANDISE", "red", "teddy", 0, -150)
# ---- S5 : France 57 / 21 / 9 ----
shot(s(5, -0.05), e(5, 0.05), [-12, 10, 16], [0, 1, 4], [-8, 8, 12], [0, 1, 4], 44, "io")
panel(s(5, 0.4), e(5, 0.0), "p3", 560)
kw(w(5, "restauration", -0.2), w(5, "boutiques", -0.1), "21 %", "gold")
kw(w(5, "boutiques", -0.1), e(5, 0.1), "9 %", "red", 3)
stamp(s(5, 0.8), e(5, -0.3), "SOURCE SECONDAIRE", "red", 540, 470, -4)
# ---- S6 : gain per visitor ----
T["flow"] = s(6, 0.0)
shot(s(6, -0.05), e(6, 0.1), [-4, 2.2, 18], [0, 1.2, 8], [3.5, 2.4, 10], [0, 1.2, 4], 50, "io")
note(s(6, 0.5), e(6, 0.0), "PAR VISITEUR", "gold", "walker0", 0, -130)
kw(w(6, "beaucoup", -0.1), e(6, 0.1), "BEAUCOUP", "gold")
# ---- S7 : make them come back ----
shot(s(7, -0.05), e(7, 0.1), [3, 3.5, 30], [0, 2.5, 14], [0, 5.5, 34], [0, 2.5, 14], 46, "io")
note(s(7, 0.2), e(7, 0.2), "REVENIR", "green", "gate", 0, -120)
kw(w(7, "revenir", -0.3), e(7, 0.3), "REVENIR", "green")
# ---- S8 : Futuroscope rule 10 / 20 / 60 ----
T["build"] = s(8, 0.0)
shot(s(8, -0.05), e(9, 0.05), [16, 10, -2], [0, 3, -14], [6, 8, -4], [0, 3.5, -14], 46, "io")
panel(s(9, 0.2), e(9, 0.0), "p4", 600)
kw(w(9, "10", -0.2), w(9, "20", -0.2), "10 %", "gold")
kw(w(9, "20", -0.2), w(9, "60", -0.2), "20 %", "blue", 3)
kw(w(9, "60", -0.2), e(9, 0.1), "60 %", "green")
note(s(8, 0.2), e(8, 0.1), "FUTUROSCOPE", "white", "crane", 0, -120)
# ---- S9 : Parc Astérix ----
shot(s(10, -0.05), e(10, 0.1), [-10, 4.5, -4], [0, 3, -14], [-5, 3, -9], [0, 3, -14], 48, "io")
note(s(10, 0.3), e(10, 0.0), "≈ 10 % PAR AN", "green", "coaster", 0, -170)
kw(w(10, "10", -0.2), e(10, 0.1), "≈ 10 %", "green")
# ---- S10 : the calendar (weak point) ----
T["calendar"] = s(11, 0.0)
shot(s(11, -0.05), e(11, 0.05), [60, 6, 9], [60, 2, 0], [62, 5, 8], [60.5, 2.2, 0], 46, "io")
note(s(11, 0.4), e(11, 0.0), "POINT FAIBLE", "red", "cal_mid", 0, -200)
kw(w(11, "calendrier", -0.3), e(11, 0.2), "CALENDRIER", "red")
# ---- S11 : 85 % in 3.5 months ----
shot(s(12, -0.05), e(12, 0.05), [57, 4.5, 7], [60.6, 2.6, 0], [63.6, 5.5, 7], [60.8, 2.6, 0], 44, "io")
panel(s(12, 1.4), e(12, 0.0), "p5", 640)
note(s(12, 0.6), e(12, -0.2), "3,5 MOIS", "gold", "cal_summer", 0, -160)
kw(w(12, "85", -0.2), e(12, 0.1), "85 %", "gold")
# ---- S12 : the rest of the year ----
T["night"] = s(13, 0.0)
shot(s(13, -0.05), e(13, 0.05), [-10, 6, 20], [0, 2, 4], [-6, 5, 16], [0, 2, 4], 46, "io")
note(s(13, 0.5), e(13, 0.0), "COÛTS FIXES", "red", "ferris", 0, -250)
note(w(13, "caisses", -0.1), e(13, 0.2), "CAISSES VIDES", "red", "cash", 0, -150)
kw(w(13, "manèges", -0.2), e(13, 0.2), "COÛTS", "red")
# ---- S13 : rain ----
T["rain"] = s(14, 0.0)
shot(s(14, -0.05), e(14, 0.05), [0, 13, 30], [0, 2, 8], [4, 9, 24], [0, 2, 8], 46, "io")
stamp(w(14, "pluie", -0.3), e(14, 0.0), "ALÉA MÉTÉO", "red", 540, 470, -5)
kw(w(14, "pluie", -0.3), e(14, 0.2), "PLUIE", "blue")
# ---- S14 : spend per visitor compensates ----
T["spend"] = s(15, 0.0)
shot(s(15, -0.05), e(16, 0.05), [14, 12, 16], [0, 0.5, 4], [8, 9, 20], [0, 1, 4], 46, "io")
panel(s(16, 0.2), e(16, 0.0), "p6", 600)
stamp(s(16, 0.2), e(16, -0.2), "RAPPORT 2026", "blue", 540, 470, -4)
kw(w(15, "dépense", -0.2), e(16, 0.2), "DÉPENSE ↑", "green")
# ---- S15-17 : conclusion ----
T["finale"] = s(17, 0.0)
shot(s(17, -0.05), e(17, 0.05), [0, 7, 34], [0, 3, 12], [0, 5, 30], [0, 3, 12], 46, "io")
kw(w(17, "manèges", -0.3), e(17, 0.1), "PAS DES MANÈGES", "red")
shot(s(18, -0.05), e(18, 0.05), [-16, 9, 28], [0, 2, 8], [-10, 7, 24], [0, 2, 8], 46, "io")
kw(w(18, "journée", -0.3), e(18, 0.1), "UNE JOURNÉE", "gold")
shot(s(19, -0.05), DUR, [-18, 16, 40], [0, 1, 6], [-6, 26, 52], [0, 0, 4], 44, "io")
T["brand"] = s(19, 0.8)
json.dump(B, open(f"{ROOT}/video/assets/beats.json", "w"), ensure_ascii=False, indent=1)
open(f"{ROOT}/video/assets/beats.js", "w").write("window.BEATS=" + json.dumps(B, ensure_ascii=False) + ";")
open(f"{ROOT}/video/assets/words.js", "w").write("window.WORDS=" + json.dumps([[x["text"], round(x["start"], 2), round(x["end"], 2)] for x in words], ensure_ascii=False) + ";")
print("duration", DUR, "notes", len(B["notes"]), "kws", len(B["kws"]), "panels", len(B["panels"]), "shots", len(B["shots"]))
