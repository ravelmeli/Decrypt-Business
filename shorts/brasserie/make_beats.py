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
LOOP = 2.4
DUR = round(lines[-1]["end"] + 0.75 + LOOP, 2)
SPACING = 46
ORDER = ["brasserie", "invest", "materiel", "taxes", "marche", "recul", "marque", "verdict", "cta"]
FIRST = {"brasserie": 0, "invest": 1, "materiel": 3, "taxes": 5, "marche": 7, "recul": 9, "marque": 11, "verdict": 14, "cta": 16}
LAST = {"brasserie": 0, "invest": 2, "materiel": 4, "taxes": 6, "marche": 8, "recul": 10, "marque": 13, "verdict": 15, "cta": 17}
import math as _m
N_ = len(ORDER); RR = SPACING * N_ / (2 * _m.pi)
POS = {n: [round(RR * _m.sin(2 * _m.pi * i / N_), 2), round(-RR * (1 - _m.cos(2 * _m.pi * i / N_)), 2)] for i, n in enumerate(ORDER)}
B = {"pos": POS, "ringC": [0, round(-RR, 2)], "loop": LOOP, "dur": DUR, "times": {}, "heroes": {}, "notes": [], "kws": [], "panels": [], "stamps": [], "cuts": [], "order": ORDER, "spacing": SPACING}
T = B["times"]
def hero(name, a, b): B["heroes"].setdefault(name, []).append([a, b])
def note(t0, t1, text, kind, anchor, dx=0, dy=-95): B["notes"].append(dict(t0=t0, t1=t1, text=text, kind=kind, anchor=anchor, dx=dx, dy=dy))
def kw(t0, t1, text, color="gold", rot=-2, cnt=None):
    d = dict(t0=t0, t1=t1, text=text, color=color, rot=rot)
    if cnt: d["cnt"] = dict(cnt)
    B["kws"].append(d)
def panel(t0, t1, pid, y=760, o=None): B["panels"].append(dict(t0=t0, t1=t1, id=pid, y=y, o=o))
def stamp(t0, t1, text, kind, x=540, y=470, rot=-3): B["stamps"].append(dict(t0=t0, t1=t1, text=text, kind=kind, x=x, y=y, rot=rot))

# ---- heroes (one per place) ----
for n in ORDER: hero(n, 0.0 if n == "brasserie" else s(FIRST[n]), e(LAST[n], 0.1) if n != "cta" else DUR - LOOP + 0.4)
hero("brasserie", DUR - LOOP - 0.6, DUR + 3)
_o = (0.5, -0.4, 25, 20, 9, 9, 3.6)
ORB = {n: _o for n in ORDER}
ORB["cta"] = (0.3, -0.3, 22, 16, 7, 7, 5.5)
START = {n: (0.0 if n == "brasserie" else s(FIRST[n])) for n in ORDER}
END = {n: (START[ORDER[i + 1]] if i + 1 < len(ORDER) else DUR - LOOP) for i, n in enumerate(ORDER)}
# duel pans: the look-at (and the camera) slide sideways to the object being named
FOCUS = {}
def focus(name, *keys): FOCUS[name] = list(keys)
def foc(name, t):
    prev = (0.0, 0.0, 0.0); cur = (0.0, 0.0, 0.0)
    for k in FOCUS.get(name, []):
        if t < k[0]: break
        u = min(1, (t - k[0]) / 0.9); u = u * u * (3 - 2 * u)
        cur = tuple(prev[q] + (k[1 + q] - prev[q]) * u for q in range(3)); prev = tuple(k[1:4])
    return cur
def state(name, t):
    a0, a1, r0, r1, h0, h1, ty = ORB[name]; u = min(1, max(0, (t - START[name]) / max(0.01, END[name] - START[name])))
    k = u * u * (3 - 2 * u) * 0.35 + u * 0.65          # almost-linear, soft ends
    cx, cz = POS[name]; a = a0 + (a1 - a0) * k; r = r0 + (r1 - r0) * k; h = h0 + (h1 - h0) * k
    fx, fy, fz = foc(name, t)
    return (cx + fx * 0.8 + r * math.sin(a), h + fy * 0.5, cz + fz * 0.8 + r * math.cos(a)), (cx + fx, ty + fy, cz + fz)
GL = 1.2   # glide length
def smooth5(g): return g * g * g * (g * (g * 6 - 15) + 10)
def cam(t):
    tL0 = DUR - LOOP
    if t >= tL0 - 0.2:   # loop: glide from the last place back to the opening shot (frame 0)
        pn, ln = state(ORDER[-1], min(t, END[ORDER[-1]])); p0, l0 = state(ORDER[0], 0.0)
        g = smooth5(min(1, max(0, (t - (tL0 - 0.2)) / (LOOP - 0.15))))
        p = tuple(pn[q] + (p0[q] - pn[q]) * g for q in range(3)); l = tuple(ln[q] + (l0[q] - ln[q]) * g for q in range(3))
        return (p[0], p[1] + 9.0 * math.sin(math.pi * g), p[2]), l
    i = 0
    for j, n in enumerate(ORDER):
        if t >= START[n] - GL + 0.35: i = j
    n = ORDER[i]; p, l = state(n, t)
    if i > 0:
        pn, ln = state(ORDER[i - 1], min(t, END[ORDER[i - 1]]))
        g = smooth5(min(1, max(0, (t - (START[n] - GL + 0.35)) / GL)))
        p = tuple(pn[q] + (p[q] - pn[q]) * g for q in range(3)); l = tuple(ln[q] + (l[q] - ln[q]) * g for q in range(3))
        p = (p[0], p[1] + 9.0 * math.sin(math.pi * g), p[2])   # aerial hump
    return p, l
T["whoosh"] = s(7) - 0.55   # one single big subject change: from the market to the costs

# ---- overlays, all exactly on the spoken word ----
T["tank_on"] = s(0, 0.1); T["mug_on"] = w(0, "bière")
kw(w(0, "vendre"), w(0, "Mais"), "VENDRE", "gold"); kw(w(0, "rentable"), e(0, 0.4), "RENTABLE ?", "red")
note(w(0, "brasserie"), e(0, 0.2), "UNE BRASSERIE", "gold", "br_tank", 0, -60); note(T["mug_on"], e(0, 0.2), "LA BIÈRE", "gold", "br_mug", 0, -60)
T["small_on"] = w(1, "artisanal"); kw(w(1, "artisanal"), w(1, "dizaines"), "ARTISANAL", "gold"); kw(w(1, "dizaines"), w(1, "centaines"), "DIZAINES DE K€", "blue"); kw(w(1, "centaines"), e(1, 0.4), "CENTAINES DE K€", "gold")
note(T["small_on"], e(1, 0.2), "PETITE BRASSERIE", "blue", "in_small", 0, -60)
T["big_on"] = w(2, "industriel"); T["bigcoin_on"] = w(2, "118")
stamp(w(2, "Heineken"), w(2, "118"), "HEINEKEN FRANCE · MONS-EN-BARŒUL", "blue", 540, 1180)
kw(w(2, "118"), e(2, 0.4), "118 M€", "gold", cnt=dict(to=118, suf=" M€", t0=w(2, "118"), d=0.9)); note(T["big_on"], e(2, 0.2), "SITE INDUSTRIEL", "white", "in_big", 0, -60)
T["mat_on"] = s(3, 0.1); T["belt_on"] = w(3, "bouteille"); T["fix_on"] = w(3, "rentabiliser")
kw(w(3, "cuves"), w(3, "tuyaux"), "CUVES", "blue"); kw(w(3, "tuyaux"), w(3, "mise"), "TUYAUX", "blue"); kw(w(3, "mise"), w(3, "rentabiliser"), "BOUTEILLES", "blue"); kw(w(3, "rentabiliser"), e(3, 0.4), "À RENTABILISER", "red")
note(w(3, "cuves"), e(3, 0.2), "CUVES", "blue", "ma_tank", 0, -60); note(T["belt_on"], e(3, 0.2), "EMBOUTEILLAGE", "blue", "ma_belt", 0, -60); note(T["fix_on"], e(3, 0.2), "COÛTS FIXES", "red", "ma_fix", 0, -60)
T["run_on"] = w(4, "tourne"); T["spread_on"] = w(4, "répartissent")
kw(T["run_on"], w(4, "coûts"), "ÇA TOURNE", "green"); kw(w(4, "coûts"), T["spread_on"], "COÛTS FIXES", "red"); kw(T["spread_on"], e(4, 0.4), "RÉPARTIS", "green"); note(T["spread_on"], e(4, 0.2), "PLUS DE LITRES", "green", "ma_belt", 0, -60)
T["glass_on"] = s(5, 0.1); T["gov_on"] = w(5, "libre"); T["stream_on"] = w(5, "file")
kw(w(5, "prix"), w(5, "une"), "PRIX NON LIBRE", "red"); kw(w(5, "accises"), w(5, "TVA"), "ACCISES", "gold"); kw(w(5, "TVA"), e(5, 0.4), "TVA", "gold"); note(T["gov_on"], e(5, 0.2), "L'ÉTAT", "gold", "tx_gov", 0, -60)
T["low_on"] = w(6, "taux"); kw(w(6, "taux"), w(6, "petites"), "TAUX RÉDUIT", "green"); kw(w(6, "200"), e(6, 0.4), "≤ 200 000 hl", "gold", cnt=dict(to=200000, pre="≤ ", suf=" hl", t0=w(6, "200"), d=0.9)); note(T["low_on"], e(6, 0.2), "PETITES BRASSERIES", "green", "tx_small", 0, -60)
T["house_on"] = w(7, "compte"); T["whoosh_dummy"] = 0
stamp(w(7, "compte"), e(7, -0.1), "BRASSEURS DE FRANCE", "blue", 540, 1180)
kw(w(7, "2"), w(7, "record"), "2 500 BRASSERIES", "gold", cnt=dict(to=2500, suf=" BRASSERIES", t0=w(7, "2"), d=0.9)); kw(w(7, "record"), e(7, 0.4), "RECORD EUROPÉEN", "green"); note(T["house_on"], e(7, 0.2), "BRASSERIES", "white", "mk_houses", 0, -60)
T["price_on"] = w(8, "deux"); T["pie_on"] = w(8, "pèse")
kw(w(8, "artisanale"), w(8, "deux"), "ARTISANALE", "gold"); kw(w(8, "deux"), w(8, "mais"), "2 À 3 × PLUS CHER", "gold"); kw(w(8, "10"), e(8, 0.4), "≈ 10 % DU VOLUME", "blue")
note(T["price_on"], e(8, 0.2), "PRIX ×2-3", "gold", "mk_coin", 0, -60); note(T["pie_on"], e(8, 0.2), "≈ 10 %", "blue", "mk_pie", 0, -60)
T["d22_on"] = s(9, 0.1); T["d24_on"] = w(9, "baissé")
kw(w(9, "recule"), w(9, "ventes"), "RECULE", "red"); stamp(w(9, "ventes"), w(9, "7"), "BRASSEURS DE FRANCE · 2022-2024", "blue", 540, 1180)
kw(w(9, "7"), e(9, 0.4), "−7,5 %", "red", cnt=dict(to=7.5, dec=1, pre="−", suf=" %", t0=w(9, "7"), d=0.9))
note(w(9, "2022"), e(9, 0.2), "2022", "gold", "rc_22", 0, -60); note(w(9, "2024"), e(9, 0.3), "2024", "red", "rc_24", 0, -60)
T["shelf_on"] = s(10, 0.1); kw(w(10, "battre"), w(10, "comptoir"), "SE BATTRE", "red"); kw(w(10, "comptoir"), e(10, 0.4), "LE COMPTOIR", "gold"); note(w(10, "comptoir"), e(10, 0.2), "PLACE EN RAYON", "blue", "rc_shelf", 0, -60)
T["brand_on"] = s(11, 0.2); T["pick_on"] = w(11, "choisir")
kw(w(11, "compte"), w(11, "brasser"), "CE QUI COMPTE", "gold"); kw(T["pick_on"], e(11, 0.4), "SE FAIRE CHOISIR", "gold"); note(T["pick_on"], e(11, 0.2), "LA MARQUE", "gold", "mq_brand", 0, -60)
T["run_on2"] = w(12, "tourner")
kw(w(12, "marque"), w(12, "redemandent"), "UNE MARQUE", "gold"); kw(w(12, "redemandent"), T["run_on2"], "REDEMANDÉE", "green"); kw(T["run_on2"], e(12, 0.4), "CUVES EN MARCHE", "green")
note(w(12, "redemandent"), e(12, 0.2), "ILS EN REDEMANDENT", "gold", "mq_fans", 0, -60); note(T["run_on2"], e(12, 0.2), "CUVES", "green", "mq_tank", 0, -60)
T["idle_on"] = w(13, "litres"); kw(w(13, "Sans"), w(13, "beaux"), "SANS MARQUE", "red"); kw(T["idle_on"], e(13, 0.4), "STOCK QUI DORT", "red"); note(T["idle_on"], e(13, 0.2), "INVENDUS", "red", "mq_stock", 0, -60)
T["ver_on"] = s(14, 0.1); T["heavy_on"] = w(14, "coûts")
kw(w(14, "marque"), T["heavy_on"], "UNE MARQUE", "gold"); kw(T["heavy_on"], w(14, "amortir"), "COÛTS FIXES", "red"); kw(w(14, "amortir"), e(14, 0.4), "À AMORTIR", "gold")
note(T["heavy_on"], e(14, 0.2), "COÛTS FIXES", "red", "vd_weight", 0, -60); note(s(14, 0.4), w(14, "coûts"), "LE MARCHÉ", "blue", "vd_wave", 0, -60)
T["down_on"] = w(15, "baisse"); kw(T["down_on"], w(15, "personne"), "MARCHÉ ↓", "red"); kw(w(15, "garantit"), e(15, 0.4), "MARGE NON GARANTIE", "red"); note(T["down_on"], e(15, 0.2), "MARCHÉ EN BAISSE", "red", "vd_arrow", 0, -60)
T["bubble_on"] = s(16, 0.2); T["button_on"] = w(17, "abonnez"); T["press"] = w(17, "Decrypt")
note(w(16, "ouvririez"), e(16, 0.1), "OUVRIR OU RACHETER ?", "gold", "bubble", 0, -70); kw(w(16, "Dites"), e(16, 0.5), "COMMENTEZ", "gold")
kw(T["button_on"], e(17, 0.4), "ABONNEZ-VOUS", "red")
T["brand"] = e(17, -0.9)
B["cam"] = []; t = 0.0
while t <= DUR + 1e-6:
    p, l = cam(t); B["cam"].append([round(t, 3)] + [round(x, 3) for x in p + l]); t += 1 / 30
B["fov"] = 42
open("video/assets/beats.js", "w").write("window.BEATS=" + json.dumps(B, ensure_ascii=False) + ";")
json.dump(B, open("video/assets/beats.json", "w"), ensure_ascii=False)
print("dur", DUR, "cam keys", len(B["cam"]), "notes", len(B["notes"]), "kws", len(B["kws"]), "whoosh", T["whoosh"])
