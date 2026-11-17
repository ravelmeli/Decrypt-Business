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
ORDER = ["navire", "flotte", "cycle", "opex", "carburant", "port", "fret", "commandes", "surcap", "verdict", "cta"]
FIRST = dict(navire=0, flotte=2, cycle=4, opex=6, carburant=7, port=8, fret=9, commandes=12, surcap=14, verdict=15, cta=17)
LAST = dict(navire=1, flotte=3, cycle=5, opex=6, carburant=7, port=8, fret=11, commandes=13, surcap=14, verdict=16, cta=18)
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
for n in ORDER: hero(n, 0.0 if n == "navire" else s(FIRST[n]), e(LAST[n], 0.1) if n != "cta" else DUR - LOOP + 0.4)
hero("navire", DUR - LOOP - 0.6, DUR + 3)
_o = (0.5, -0.4, 25, 20, 9, 9, 3.6)
ORB = {n: _o for n in ORDER}
ORB["navire"] = (0.5, -0.4, 26, 21, 9, 9, 3.6); ORB["port"] = (0.4, -0.4, 25, 20, 9, 9, 4.0); ORB["fret"] = (0.4, -0.4, 25, 20, 9, 9, 4.2); ORB["commandes"] = (0.4, -0.4, 26, 21, 10, 10, 2.8); ORB["surcap"] = (0.4, -0.4, 25, 20, 9, 9, 3.6)
ORB["cta"] = (0.3, -0.3, 22, 16, 7, 7, 5.5)
START = {n: (0.0 if n == "navire" else s(FIRST[n])) for n in ORDER}
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
T["whoosh"] = s(6) - 0.55   # one single big subject change: from the market to the costs

# ---- overlays, all exactly on the spoken word ----
T["ship_on"] = s(0, 0.1); T["cont_on"] = s(0, 0.7); T["coin_on"] = w(0, "millions")
kw(w(0, "270"), e(0, 0.4), "270 M$", "gold", cnt=dict(to=270, suf=" M$", t0=w(0, "270"), d=0.9)); note(w(0, "neuf"), e(0, 0.3), "NEUF", "gold", "nv_ship", 0, -60)
stamp(w(1, "Clarksons"), e(1, -0.1), "CLARKSONS RESEARCH", "blue", 540, 1180)
kw(w(1, "22"), e(1, 0.5), "24 000 EVP", "blue", cnt=dict(to=24000, suf=" EVP", t0=w(1, "24"), d=0.7)); note(w(1, "prix"), e(1, 0.2), "PRIX MOYEN", "gold", "nv_coin", 0, -60)
T["fleet_on"] = s(2, 0.1); T["own_on"] = w(2, "possèdent"); T["rent_on"] = w(3, "louent")
kw(w(2, "partie"), e(2, 0.4), "UNE PARTIE", "gold"); note(T["own_on"], e(2, 0.2), "POSSÉDÉS", "gold", "fl_own", 0, -60)
kw(T["rent_on"], e(3, 0.4), "LE RESTE LOUÉ", "blue"); note(T["rent_on"], e(3, 0.3), "AFFRÉTÉS", "blue", "fl_rent", 0, -60)
T["cyc_on"] = s(4, 0.1); T["debt_on"] = w(5, "argent")
kw(w(4, "pari"), w(4, "cycle"), "UN PARI", "red"); kw(w(4, "cycle"), e(4, 0.4), "LE CYCLE", "gold"); note(w(4, "cycle"), e(4, 0.2), "HAUSSES ET BAISSES", "blue", "cy_wave", 0, -60)
kw(w(5, "emprunter"), e(5, 0.4), "EMPRUNTÉ", "red"); note(T["debt_on"], e(5, 0.2), "DETTE", "red", "cy_debt", 0, -60)
T["ops_on"] = s(6, 0.1); T["crew_on"] = w(6, "Équipage"); T["ass_on"] = w(6, "assurance"); T["ent_on"] = w(6, "entretien"); T["day_on"] = w(6, "par")
kw(T["crew_on"], T["ass_on"], "ÉQUIPAGE", "blue"); kw(T["ass_on"], T["ent_on"], "ASSURANCE", "blue"); kw(T["ent_on"], w(6, "Drewry"), "ENTRETIEN", "green")
note(T["crew_on"], e(6, 0.2), "ÉQUIPAGE", "white", "op_crew", 0, -60); note(T["ass_on"], e(6, 0.2), "ASSURANCE", "blue", "op_shield", 0, -60); note(T["ent_on"], e(6, 0.2), "ENTRETIEN", "green", "op_wrench", 0, -60)
stamp(w(6, "Drewry"), w(6, "7"), "DREWRY · MOYENNE 2022", "blue", 540, 980)
kw(w(6, "7"), T["day_on"], "7 500 $", "gold", cnt=dict(to=7500, suf=" $", t0=w(6, "7"), d=0.7)); kw(T["day_on"], w(6, "tous"), "PAR JOUR", "gold"); kw(w(6, "tous"), e(6, 0.5), "TOUS NAVIRES", "white"); note(T["day_on"], e(6, 0.2), "PAR JOUR", "gold", "op_clock", 0, -60)
T["fuel_on"] = w(7, "carburant"); T["pie_blue"] = s(7, 0.3); T["third_on"] = w(7, "tiers")
kw(T["fuel_on"], T["third_on"], "CARBURANT", "red"); kw(T["third_on"], e(7, 0.4), "UN TIERS", "gold"); note(T["third_on"], e(7, 0.3), "≈ 1/3 DU COÛT", "red", "fu_pie", 0, -60); stamp(w(7, "estimé"), e(7, -0.1), "ALPHALINER · ESTIMATION", "blue", 540, 1180)
T["port_on"] = s(8, 0.1); T["cost_on"] = w(8, "coûts")
kw(w(8, "attend"), w(8, "rapporte"), "À QUAI", "white"); kw(w(8, "rien"), T["cost_on"], "ZÉRO RECETTE", "red"); kw(T["cost_on"], e(8, 0.4), "COÛTS EN MARCHE", "red"); note(w(8, "navire"), e(8, 0.2), "ARRÊTÉ", "white", "po_ship", 0, -60); note(T["cost_on"], e(8, 0.2), "ÇA TOURNE", "red", "po_clock", 0, -60)
T["frt_on"] = s(9, 0.1); T["b24_on"] = w(10, "2024"); T["gain_on"] = w(11, "encaisse")
kw(w(9, "taux"), e(9, 0.3), "TAUX DE FRET", "gold"); note(s(9, 0.5), w(10, "2024"), "AVANT", "blue", "fr_b23", 0, -60)
stamp(w(10, "SCFI"), e(10, -0.1), "CNUCED · INDICE SCFI", "blue", 540, 1180); kw(w(10, "149"), e(10, 0.4), "+149 %", "gold", cnt=dict(to=149, pre="+", suf=" %", t0=w(10, "149"), d=0.9)); note(T["b24_on"], e(10, 0.3), "2024", "gold", "fr_b24", 0, -60)
kw(w(11, "montent"), T["gain_on"], "TAUX EN HAUSSE", "gold"); kw(T["gain_on"], e(11, 0.4), "ENCAISSE", "green"); note(T["gain_on"], e(11, 0.3), "LE PROPRIÉTAIRE", "green", "fr_ship", 0, -60)
T["ord_on"] = w(12, "commandent"); T["rate_on"] = w(14, "baissent"); T["over_on"] = s(14, 0.1); T["val_on"] = w(14, "perd")
kw(w(12, "centaines"), e(12, 0.4), "PAR CENTAINES", "gold"); note(w(12, "nouveaux"), e(12, 0.2), "NOUVEAUX NAVIRES", "green", "or_row", 0, -60)
stamp(w(13, "2025"), w(13, "soit"), "CLARKSONS · DONNÉES 2025", "blue", 540, 1180)
kw(w(13, "294"), w(13, "huit"), "294 NAVIRES", "gold", cnt=dict(to=294, suf=" NAVIRES", t0=w(13, "294"), d=0.8)); kw(w(13, "huit"), w(13, "soit"), "EN 8 MOIS", "blue"); kw(w(13, "2,7"), e(13, 0.4), "2,7 M EVP", "gold", cnt=dict(to=2.7, dec=1, suf=" M EVP", t0=w(13, "2,7"), d=0.8))
kw(w(14, "capacité"), T["rate_on"], "TROP DE CAPACITÉ", "red"); kw(T["rate_on"], T["val_on"], "TAUX ↓", "red"); kw(T["val_on"], e(14, 0.4), "VALEUR ↓", "red"); note(T["rate_on"], e(14, 0.2), "TAUX", "red", "sc_arrow", 0, -60); note(T["val_on"], e(14, 0.2), "VALEUR DU NAVIRE", "red", "sc_val", 0, -60)
T["ver_on"] = s(15, 0.1); T["heavy_on"] = w(16, "actif"); T["dette_on"] = w(16, "dette")
kw(w(15, "pas"), e(15, 0.4), "PAS STABLE", "red"); note(s(15, 0.4), e(15, 0.2), "LE CYCLE", "blue", "vd_wave", 0, -60)
kw(T["heavy_on"], w(16, "financé"), "ACTIF LOURD", "gold"); kw(w(16, "financé"), w(16, "rendement"), "FINANCÉ PAR DETTE", "red"); kw(w(16, "rendement"), e(16, 0.4), "SELON LE CYCLE", "gold"); note(T["heavy_on"], e(16, 0.2), "ACTIF LOURD", "white", "vd_weight", 0, -60); note(T["dette_on"], e(16, 0.2), "DETTE", "red", "vd_debt", 0, -60)
T["bubble_on"] = s(17, 0.2); T["button_on"] = w(18, "abonnez"); T["press"] = w(18, "Decrypt")
note(w(17, "posséderiez"), e(17, 0.1), "POSSÉDER OU LOUER ?", "gold", "bubble", 0, -70); kw(w(17, "Dites"), e(17, 0.5), "COMMENTEZ", "gold")
kw(T["button_on"], e(18, 0.4), "ABONNEZ-VOUS", "red")
T["brand"] = e(18, -0.9)
B["cam"] = []; t = 0.0
while t <= DUR + 1e-6:
    p, l = cam(t); B["cam"].append([round(t, 3)] + [round(x, 3) for x in p + l]); t += 1 / 30
B["fov"] = 42
open("video/assets/beats.js", "w").write("window.BEATS=" + json.dumps(B, ensure_ascii=False) + ";")
json.dump(B, open("video/assets/beats.json", "w"), ensure_ascii=False)
print("dur", DUR, "cam keys", len(B["cam"]), "notes", len(B["notes"]), "kws", len(B["kws"]), "whoosh", T["whoosh"])
