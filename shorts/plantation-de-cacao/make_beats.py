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
ORDER = ["tablette", "part", "kilo", "marques", "pays", "twist", "cours", "revenu", "retenez", "cta"]
FIRST = {"tablette": 0, "part": 1, "kilo": 2, "marques": 3, "pays": 4, "twist": 5, "cours": 6, "revenu": 7, "retenez": 8, "cta": 9}
LAST = {"tablette": 0, "part": 1, "kilo": 2, "marques": 3, "pays": 4, "twist": 5, "cours": 6, "revenu": 7, "retenez": 8, "cta": 10}
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
for n in ORDER: hero(n, 0.0 if n == "tablette" else s(FIRST[n]), e(LAST[n], 0.1) if n != "cta" else DUR - LOOP + 0.4)
hero("tablette", DUR - LOOP - 0.6, DUR + 3)
_o = (0.5, -0.4, 25, 20, 9, 9, 3.6)
ORB = {n: _o for n in ORDER}
ORB["cta"] = (0.3, -0.3, 22, 16, 7, 7, 5.5)
START = {n: (0.0 if n == "tablette" else s(FIRST[n])) for n in ORDER}
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
# 0 tablette
T["bar_on"] = s(0, 0.1); T["tow_on"] = w(0, "milliards"); T["pod_on"] = w(0, "cultive"); T["coin_on"] = w(0, "petite")
kw(w(0, "chocolat"), w(0, "milliards"), "LE CHOCOLAT", "white"); kw(w(0, "milliards"), w(0, "celui"), "DES MILLIARDS", "gold"); kw(w(0, "celui"), e(0, 0.4), "LE PLANTEUR : UNE PETITE PART", "red")
note(T["tow_on"], e(0, 0.2), "MILLIARDS", "gold", "tb_tow", 0, -60); note(T["pod_on"], e(0, 0.2), "PLANTEUR", "green", "tb_pod", 0, -60)
# 1 part
T["pie1_on"] = w(1, "onze"); T["pie2_on"] = w(1, "sept")
stamp(w(1, "fao"), w(1, "recevait"), "FAO · BASIC", "blue", 540, 1180)
kw(w(1, "tablettes"), w(1, "onze"), "TABLETTES VENDUES EN FRANCE", "white"); kw(w(1, "onze"), w(1, "sept"), "≈ 11 % : NOIR", "gold"); kw(w(1, "sept"), e(1, 0.4), "≈ 7 % : AU LAIT", "red")
note(T["pie1_on"], e(1, 0.2), "CHOCOLAT NOIR", "gold", "pt_p1", 0, -60); note(T["pie2_on"], e(1, 0.2), "CHOCOLAT AU LAIT", "white", "pt_p2", 0, -60)
# 2 kilo
T["kg_on"] = s(2, 0.1); T["cu_on"] = w(2, "culture"); T["fa_on"] = w(2, "fabrication"); T["di_on"] = w(2, "distribution")
kw(w(2, "kilo"), w(2, "culture"), "1 KILO : 9,32 €", "white"); kw(w(2, "culture"), w(2, "fabrication"), "CULTURE : 1,05 €", "gold"); kw(w(2, "fabrication"), w(2, "distribution"), "FABRICATION : 37 %", "white"); kw(w(2, "distribution"), e(2, 0.4), "DISTRIBUTION : 37 %", "red")
note(T["cu_on"], e(2, 0.2), "CULTURE", "gold", "sg_cu", 0, -60); note(T["fa_on"], e(2, 0.2), "FABRICATION", "white", "sg_fa", 0, -60); note(T["di_on"], e(2, 0.2), "DISTRIBUTION", "red", "sg_di", 0, -60)
# 3 marques
T["mq_on"] = s(3, 0.1); T["va_on"] = w(3, "soixantedix"); T["ma_on"] = w(3, "quatrevingtdix")
kw(w(3, "marques"), w(3, "soixantedix"), "MARQUES + DISTRIBUTEURS", "red"); kw(w(3, "soixantedix"), w(3, "près"), "≈ 70 % DE LA VALEUR", "gold"); kw(w(3, "près"), e(3, 0.4), "≈ 90 % DES MARGES", "red")
note(T["va_on"], e(3, 0.2), "VALEUR", "gold", "mq_val", 0, -60); note(T["ma_on"], e(3, 0.2), "MARGES", "red", "mq_mar", 0, -60)
# 4 pays
T["pa_on"] = s(4, 0.1); T["pi_on"] = s(4, 0.3)
kw(w(4, "pays"), w(4, "moins"), "PAYS PRODUCTEURS", "white"); kw(w(4, "moins"), e(4, 0.4), "MOINS DE 19 % DE LA VALEUR", "gold")
note(T["pi_on"], e(4, 0.2), "PAYS PRODUCTEURS", "gold", "py_pie", 0, -60)
# 5 twist
T["tw_on"] = s(5, 0.1); T["drop_on"] = w(5, "chuté"); T["up2_on"] = w(5, "continué")
kw(w(5, "voici"), w(5, "quand"), "LE PLUS FRAPPANT", "gold"); kw(w(5, "quand"), w(5, "chuté"), "COURS MONDIAL", "white"); kw(w(5, "chuté"), w(5, "valeur"), "− 35 %", "red"); kw(w(5, "valeur"), w(5, "continué"), "VALEUR EN FRANCE", "white"); kw(w(5, "continué"), e(5, 0.4), "ELLE CONTINUE DE CROÎTRE", "green")
note(T["drop_on"], T["up2_on"], "COURS − 35 %", "red", "tw_l", 0, -60); note(T["up2_on"], e(5, 0.2), "MARQUES + DISTRIBUTEURS", "green", "tw_r", 0, -60)
# 6 cours
T["cr_on"] = s(6, 0.1); T["c12_on"] = w(6, "douze"); T["c5_on"] = w(6, "cinq"); T["civ_on"] = w(6, "côte")
stamp(w(6, "coface"), w(6, "douze"), "COFACE", "blue", 540, 1180)
kw(w(6, "douze"), w(6, "environ"), "≈ 12 000 $ / TONNE", "gold"); kw(w(6, "environ"), w(6, "côte"), "≈ 5 000 $ EN DÉC. 2025", "red"); kw(w(6, "côte"), w(6, "deux"), "CÔTE D'IVOIRE : RECORD", "white"); kw(w(6, "deux"), e(6, 0.4), "2 800 FCFA / KG", "gold")
note(T["c12_on"], e(6, 0.2), "12 000 $/t", "gold", "cr_b1", 0, -60); note(T["c5_on"], e(6, 0.2), "5 000 $/t", "red", "cr_b2", 0, -60); note(T["civ_on"], e(6, 0.2), "PRIX BORD CHAMP", "green", "cr_sk", 0, -60)
# 7 revenu
T["rv_on"] = s(7, 0.1); T["gh2_on"] = w(7, "chiffre")
kw(w(7, "prix"), w(7, "planteur"), "UN PRIX PLUS ÉLEVÉ", "white"); kw(w(7, "planteur"), w(7, "chiffre"), "REVENU DU PLANTEUR ?", "gold"); kw(w(7, "chiffre"), e(7, 0.4), "PAS DE CHIFFRE FIABLE", "red")
note(T["gh2_on"], e(7, 0.2), "REVENU ?", "red", "rv_gh", 0, -60); note(w(7, "planteur"), T["gh2_on"], "PLANTEUR", "green", "rv_fr", 0, -60)
# 8 retenez
T["sc_on"] = s(8, 0.1)
kw(w(8, "cacao"), w(8, "bien"), "LE CACAO", "gold"); kw(w(8, "bien"), w(8, "fabrication"), "PÈSE BIEN MOINS", "red"); kw(w(8, "fabrication"), e(8, 0.4), "QUE FABRICATION, MARQUE, DISTRIBUTION", "white")
note(s(8, 0.5), e(8, 0.2), "CACAO", "green", "sc_l", 0, -60); note(w(8, "fabrication"), e(8, 0.2), "FABRICATION + MARQUE + DISTRIBUTION", "red", "sc_r", 0, -60)
# cta
T["bubble_on"] = s(9, 0.2); T["button_on"] = w(10, "abonnez"); T["press"] = w(10, "decrypt")
note(w(9, "planteur"), e(9, 0.1), "ET VOUS ?", "gold", "bubble", 0, -70); kw(w(9, "dites"), e(9, 0.5), "COMMENTEZ", "gold")
kw(T["button_on"], e(10, 0.4), "ABONNEZ-VOUS", "red")
T["brand"] = e(10, -0.9)
B["cam"] = []; t = 0.0
while t <= DUR + 1e-6:
    p, l = cam(t); B["cam"].append([round(t, 3)] + [round(x, 3) for x in p + l]); t += 1 / 30
B["fov"] = 42
open("video/assets/beats.js", "w").write("window.BEATS=" + json.dumps(B, ensure_ascii=False) + ";")
json.dump(B, open("video/assets/beats.json", "w"), ensure_ascii=False)
print("dur", DUR, "cam keys", len(B["cam"]), "notes", len(B["notes"]), "kws", len(B["kws"]), "whoosh", T["whoosh"])
