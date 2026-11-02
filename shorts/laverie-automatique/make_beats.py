"""v3 beat sheet. ONE continuous camera journey (no cuts, no flashes). Every overlay is anchored on the exact spoken word (offset 0)."""
import json, math, re
D = "voice/"
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
ORDER = ["parc", "ca", "client", "couts", "energie", "marge", "budget", "roi", "pin", "temps", "cta"]
FIRST = dict(parc=0, ca=1, client=2, couts=3, energie=5, marge=7, budget=8, roi=9, pin=10, temps=11, cta=13)
LAST = dict(parc=0, ca=1, client=2, couts=4, energie=6, marge=7, budget=8, roi=9, pin=10, temps=12, cta=14)
B = {"dur": DUR, "times": {}, "heroes": {}, "notes": [], "kws": [], "panels": [], "stamps": [], "cuts": [], "order": ORDER, "spacing": SPACING}
T = B["times"]
def hero(name, a, b): B["heroes"].setdefault(name, []).append([a, b])
def note(t0, t1, text, kind, anchor, dx=0, dy=-95): B["notes"].append(dict(t0=t0, t1=t1, text=text, kind=kind, anchor=anchor, dx=dx, dy=dy))
def kw(t0, t1, text, color="gold", rot=-2): B["kws"].append(dict(t0=t0, t1=t1, text=text, color=color, rot=rot))
def panel(t0, t1, pid, y=760, o=None): B["panels"].append(dict(t0=t0, t1=t1, id=pid, y=y, o=o))
def stamp(t0, t1, text, kind, x=540, y=470, rot=-3): B["stamps"].append(dict(t0=t0, t1=t1, text=text, kind=kind, x=x, y=y, rot=rot))

# ---- heroes (one per place) ----
for n in ORDER: hero(n, 0.0 if n == "parc" else s(FIRST[n]), e(LAST[n], 0.1) if n != "cta" else DUR + 2)
ORB = dict(parc=(0.5, -0.4, 24, 19, 9, 9, 2.5), ca=(0.5, -0.4, 24, 19, 8, 8, 5.0), client=(0.4, -0.4, 24, 19, 8, 8, 3.8), couts=(0.5, -0.4, 24, 19, 8, 8, 3.4),
           energie=(0.5, -0.4, 24, 19, 8, 8, 4.8), marge=(0.4, -0.4, 24, 19, 9, 9, 2.0), budget=(0.4, -0.4, 24, 19, 8, 8, 2.8), roi=(0.4, -0.3, 24, 19, 8.5, 8.5, 4.2),
           pin=(0.5, -0.4, 24, 19, 8, 8, 5.2), temps=(0.4, -0.4, 24, 19, 8, 8, 5.0), cta=(0.3, -0.3, 22, 16, 7, 7, 5.5))
START = {n: (0.0 if n == "parc" else s(FIRST[n])) for n in ORDER}
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
        p = (p[0], p[1] + 9.0 * math.sin(math.pi * g), p[2])   # aerial hump: the camera rises while it glides, never skimming the stage props
    return p, l
B["cam"] = []; t = 0.0
while t <= DUR + 1e-6:
    p, l = cam(t); B["cam"].append([round(t, 3)] + [round(x, 3) for x in p + l]); t += 1 / 30
B["fov"] = 42
T["whoosh"] = s(3) - 0.55   # one single big subject change: from the market and the customers to the costs

# ---- overlays, all exactly on the spoken word ----
T["shops_on"] = s(0, 0.3); T["coin_on"] = w(0, "726")
note(w(0, "laveries"), e(0, 0.2), "LAVERIES", "blue", "pc_row", 0, -70); kw(w(0, "4"), T["coin_on"], "≈ 4 500", "gold"); note(T["coin_on"], e(0, 0.3), "726 M€ PAR AN", "gold", "pc_coin", 0, -60); kw(T["coin_on"], e(0, 0.4), "726 M€", "blue")
T["bar35"] = w(1, "35"); T["bar150"] = w(1, "150")
note(T["bar35"], e(1, 0.2), "≈ 35 000 € EN MOYENNE", "gold", "ca_low", 0, -60); note(T["bar150"], e(1, 0.2), "150 000 € LES MIEUX SITUÉES", "green", "ca_high", 0, -60); kw(T["bar35"], T["bar150"], "35 000 €", "gold"); kw(T["bar150"], e(1, 0.4), "150 000 €", "green")
T["price_on"] = w(2, "9,50"); T["week_on"] = w(2, "1,8", 1)
note(w(2, "18-35"), e(2, 0.2), "18-35 ANS", "white", "cl_cust", 0, -60); note(w(2, "passage"), e(2, 0.2), "PAR PASSAGE", "gold", "cl_tag", 0, -50); kw(T["price_on"], T["week_on"], "9,50 €", "gold"); kw(T["week_on"], e(2, 0.4), "1,8 / SEMAINE", "blue"); note(T["week_on"], e(2, 0.3), "PAR SEMAINE", "blue", "cl_week", 0, -60)
T["cv_rent"] = s(3, 0.3); T["cv_bolt"] = s(3, 1.5); T["loyer_on"] = w(3, "loyer"); T["energie_on"] = w(3, "énergie"); T["p30_on"] = w(4, "30")
note(T["loyer_on"], e(3, 0.2), "LOYER", "red", "co_rent", 0, -60); note(T["energie_on"], e(3, 0.2), "ÉNERGIE", "gold", "co_bolt", 0, -60); kw(T["loyer_on"], T["energie_on"], "LOYER", "red"); kw(T["energie_on"], e(3, 0.4), "ÉNERGIE", "gold")
stamp(w(4, "fabricant"), e(4, -0.1), "UN FABRICANT DE MACHINES", "blue", 540, 1180); note(T["p30_on"], e(4, 0.3), "30 % DU CA MAX", "red", "co_bar", 0, -60); kw(T["p30_on"], e(4, 0.4), "30 %", "red")
T["e800"] = w(5, "800"); T["e2400"] = w(5, "400", 0, -0.3); T["crack_on"] = w(6, "talon")
stamp(w(5, "Observatoire"), e(5, -0.1), "OBSERVATOIRE DE LA FRANCHISE", "blue", 540, 1180); note(w(5, "2022"), e(5, 0.2), "2022", "white", "en_low", 0, -60); note(w(5, "début"), e(5, 0.2), "DÉBUT 2024", "red", "en_high", 0, -60)
kw(T["e800"], T["e2400"], "800 €", "blue"); kw(T["e2400"], e(5, 0.4), "2 400 €", "red"); kw(T["crack_on"], e(6, 0.5), "TALON D'ACHILLE", "red")
T["m20"] = w(7, "20"); T["m35"] = w(7, "35")
note(w(7, "marge"), e(7, 0.2), "MARGE BRUTE", "green", "mg_pie", 0, -60); kw(T["m20"], e(7, 0.4), "20 À 35 %", "gold")
T["b50"] = w(8, "50"); T["b100"] = w(8, "100")
note(w(8, "budget"), e(8, 0.2), "BUDGET", "white", "bu_wm", 0, -60); kw(T["b50"], e(8, 0.4), "50 À 100 K€", "gold"); note(T["b50"], e(8, 0.3), "À L'OUVERTURE", "gold", "bu_pile", 0, -60)
T["y3"] = w(9, "trois"); T["y6"] = w(9, "six")
note(w(9, "retour"), e(9, 0.2), "RETOUR SUR INVESTISSEMENT", "green", "ro_row", 0, -60); kw(T["y3"], e(9, 0.4), "3 À 6 ANS", "gold")
T["pin_vis"] = s(10, 0.3); T["pin_on"] = w(10, "emplacement"); T["low_on"] = w(10, "bas"); T["flow_on"] = w(10, "passage")
kw(T["pin_on"], T["low_on"], "EMPLACEMENT", "gold"); note(T["low_on"], e(10, 0.2), "LOYER BAS", "green", "pn_tag", 0, -60); note(T["flow_on"], e(10, 0.3), "PASSAGE", "blue", "pn_flow", 0, -60); kw(T["low_on"], e(10, 0.4), "LOYER BAS", "green")
T["cross_on"] = w(11, "pas"); T["time_on"] = w(12, "temps"); T["place_on"] = w(12, "local")
kw(T["cross_on"], e(11, 0.4), "PAS SEULEMENT", "red"); note(w(11, "lavage"), e(11, 0.3), "LAVAGE", "gold", "tm_washer", 0, -60)
kw(T["time_on"], T["place_on"], "DU TEMPS", "gold"); kw(T["place_on"], e(12, 0.4), "BIEN PLACÉ", "green"); note(T["time_on"], e(12, 0.2), "TEMPS DE MACHINE", "gold", "tm_clock", 0, -60); note(T["place_on"], e(12, 0.3), "LOCAL BIEN PLACÉ", "white", "tm_pin", 0, -60)
T["bubble_on"] = w(13, "Selon"); T["button_on"] = w(14, "abonnez"); T["press"] = w(14, "Decrypt")
note(w(13, "bon"), e(13, 0.1), "BON INVESTISSEMENT ?", "gold", "bubble", 0, -70); kw(w(13, "Dites"), e(13, 0.5), "COMMENTEZ", "gold")
kw(T["button_on"], e(14, 0.4), "ABONNEZ-VOUS", "red")
T["brand"] = e(14, -0.9)
open("video/assets/beats.js", "w").write("window.BEATS=" + json.dumps(B, ensure_ascii=False) + ";")
json.dump(B, open("video/assets/beats.json", "w"), ensure_ascii=False)
print("dur", DUR, "cam keys", len(B["cam"]), "notes", len(B["notes"]), "kws", len(B["kws"]), "whoosh", T["whoosh"])
