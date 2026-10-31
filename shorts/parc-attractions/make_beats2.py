"""v2 beat sheet: one clean hero subject per idea (reference style), annotations, giant keywords, panels, stamps, camera orbits.
Resolves everything against the real Whisper word timings and writes v2/video/assets/beats.js/json."""
import json, math, re
words = json.load(open("transcript.json"))
norm = lambda t: re.sub(r"[^\w']", "", t.lower().replace("’", "'"))
S = []; cur = []
for w_ in words:
    cur.append(w_)
    if w_["text"].endswith("."): S.append(cur); cur = []
if cur: S.append(cur)
assert len(S) == 20, len(S)
s = lambda i, o=0.0: round(S[i][0]["start"] + o, 2)
e = lambda i, o=0.0: round(S[i][-1]["end"] + o, 2)
def w(i, word, o=0.0, which=0):
    hits = [x for x in S[i] if norm(x["text"]) == norm(word)]
    if not hits: raise SystemExit(f"{word!r} not in sentence {i}")
    return round(hits[which]["start"] + o, 2)
DUR = round(words[-1]["end"] + 0.5, 2)
B = {"dur": DUR, "times": {}, "heroes": {}, "notes": [], "kws": [], "panels": [], "stamps": [], "shots": [], "cuts": []}
T = B["times"]
def hero(name, *wins): B["heroes"][name] = [list(x) for x in wins]
def note(t0, t1, text, kind, anchor, dx=0, dy=-110): B["notes"].append(dict(t0=t0, t1=t1, text=text, kind=kind, anchor=anchor, dx=dx, dy=dy))
def kw(t0, t1, text, color="gold", rot=-3): B["kws"].append(dict(t0=t0, t1=t1, text=text, color=color, rot=rot))
def panel(t0, t1, pid, y=640): B["panels"].append(dict(t0=t0, t1=t1, id=pid, y=y))
def stamp(t0, t1, text, kind, x=540, y=470, rot=-4): B["stamps"].append(dict(t0=t0, t1=t1, text=text, kind=kind, x=x, y=y, rot=rot))
def shot(t0, t1, p0, l0, p1=None, l1=None, fov=40, cut=True):
    B["shots"].append(dict(t0=t0, t1=t1, p0=p0, l0=l0, p1=p1 or p0, l1=l1 or l0, fov=fov, ease="io"))
    if cut: B["cuts"].append(t0)
def orbit(t0, t1, a0, a1, r, h, tgt=(0, 2.5, 0), fov=40, r1=None, h1=None, cut=True):
    r1 = r if r1 is None else r1; h1 = h if h1 is None else h1
    P = lambda a, rr, hh: [round(tgt[0] + rr * math.sin(a), 2), hh, round(tgt[2] + rr * math.cos(a), 2)]
    shot(t0, t1, P(a0, r, h), list(tgt), P(a1, r1, h1), list(tgt), fov, cut)
def halves(i, a, b, r, h, tgt=(0, 2.5, 0), fov=40):
    mid = round((s(i) + e(i)) / 2, 2)
    orbit(s(i, -0.05), mid, a, (a + b) / 2, r, h, tgt, fov); orbit(mid, e(i, 0.05), (a + b) / 2 + 0.9, b + 0.9, r * 0.72, h * 0.75, tgt, fov)

# S0 : the ticket
hero("ticket", [0.0, e(0, 0.2)])
orbit(0.0, e(0, 0.1), 0.7, -0.15, 22, 5.5, (0, 4.2, 0), 42, cut=False)
note(0.5, e(0, 0.1), "ENTRÉE", "gold", "gate", 0, -110); note(w(0, "billet", -0.25), e(0, 0.2), "BILLET", "white", "ticket", 190, -30)
kw(w(0, "billet", -0.1), e(0, 0.2), "BILLET", "gold")
# S1 : the pie, 55 %
hero("pie", [s(1, -0.05), e(1, 0.15)]); halves(1, 0.9, -0.6, 25, 10, (0, 1.4, 0), 40)
note(s(1, 0.8), e(1, 0.0), "BILLET 55 %", "gold", "pie_gold", 0, -140); note(s(1, 2.2), e(1, 0.0), "LE RESTE 45 %", "blue", "pie_cyan", 0, -120)
kw(w(1, "moitié", -0.2), e(1, 0.1), "55 %", "gold"); stamp(s(1, 0.4), s(1, 2.6), "ORDRE DE GRANDEUR", "blue")
# S2 : repas, boisson, souvenir, photo : one object at a time
names = [("repas", "burger", "REPAS"), ("boisson", "cup", "BOISSON"), ("souvenir", "teddy", "SOUVENIR"), ("photo", "camera", "PHOTO")]
for k, (word, key, label) in enumerate(names):
    t0 = w(2, word, -0.15); t1 = w(2, names[k + 1][0], -0.15) if k < 3 else e(2, 0.15)
    hero("item_" + key, [t0, t1]); orbit(t0, t1, 0.5 + k * 1.3, 0.1 + k * 1.3 - 0.9, 8.5, 3.0, (0, 2.3, 0), 42)
    note(t0 + 0.1, t1 - 0.05, label, "gold", "item", 0, -170); kw(t0, t1, label, "gold" if k % 2 == 0 else "white", -3 if k % 2 == 0 else 3)
# S3 : the margin
hero("coins", [s(3, -0.05), e(3, 0.15)]); orbit(s(3, -0.05), e(3, 0.1), 0.4, -0.5, 14, 5, (0, 2.8, 0), 42)
note(s(3, 0.6), e(3, 0.1), "LA MARGE", "green", "coins", 0, -190); kw(w(3, "marge", -0.3), e(3, 0.15), "MARGE", "green")
# S4 : 18 %
hero("teddy", [s(4, -0.05), e(4, 0.15)]); halves(4, -0.4, 0.9, 12, 5.5, (0, 0.2, 0), 40)
panel(s(4, 1.2), e(4, 0.0), "p2", 760); stamp(s(4, 0.3), s(4, 4.6), "ANALYSE US · 2004", "blue", 540, 470, -4)
note(s(4, 0.8), s(4, 4.8), "COÛT DE LA MARCHANDISE", "red", "teddy", 0, -140); kw(w(4, "18%", -0.2), e(4, 0.1), "18 %", "red")
# S5 : France, restauration 21 %, boutiques 9 %
hero("bars", [s(5, -0.05), e(5, 0.15)]); halves(5, 0.35, -0.5, 19, 6.5, (0, 3.2, 0), 42)
note(s(5, 0.5), e(5, -0.2), "BILLET 57 %", "gold", "bar_gold", 0, -80)
note(w(5, "restauration", -0.1), e(5, -0.2), "RESTAURATION 21 %", "blue", "bar_cyan", 0, -80); note(w(5, "boutiques", -0.1), e(5, -0.2), "BOUTIQUES 9 %", "green", "bar_pink", 0, -80)
kw(w(5, "restauration", -0.2), w(5, "boutiques", -0.1), "21 %", "blue"); kw(w(5, "boutiques", -0.1), e(5, 0.15), "9 %", "green", 3)
stamp(s(5, 0.8), e(5, -0.3), "SOURCE SECONDAIRE", "red", 540, 1290, -4)
# S6 : gain per visitor
hero("visitor", [s(6, -0.05), e(6, 0.15)]); orbit(s(6, -0.05), e(6, 0.1), 0.9, -0.2, 21, 6.5, (0, 2.4, 0), 42)
note(s(6, 0.5), e(6, 0.0), "PAR VISITEUR", "gold", "visitor", 0, -150); kw(w(6, "beaucoup", -0.1), e(6, 0.15), "BEAUCOUP", "gold")
# S7 : make them come back
hero("loop", [s(7, -0.05), e(7, 0.2)]); orbit(s(7, -0.05), e(7, 0.2), -0.5, 0.5, 18, 5.5, (0, 3.2, 0), 42)
note(s(7, 0.2), e(7, 0.2), "REVENIR", "green", "loop", 0, -150); kw(w(7, "revenir", -0.3), e(7, 0.3), "REVENIR", "green")
# S8-9 : Futuroscope rule, a new ride is built
T["build"] = s(8)
hero("coaster_build", [s(8, -0.05), e(9, 0.2)]); orbit(s(8, -0.05), e(8, 0.1), 0.5, 0.9, 26, 10, (0, 4.5, 0), 42)
orbit(s(9, 0.0), s(9, 3.4), 1.0, 1.7, 22, 8, (0, 4.5, 0), 42); orbit(s(9, 3.4), e(9, 0.2), 1.7, 2.6, 17, 6.5, (0, 4.2, 0), 42)
note(s(8, 0.2), e(8, 0.1), "FUTUROSCOPE", "white", "crane", 0, -120); panel(s(9, 0.2), e(9, 0.0), "p4", 780)
kw(w(9, "10%", -0.2), w(9, "20%", -0.2), "10 %", "gold"); kw(w(9, "20%", -0.2), w(9, "60%", -0.2), "20 %", "blue", 3); kw(w(9, "60%", -0.2), e(9, 0.15), "60 %", "green")
# S10 : Parc Astérix
hero("coaster", [s(10, -0.05), e(10, 0.15)]); orbit(s(10, -0.05), e(10, 0.1), -0.6, 0.6, 21, 6, (0, 4.2, 0), 42)
note(s(10, 0.3), e(10, 0.0), "≈ 10 % PAR AN", "green", "coaster", 0, -170); kw(w(10, "10%", -0.2), e(10, 0.15), "≈ 10 %", "green")
# S11-12 : the calendar, 85 % in 3.5 months
T["calendar"] = s(11)
hero("calendar", [s(11, -0.05), e(12, 0.15)]); orbit(s(11, -0.05), e(11, 0.1), 0.15, -0.1, 22, 8, (0, 2.2, 0), 42)
orbit(s(12, -0.05), s(12, 3.6), -0.55, -0.15, 15, 5.5, (0.8, 2.6, 0), 42); orbit(s(12, 3.6), e(12, 0.15), -0.15, 0.4, 20, 8, (0, 2.4, 0), 42)
note(s(11, 0.4), e(11, 0.0), "POINT FAIBLE", "red", "cal_mid", 0, -190); kw(w(11, "calendrier", -0.3), e(11, 0.2), "CALENDRIER", "red")
panel(s(12, 1.4), e(12, 0.0), "p5", 780); note(s(12, 0.6), e(12, -0.2), "3,5 MOIS", "gold", "cal_summer", 0, -170); kw(w(12, "85%", -0.2), e(12, 0.15), "85 %", "gold")
# S13 : the rest of the year (night, fixed costs)
T["night"] = s(13)
hero("night", [s(13, -0.05), e(13, 0.15)]); orbit(s(13, -0.05), e(13, 0.1), 0.6, -0.3, 27, 8, (0, 2.6, 0), 42)
panel(s(13, 1.0), e(13, 0.0), "p7", 780); note(s(13, 0.4), e(13, 0.0), "COÛTS FIXES", "red", "night_cost", 0, -120)
note(w(13, "caisses", -0.1), e(13, 0.2), "CAISSES VIDES", "red", "night_reg", 0, -110); kw(w(13, "manèges", -0.2), e(13, 0.2), "COÛTS", "red")
# S14 : rain on summer weekends
T["rain"] = s(14)
hero("calendar", [s(11, -0.05), e(12, 0.15)], [s(14, -0.05), e(14, 0.2)])
orbit(s(14, -0.05), e(14, 0.1), -0.3, 0.45, 18, 7.5, (0, 3, 0), 42)
stamp(w(14, "pluie", -0.3), e(14, 0.0), "ALÉA MÉTÉO", "red"); kw(w(14, "pluie", -0.3), e(14, 0.2), "PLUIE", "blue")
# S15-16 : spend per visitor compensates
T["spend"] = s(15)
hero("balance", [s(15, -0.05), e(16, 0.15)]); orbit(s(15, -0.05), e(16, 0.05), 0.5, -0.5, 26, 8, (0, 3.4, 0), 42)
panel(s(16, 0.2), e(16, 0.0), "p6", 800); stamp(s(16, 0.2), e(16, -0.2), "RAPPORT 2026", "blue"); kw(w(15, "dépense", -0.2), e(16, 0.2), "DÉPENSE ↑", "green")
# S17-19 : conclusion
T["finale"] = s(17)
hero("final", [s(17, -0.05), DUR + 1])
orbit(s(17, -0.05), e(17, 0.05), 0.3, -0.4, 22, 7.5, (0, 3.5, 0), 42); kw(w(17, "manèges", -0.3), e(17, 0.1), "PAS DES MANÈGES", "red")
orbit(s(18, -0.05), e(18, 0.05), -0.6, 0.3, 20, 6.5, (0, 4.5, 0), 42); kw(w(18, "journée", -0.3), e(18, 0.1), "UNE JOURNÉE", "gold")
orbit(s(19, -0.05), DUR, 0.5, 1.5, 24, 9, (0, 3, 0), 40)
T["brand"] = s(19, 0.8); T["s18"] = s(18); T["s19"] = s(19)
open("v2/video/assets/beats.js", "w").write("window.BEATS=" + json.dumps(B, ensure_ascii=False) + ";")
json.dump(B, open("v2/video/assets/beats.json", "w"), ensure_ascii=False, indent=1)
print("dur", DUR, "heroes", len(B["heroes"]), "notes", len(B["notes"]), "kws", len(B["kws"]), "shots", len(B["shots"]), "cuts", len(B["cuts"]))
