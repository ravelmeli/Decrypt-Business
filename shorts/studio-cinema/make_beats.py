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
ORDER = ["studio", "jedi", "compta", "gump", "brut", "verdict", "cta"]
FIRST = {"studio": 0, "jedi": 1, "compta": 2, "gump": 7, "brut": 9, "verdict": 10, "cta": 11}
LAST = {"studio": 0, "jedi": 1, "compta": 6, "gump": 8, "brut": 9, "verdict": 10, "cta": 12}
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
for n in ORDER: hero(n, 0.0 if n == "studio" else s(FIRST[n]), e(LAST[n], 0.1) if n != "cta" else DUR - LOOP + 0.4)
hero("studio", DUR - LOOP - 0.6, DUR + 3)
_o = (0.5, -0.4, 25, 20, 9, 9, 3.6)
ORB = {n: _o for n in ORDER}
ORB["cta"] = (0.3, -0.3, 22, 16, 7, 7, 5.5)
START = {n: (0.0 if n == "studio" else s(FIRST[n])) for n in ORDER}
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
T["whoosh"] = s(2) - 0.55
T["film_on"] = s(0, 0.1); T["crowd"] = w(0, "salles")
kw(w(0, "film"), w(0, "salles"), "UN FILM", "gold"); kw(w(0, "salles"), w(0, "jamais"), "SALLES PLEINES", "white"); kw(w(0, "jamais"), e(0, 0.4), "JAMAIS RENTABLE", "red")
note(w(0, "salles"), e(0, 0.2), "SALLES PLEINES", "gold", "st_screen", 0, -60)
T["jedi_on"] = s(1, 0.1); T["big_on"] = s(1, 0.6); T["sm_on"] = w(1, "budget"); T["x_on"] = e(1, -0.7)
kw(w(1, "Prenez"), w(1, "Selon"), "LE RETOUR DU JEDI", "gold"); stamp(w(1, "Selon"), w(1, "jamais"), "LUCASFILM", "blue", 540, 1180); kw(w(1, "jamais"), w(1, "475"), "JAMAIS DE BÉNÉFICES", "red"); kw(w(1, "475"), w(1, "budget"), "≈ 475 M$ DE RECETTES", "gold"); kw(w(1, "budget"), e(1, 0.4), "BUDGET ≈ 32 M$", "white")
note(T["big_on"], e(1, 0.2), "RECETTES", "gold", "jd_big", 0, -60); note(T["sm_on"], e(1, 0.2), "BUDGET", "white", "jd_small", 0, -60)
T["comp_on"] = s(2, 0.1); T["dist_on"] = w(3, "distribution"); T["over_on"] = w(4, "généraux"); T["int_on"] = w(5, "intérêts"); T["net_on"] = w(6, "zéro")
kw(w(2, "bénéfice"), w(2, "caisse"), "BÉNÉFICE NET", "gold"); kw(w(2, "caisse"), w(2, "déductions"), "APRÈS DÉDUCTIONS", "white"); kw(w(2, "déductions"), e(2, 0.4), "FIXÉES PAR LE STUDIO", "red")
note(w(2, "caisse"), e(2, 0.2), "RECETTES", "gold", "cp_tower", 0, -60)
kw(w(3, "frais"), w(3, "studio"), "FRAIS DE DISTRIBUTION", "red"); kw(w(3, "studio"), w(3, "30"), "FACTURÉS AU FILM", "white"); kw(w(3, "30"), e(3, 0.4), "≈ 30 %", "gold")
note(T["dist_on"], e(3, 0.2), "DISTRIBUTION", "red", "cp_dist", 0, -60)
kw(w(4, "généraux"), w(4, "15"), "FRAIS GÉNÉRAUX", "red"); kw(w(4, "15"), w(4, "coût"), "≈ 15 %", "gold"); kw(w(4, "coût"), w(4, "10"), "DE LA PRODUCTION", "white"); kw(w(4, "10"), e(4, 0.4), "≈ 10 % DE PUB", "gold")
note(T["over_on"], e(4, 0.2), "FRAIS GÉNÉRAUX", "red", "cp_over", 0, -60)
kw(w(5, "intérêts"), w(5, "parfois"), "LES INTÉRÊTS", "red"); kw(w(5, "argent"), e(5, 0.4), "PRÊTÉ À LUI-MÊME", "white")
note(T["int_on"], e(5, 0.2), "INTÉRÊTS", "red", "cp_int", 0, -60)
kw(w(6, "Chaque"), w(6, "Résultat"), "ÉCRIT DANS UN CONTRAT", "white"); kw(w(6, "Résultat"), w(6, "zéro"), "BÉNÉFICE NET", "gold"); kw(w(6, "zéro"), e(6, 0.4), "PROCHE DE ZÉRO", "red")
note(T["net_on"], e(6, 0.2), "CE QUI RESTE", "gold", "cp_net", 0, -60)
T["author_on"] = s(7, 0.1); T["gump_on"] = w(7, "Forrest"); T["low_on"] = w(7, "faible"); T["var_on"] = w(8, "varient")
kw(w(7, "négocié"), w(7, "rien"), "UNE PART DU BÉNÉFICE", "white"); kw(w(7, "rien"), w(7, "Forrest"), "PARFOIS RIEN", "red"); kw(w(7, "Forrest"), w(7, "obtenu"), "FORREST GUMP", "gold"); stamp(w(7, "Winston"), w(7, "obtenu"), "WINSTON GROOM", "blue", 540, 1180); kw(w(7, "obtenu"), w(7, "reçu"), "3 % DU BÉNÉFICE NET", "gold"); kw(w(7, "faible"), e(7, 0.4), "UN FAIBLE PAIEMENT", "red")
note(T["author_on"], w(7, "Forrest"), "L'AUTEUR", "white", "gp_pay", 0, -60); note(T["gump_on"], e(7, 0.2), "SON ROMAN", "gold", "gp_book", 0, -60)
kw(w(8, "chiffres"), w(8, "varient"), "LES CHIFFRES", "white"); kw(w(8, "varient"), w(8, "aucun"), "VARIENT SELON LES SOURCES", "gold"); kw(w(8, "aucun"), e(8, 0.4), "AUCUN AUDIT PUBLIC", "red")
note(T["var_on"], e(8, 0.2), "CHIFFRES FLOUS", "gold", "gp_var", 0, -60)
T["star_on"] = s(9, 0.1); T["brut_on"] = w(9, "brutes")
kw(w(9, "stars"), w(9, "pourcentage"), "LES STARS", "gold"); kw(w(9, "pourcentage"), w(9, "brutes"), "% DES RECETTES", "white"); kw(w(9, "brutes"), w(9, "avant"), "BRUTES", "gold"); kw(w(9, "avant"), e(9, 0.4), "AVANT DÉDUCTIONS", "green")
note(w(9, "pourcentage"), w(9, "brutes"), "NET : RIEN", "red", "br_net", 0, -60); note(T["brut_on"], e(9, 0.2), "BRUT", "gold", "br_gross", 0, -60)
T["ver_on"] = s(10, 0.1); T["def_on"] = w(10, "définition")
kw(w(10, "studio"), w(10, "définition"), "UN STUDIO VEND DES FILMS", "white"); kw(w(10, "définition"), w(10, "seul", 1), "UNE DÉFINITION DU BÉNÉFICE", "gold"); kw(w(10, "seul", 1), e(10, 0.4), "IL EST SEUL À L'ÉCRIRE", "red")
note(T["def_on"], e(10, 0.2), "BÉNÉFICE ?", "gold", "vd_book", 0, -60)
T["bubble_on"] = s(11, 0.2); T["button_on"] = w(12, "abonnez"); T["press"] = w(12, "Decrypt")
note(w(11, "film"), e(11, 0.1), "QUEL FILM ?", "gold", "bubble", 0, -70); kw(w(11, "Dites"), e(11, 0.5), "COMMENTEZ", "gold")
kw(T["button_on"], e(12, 0.4), "ABONNEZ-VOUS", "red")
T["brand"] = e(12, -0.9)
B["cam"] = []; t = 0.0
while t <= DUR + 1e-6:
    p, l = cam(t); B["cam"].append([round(t, 3)] + [round(x, 3) for x in p + l]); t += 1 / 30
B["fov"] = 42
open("video/assets/beats.js", "w").write("window.BEATS=" + json.dumps(B, ensure_ascii=False) + ";")
json.dump(B, open("video/assets/beats.json", "w"), ensure_ascii=False)
print("dur", DUR, "cam keys", len(B["cam"]), "notes", len(B["notes"]), "kws", len(B["kws"]), "whoosh", T["whoosh"])
