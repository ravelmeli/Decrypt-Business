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
ORDER = ["dc", "conso", "capex", "elec", "revenus", "verdict", "cta"]
FIRST = {"dc": 0, "conso": 1, "capex": 3, "elec": 6, "revenus": 9, "verdict": 10, "cta": 12}
LAST = {"dc": 0, "conso": 2, "capex": 5, "elec": 8, "revenus": 9, "verdict": 11, "cta": 13}
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
for n in ORDER: hero(n, 0.0 if n == "dc" else s(FIRST[n]), e(LAST[n], 0.1) if n != "cta" else DUR - LOOP + 0.4)
hero("dc", DUR - LOOP - 0.6, DUR + 3)
_o = (0.5, -0.4, 25, 20, 9, 9, 3.6)
ORB = {n: _o for n in ORDER}
ORB["cta"] = (0.3, -0.3, 22, 16, 7, 7, 5.5)
START = {n: (0.0 if n == "dc" else s(FIRST[n])) for n in ORDER}
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
T["whoosh"] = s(3) - 0.55
T["dc_on"] = s(0, 0.1)
kw(w(0, "bâtiment"), w(0, "consomme"), "NE FABRIQUE RIEN", "white"); kw(w(0, "consomme"), w(0, "certains"), "CONSOMME PLUS D'ÉLECTRICITÉ", "gold"); kw(w(0, "certains"), e(0, 0.4), "QUE CERTAINS PAYS", "red")
note(w(0, "consomme"), e(0, 0.2), "SALLE DE SERVEURS", "gold", "dc_hall", 0, -60)
T["pie_on"] = w(1, "soit"); T["b24_on"] = s(1, 0.5)
stamp(w(1, "Agence"), w(1, "415"), "AGENCE INTERNATIONALE DE L'ÉNERGIE", "blue", 540, 1180); kw(w(1, "415"), w(1, "2024"), "415 TWh", "gold"); kw(w(1, "2024"), w(1, "soit"), "EN 2024", "white"); kw(w(1, "soit"), e(1, 0.4), "≈ 1,5 % DU MONDE", "red")
note(T["b24_on"], e(1, 0.2), "2024", "gold", "cn_b24", 0, -60); note(T["pie_on"], e(1, 0.2), "1,5 %", "red", "cn_pie", 0, -60)
T["b30_on"] = w(2, "945")
kw(w(2, "doubler"), w(2, "2030"), "PLUS QUE DOUBLER", "red"); kw(w(2, "2030"), w(2, "945"), "D'ICI 2030", "white"); kw(w(2, "945"), w(2, "tirée"), "≈ 945 TWh", "gold"); kw(w(2, "tirée"), e(2, 0.4), "TIRÉE PAR L'IA", "green")
note(T["b30_on"], e(2, 0.2), "2030", "red", "cn_b30", 0, -60)
T["bld_on"] = s(3, 0.1); T["shell_on"] = w(4, "107"); T["srv_on"] = w(5, "25")
kw(w(3, "milliards"), w(3, "avant"), "DES MILLIARDS", "gold"); kw(w(3, "avant"), e(3, 0.4), "AVANT LE 1ER CLIENT", "white")
kw(w(4, "construction"), w(4, "107"), "CONSTRUCTION", "white"); stamp(w(4, "JLL"), w(4, "107"), "JLL", "blue", 540, 1180); kw(w(4, "107"), w(4, "par"), "≈ 10,7 M$", "gold"); kw(w(4, "par"), w(4, "cela"), "PAR MÉGAWATT", "white"); kw(w(4, "cela"), e(4, 0.4), "SEULEMENT LE BÂTIMENT", "red")
note(T["shell_on"], e(4, 0.2), "LE BÂTIMENT", "white", "cx_shell", 0, -60)
kw(w(5, "serveurs"), w(5, "charge"), "LES SERVEURS", "white"); kw(w(5, "charge"), w(5, "peuvent"), "À LA CHARGE DES CLIENTS", "white"); kw(w(5, "peuvent"), w(5, "25"), "POUR L'IA", "green"); kw(w(5, "25"), w(5, "dollars"), "JUSQU'À 25 M$", "gold"); kw(w(5, "dollars"), e(5, 0.4), "PAR MÉGAWATT", "white")
note(T["srv_on"], e(5, 0.2), "LES SERVEURS", "gold", "cx_srv", 0, -60)
T["elec_on"] = s(6, 0.1)
kw(w(6, "facture"), w(6, "électricité"), "LA FACTURE SANS FIN", "red"); kw(w(6, "électricité"), e(6, 0.4), "L'ÉLECTRICITÉ", "gold")
note(w(6, "électricité"), e(6, 0.2), "RÉSEAU ÉLECTRIQUE", "gold", "el_pylon", 0, -60)
T["cool_on"] = w(7, "refroidir"); T["p7_on"] = w(7, "7"); T["p30_on"] = w(7, "30")
kw(w(7, "refroidir"), w(7, "Selon"), "REFROIDIR LES MACHINES", "white"); stamp(w(7, "Agence"), w(7, "7"), "AGENCE INTERNATIONALE DE L'ÉNERGIE", "blue", 540, 1180); kw(w(7, "7"), w(7, "efficace"), "≈ 7 %", "green"); kw(w(7, "efficace"), w(7, "30"), "CENTRE EFFICACE", "green"); kw(w(7, "30"), w(7, "moins"), "> 30 %", "red"); kw(w(7, "moins"), e(7, 0.4), "CENTRE MOINS PERFORMANT", "red")
note(T["p7_on"], w(7, "30"), "EFFICACE", "green", "el_eff", 0, -60); note(T["p30_on"], e(7, 0.2), "MOINS PERFORMANT", "red", "el_bad", 0, -60)
kw(w(8, "Tout"), w(8, "efficacité"), "TOUT SE JOUE", "white"); kw(w(8, "efficacité"), e(8, 0.4), "SUR L'EFFICACITÉ", "gold")
T["rev_on"] = s(9, 0.1); T["rent_on"] = w(9, "louent"); T["fill_on"] = w(9, "rempli")
kw(w(9, "revenus"), w(9, "louent"), "LES REVENUS", "gold"); kw(w(9, "louent"), w(9, "contrat"), "ILS LOUENT PUISSANCE ET ESPACE", "white"); kw(w(9, "contrat"), w(9, "condition"), "UN CONTRAT LONG", "gold"); kw(w(9, "condition"), e(9, 0.4), "SI LE SITE EST REMPLI", "red")
note(T["rent_on"], w(9, "contrat"), "LES CLIENTS", "gold", "rv_cli", 0, -60); note(w(9, "condition"), e(9, 0.2), "À REMPLIR", "red", "rv_hall", 0, -60)
T["ver_on"] = s(10, 0.1); T["clk_on"] = w(10, "temps"); T["mach_on"] = w(10, "machines")
kw(w(10, "prix"), w(10, "temps"), "LE VRAI PRIX", "white"); kw(w(10, "temps"), w(10, "bâtiment"), "LE TEMPS", "gold"); kw(w(10, "bâtiment"), w(10, "machines"), "AMORTI SUR DES ANNÉES", "white"); kw(w(10, "machines"), e(10, 0.4), "MACHINES : PLUS VITE", "red")
note(T["clk_on"], e(10, 0.2), "BÂTIMENT", "white", "vd_clockA", 0, -60); note(T["mach_on"], e(10, 0.2), "MACHINES", "red", "vd_clockB", 0, -60)
kw(w(11, "immobilier"), w(11, "jamais"), "DE L'IMMOBILIER", "white"); kw(w(11, "jamais"), e(11, 0.4), "QUI NE S'ÉTEINT JAMAIS", "red")
T["bubble_on"] = s(12, 0.2); T["button_on"] = w(13, "abonnez"); T["press"] = w(13, "Decrypt")
note(w(12, "justifie"), e(12, 0.1), "L'IA ?", "gold", "bubble", 0, -70); kw(w(12, "Dites"), e(12, 0.5), "COMMENTEZ", "gold")
kw(T["button_on"], e(13, 0.4), "ABONNEZ-VOUS", "red")
T["brand"] = e(13, -0.9)
B["cam"] = []; t = 0.0
while t <= DUR + 1e-6:
    p, l = cam(t); B["cam"].append([round(t, 3)] + [round(x, 3) for x in p + l]); t += 1 / 30
B["fov"] = 42
open("video/assets/beats.js", "w").write("window.BEATS=" + json.dumps(B, ensure_ascii=False) + ";")
json.dump(B, open("video/assets/beats.json", "w"), ensure_ascii=False)
print("dur", DUR, "cam keys", len(B["cam"]), "notes", len(B["notes"]), "kws", len(B["kws"]), "whoosh", T["whoosh"])
