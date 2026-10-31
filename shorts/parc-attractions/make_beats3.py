"""v3 beat sheet. ONE continuous camera journey (no cuts, no flashes). Every overlay is anchored on the exact spoken word (offset 0)."""
import json, math, re
D = "v3/voice/"
lines = json.load(open(D + "lines.json")); WD = json.load(open(D + "words.json"))
norm = lambda t: re.sub(r"[^\w%]", "", t.lower().replace("’", "'"))
byl = {}
for x in WD: byl.setdefault(x["line"], []).append(x)
s = lambda i, o=0.0: round(lines[i]["start"] + o, 2)
e = lambda i, o=0.0: round(lines[i]["end"] + o, 2)
def w(i, word, which=0, o=0.0):
    hits = [x for x in byl[i] if norm(word) in norm(x["t"])]
    if len(hits) <= which: raise SystemExit(f"{word!r}#{which} not in line {i}: {[x['t'] for x in byl[i]]}")
    return round(hits[which]["s"] + o, 2)
DUR = round(lines[-1]["end"] + 0.75, 2)
SPACING = 46
ORDER = ["ticket", "pie", "items", "coins", "teddy", "bars", "visitor", "loop", "ride", "cal1", "night", "cal2", "balance", "final"]
FIRST = dict(ticket=0, pie=1, items=2, coins=3, teddy=4, bars=5, visitor=6, loop=7, ride=8, cal1=10, night=12, cal2=13, balance=14, final=15)
LAST = dict(ticket=0, pie=1, items=2, coins=3, teddy=4, bars=5, visitor=6, loop=7, ride=9, cal1=11, night=12, cal2=13, balance=14, final=17)
B = {"dur": DUR, "times": {}, "heroes": {}, "notes": [], "kws": [], "panels": [], "stamps": [], "cuts": [], "order": ORDER, "spacing": SPACING}
T = B["times"]
def hero(name, a, b): B["heroes"].setdefault(name, []).append([a, b])
def note(t0, t1, text, kind, anchor, dx=0, dy=-95): B["notes"].append(dict(t0=t0, t1=t1, text=text, kind=kind, anchor=anchor, dx=dx, dy=dy))
def kw(t0, t1, text, color="gold", rot=-2): B["kws"].append(dict(t0=t0, t1=t1, text=text, color=color, rot=rot))
def panel(t0, t1, pid, y=760, o=None): B["panels"].append(dict(t0=t0, t1=t1, id=pid, y=y, o=o))
def stamp(t0, t1, text, kind, x=540, y=470, rot=-3): B["stamps"].append(dict(t0=t0, t1=t1, text=text, kind=kind, x=x, y=y, rot=rot))

# ---- heroes (one per place) ----
for n in ORDER: hero(n, 0.0 if n == "ticket" else s(FIRST[n]), e(LAST[n], 0.1) if n != "final" else DUR + 2)
# ---- camera journey ----
# name: (angle0, angle1, radius0, radius1, height0, height1, target_y)
ORB = dict(ticket=(0.6, -0.1, 22, 17, 5.5, 5.5, 4.2), pie=(0.9, -0.6, 25, 19, 10, 8, 1.4), items=(0.5, -0.6, 11, 8.5, 4, 3, 2.6), coins=(0.4, -0.5, 14, 11, 5, 5, 2.8),
           teddy=(-0.4, 0.7, 15, 11, 6, 5, 3.5), bars=(0.35, -0.5, 21, 17, 6.5, 6.5, 3.2), visitor=(0.9, -0.2, 21, 17, 6.5, 6.5, 2.4), loop=(-0.5, 0.5, 20, 16, 6, 6, 4.0),
           ride=(0.5, 1.6, 26, 17, 10, 6.5, 4.5), cal1=(0.15, -0.6, 22, 16, 8, 5.5, 2.6), night=(0.6, -0.3, 27, 22, 8, 8, 2.6), cal2=(-0.3, 0.45, 20, 16, 7.5, 7.5, 3.0),
           balance=(0.5, -0.5, 26, 20, 8, 8, 3.4), final=(0.3, 1.3, 24, 18, 8, 6.5, 4.0))
START = {n: (0.0 if n == "ticket" else s(FIRST[n])) for n in ORDER}
END = {n: (START[ORDER[i + 1]] if i + 1 < len(ORDER) else DUR) for i, n in enumerate(ORDER)}
def state(name, t):
    a0, a1, r0, r1, h0, h1, ty = ORB[name]; u = min(1, max(0, (t - START[name]) / max(0.01, END[name] - START[name])))
    k = u * u * (3 - 2 * u) * 0.35 + u * 0.65          # almost-linear, soft ends
    cz = -SPACING * ORDER.index(name); a = a0 + (a1 - a0) * k; r = r0 + (r1 - r0) * k; h = h0 + (h1 - h0) * k
    return (r * math.sin(a), h, cz + r * math.cos(a)), (0.0, ty, cz)
GL = 1.2   # glide length
def cam(t):
    i = 0
    for j, n in enumerate(ORDER):
        if t >= START[n] - GL + 0.35: i = j
    n = ORDER[i]; p, l = state(n, t)
    if i > 0:
        pn, ln = state(ORDER[i - 1], START[n])  # previous place frozen at the handoff... keep orbiting a bit instead
        pn, ln = state(ORDER[i - 1], min(t, END[ORDER[i - 1]]))
        g = min(1, max(0, (t - (START[n] - GL + 0.35)) / GL)); g = g * g * g * (g * (g * 6 - 15) + 10)
        p = tuple(pn[q] + (p[q] - pn[q]) * g for q in range(3)); l = tuple(ln[q] + (l[q] - ln[q]) * g for q in range(3))
    return p, l
B["cam"] = []; t = 0.0
while t <= DUR + 1e-6:
    p, l = cam(t); B["cam"].append([round(t, 3)] + [round(x, 3) for x in p + l]); t += 1 / 30
B["fov"] = 42
T["whoosh"] = s(10) - 0.55   # one single big subject change: from the economics of the visit to the calendar weakness

# ---- overlays, all exactly on the spoken word ----
# L0 ticket
note(w(0, "entrée"), e(0), "ENTRÉE", "gold", "gate", 0, -90); note(w(0, "billet"), e(0, 0.2), "BILLET", "white", "ticket", 170, -20); kw(w(0, "billet"), e(0, 0.25), "BILLET", "gold")
# L1 pie 55 / 45
T["pie_out"] = w(1, "moitié")
stamp(w(1, "estimations"), e(1, -0.2), "ORDRE DE GRANDEUR", "blue", 540, 420)
note(w(1, "moitié"), e(1), "BILLET 55 %", "gold", "pie_gold", -150, -120); note(w(1, "laisserez"), e(1), "LE RESTE 45 %", "blue", "pie_cyan", 170, -60); kw(w(1, "moitié"), e(1, 0.1), "55 %", "gold")
# L2 four objects, one on each word
items = [("repas", "burger", "REPAS"), ("boisson", "cup", "BOISSON"), ("souvenir", "teddy", "SOUVENIR"), ("photo", "camera", "PHOTO")]
B["heroes"]["items"] = [[s(2), e(2, 0.1)]]
for k, (word, key, label) in enumerate(items):
    t0 = w(2, word); t1 = w(2, items[k + 1][0]) if k < 3 else e(2, 0.15)
    B["heroes"]["item_" + key] = [[t0, t1]]; note(t0, t1, label, "gold", "item", 0, -170); kw(t0, t1, label, "gold" if k % 2 == 0 else "white", -2 if k % 2 == 0 else 2)
# L3 margin
note(w(3, "marge"), e(3, 0.1), "LA MARGE", "green", "coins", 0, -190); kw(w(3, "marge"), e(3, 0.2), "MARGE", "green")
# L4 18 %
stamp(w(4, "américaine"), e(4, -0.1), "ANALYSE US · 2004", "blue", 540, 1180)
note(w(4, "marchandises"), e(4), "COÛT DE LA MARCHANDISE", "red", "teddy", 0, -120); panel(w(4, "coûtent"), e(4, 0.1), "p2", 760); kw(w(4, "18"), e(4, 0.2), "18 %", "red")
# L5 bars
T["bar1"] = w(5, "France"); T["bar2"] = w(5, "restauration"); T["bar3"] = w(5, "boutiques")
note(T["bar1"], e(5, -0.1), "BILLET ≈ 57 %", "gold", "bar_gold", 0, -75); note(T["bar2"], e(5, -0.1), "RESTAURATION 21 %", "blue", "bar_cyan", 0, -75); note(T["bar3"], e(5, -0.1), "BOUTIQUES 9 %", "green", "bar_pink", 0, -75)
stamp(w(5, "étude"), e(5, -0.1), "SOURCE SECONDAIRE", "red", 540, 1250); kw(w(5, "21"), T["bar3"], "21 %", "blue"); kw(w(5, "9"), e(5, 0.2), "9 %", "green", 2)
# L6
note(w(6, "visiteur"), e(6, 0.1), "PAR VISITEUR", "gold", "visitor", 0, -150); kw(w(6, "beaucoup"), e(6, 0.2), "BEAUCOUP", "gold")
# L7
note(w(7, "revenir"), e(7, 0.2), "REVENIR", "green", "loop", 0, -150); kw(w(7, "revenir"), e(7, 0.35), "REVENIR", "green")
# L8 Futuroscope rule
T["ride_run"] = s(9)
note(w(8, "Futuroscope"), e(8), "FUTUROSCOPE", "white", "crane", 0, -110)
panel(w(8, "règle"), e(8, 0.3), "p4", 800, o=[w(8, "10") - w(8, "règle"), w(8, "20") - w(8, "règle"), w(8, "60") - w(8, "règle")])
kw(w(8, "10"), w(8, "20"), "10 %", "gold"); kw(w(8, "20"), w(8, "60"), "20 %", "blue", 2); kw(w(8, "60"), e(8, 0.2), "60 %", "green")
# L9 Parc Astérix
note(w(9, "environ"), e(9, 0.2), "≈ 10 % PAR AN", "green", "coaster", 0, -170); kw(w(9, "10"), e(9, 0.3), "≈ 10 %", "green")
# L10 weak point : calendar
note(w(10, "point"), e(10, 0.1), "POINT FAIBLE", "red", "cal_mid", 0, -190); kw(w(10, "calendrier"), e(10, 0.5), "CALENDRIER", "red")
# L11 85 % in 3.5 months
T["hot_on"] = w(11, "85")
note(w(11, "trois"), e(11, 0.2), "3,5 MOIS", "gold", "cal_summer", 0, -170); kw(w(11, "85"), e(11, 0.3), "85 %", "gold"); panel(w(11, "activité"), e(11, 0.3), "p5", 800)
# L12 fixed costs
note(w(12, "coûtent"), e(12), "COÛTS FIXES", "red", "night_cost", -90, -120); note(w(12, "caisses"), e(12, 0.2), "CAISSES VIDES", "red", "night_reg", 90, -60); kw(w(12, "coûtent"), e(12, 0.2), "COÛTS", "red")
# L13 rain
T["rain_on"] = w(13, "pluie")
stamp(w(13, "pluie"), e(13, -0.1), "ALÉA MÉTÉO", "red", 540, 420); kw(w(13, "pluie"), e(13, 0.3), "PLUIE", "blue")
# L14 spend per visitor
T["tilt"] = w(14, "compenser")
stamp(w(14, "rapport"), e(14, -0.1), "RAPPORT 2026", "blue", 540, 420); kw(w(14, "dépense"), e(14, 0.3), "DÉPENSE ↑", "green"); panel(w(14, "compenser", 0, -0.3), e(14, 0.3), "p6", 800)
# L15-17 conclusion
T["cross_on"] = w(15, "pas"); T["day_on"] = w(16, "journée"); T["crowd_on"] = s(17)
kw(w(15, "pas"), e(15, 0.3), "PAS DES MANÈGES", "red"); kw(w(16, "journée"), e(16, 0.3), "UNE JOURNÉE", "gold"); kw(w(17, "journée"), e(17, 0.2), "ELLE FAIT PAYER", "green")
T["brand"] = e(17, -0.9)
open("v3/video/assets/beats.js", "w").write("window.BEATS=" + json.dumps(B, ensure_ascii=False) + ";")
json.dump(B, open("v3/video/assets/beats.json", "w"), ensure_ascii=False)
print("dur", DUR, "cam keys", len(B["cam"]), "notes", len(B["notes"]), "kws", len(B["kws"]), "whoosh", T["whoosh"])
