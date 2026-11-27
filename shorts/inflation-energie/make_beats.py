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
ORDER = ["thermo", "mois", "energie", "detail", "poids", "calme", "sousjacente", "vous", "calendrier", "retenez", "cta"]
FIRST = {"thermo": 0, "mois": 1, "energie": 2, "detail": 3, "poids": 4, "calme": 5, "sousjacente": 6, "vous": 7, "calendrier": 8, "retenez": 9, "cta": 10}
LAST = {"thermo": 0, "mois": 1, "energie": 2, "detail": 3, "poids": 4, "calme": 5, "sousjacente": 6, "vous": 7, "calendrier": 8, "retenez": 9, "cta": 11}
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
for n in ORDER: hero(n, 0.0 if n == "thermo" else s(FIRST[n]), e(LAST[n], 0.1) if n != "cta" else DUR - LOOP + 0.4)
hero("thermo", DUR - LOOP - 0.6, DUR + 3)
_o = (0.5, -0.4, 25, 20, 9, 9, 3.6)
ORB = {n: _o for n in ORDER}
ORB["cta"] = (0.3, -0.3, 22, 16, 7, 7, 5.5)
START = {n: (0.0 if n == "thermo" else s(FIRST[n])) for n in ORDER}
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
# 0 thermo
T["th_on"] = s(0, 0.1); T["fl_on"] = w(0, "énergie")
kw(w(0, "inflation"), w(0, "montée"), "L'INFLATION", "white"); kw(w(0, "montée"), w(0, "plus"), "+ 3,4 % EN OCTOBRE", "red"); kw(w(0, "plus"), w(0, "vient"), "PLUS DE LA MOITIÉ", "white"); kw(w(0, "vient"), e(0, 0.4), "VIENT DE L'ÉNERGIE", "gold")
note(s(0, 0.8), e(0, 0.2), "3,4 %", "red", "th_t", 0, -60); note(T["fl_on"], e(0, 0.2), "ÉNERGIE", "gold", "th_f", 0, -60)
# 1 mois
T["b_oct"] = w(1, "prix"); T["b_sep"] = w(1, "septembre")
stamp(w(1, "insee"), w(1, "augmenté"), "INSEE", "blue", 540, 1180)
kw(w(1, "octobre"), w(1, "après"), "OCTOBRE : + 3,4 %", "red"); kw(w(1, "après"), e(1, 0.4), "SEPTEMBRE : + 3,1 %", "white")
note(T["b_oct"], e(1, 0.2), "OCT. 3,4 %", "red", "mo_b", 0, -60); note(T["b_sep"], e(1, 0.2), "SEPT. 3,1 %", "gold", "mo_a", 0, -60)
# 2 energie
T["e_oct"] = w(2, "vingtquatre"); T["e_sep"] = w(2, "vingt", 1)
kw(w(2, "énergie"), w(2, "bondi"), "L'ÉNERGIE", "gold"); kw(w(2, "bondi"), w(2, "après"), "+ 24,1 %", "red"); kw(w(2, "après"), e(2, 0.4), "SEPTEMBRE : + 21,3 %", "white")
note(T["e_oct"], e(2, 0.2), "OCT. 24,1 %", "red", "en_b", 0, -60); note(T["e_sep"], e(2, 0.2), "SEPT. 21,3 %", "gold", "en_a", 0, -60)
# 3 detail
T["pe_on"] = w(3, "pétroliers"); T["ga_on"] = w(3, "gaz"); T["el_on"] = w(3, "électricité")
kw(w(3, "pétroliers"), w(3, "gaz"), "PÉTROLE : + 38,5 %", "red"); kw(w(3, "gaz"), w(3, "électricité"), "GAZ : + 27,1 %", "gold"); kw(w(3, "électricité"), e(3, 0.4), "ÉLECTRICITÉ : + 2,7 %", "green")
note(T["pe_on"], e(3, 0.2), "PÉTROLE", "red", "de_p", 0, -60); note(T["ga_on"], e(3, 0.2), "GAZ", "gold", "de_g", 0, -60); note(T["el_on"], e(3, 0.2), "ÉLECTRICITÉ", "green", "de_e", 0, -60)
# 4 poids
T["po_on"] = w(4, "pèse"); T["col_on"] = w(4, "représente")
stamp(w(4, "jechange"), w(4, "cela"), "JECHANGE (CALCUL)", "blue", 540, 1180)
kw(w(4, "pèse"), w(4, "selon"), "7,6 % DU PANIER", "gold"); kw(w(4, "représente"), e(4, 0.4), "≈ 1,8 POINT SUR 3,4", "red")
note(T["po_on"], e(4, 0.2), "ÉNERGIE", "gold", "po_pie", 0, -60); note(T["col_on"], e(4, 0.2), "≈ 1,8 POINT", "red", "po_col", 0, -60)
# 5 calme
T["fo_on"] = w(5, "alimentation"); T["sv_on"] = w(5, "services"); T["mf_on"] = w(5, "manufacturés")
kw(w(5, "alimentation"), w(5, "services"), "ALIMENTATION : + 1,2 %", "green"); kw(w(5, "services"), w(5, "manufacturés"), "SERVICES : + 2,6 %", "white"); kw(w(5, "manufacturés"), e(5, 0.4), "MANUFACTURÉS : − 0,2 %", "red")
note(T["fo_on"], e(5, 0.2), "ALIMENTATION", "green", "ca_f", 0, -60); note(T["sv_on"], e(5, 0.2), "SERVICES", "white", "ca_s", 0, -60); note(T["mf_on"], e(5, 0.2), "MANUFACTURÉS", "red", "ca_m", 0, -60)
# 6 sousjacente
T["so_on"] = s(6, 0.1); T["sj_on"] = w(6, "sousjacente")
kw(w(6, "sousjacente"), w(6, "volatils"), "SOUS-JACENTE", "white"); kw(w(6, "volatils"), w(6, "est"), "SANS LES PRIX VOLATILS", "gold"); kw(w(6, "est"), e(6, 0.4), "+ 1,7 %", "green")
note(T["so_on"], e(6, 0.2), "ENSEMBLE 3,4 %", "red", "so_h", 0, -60); note(T["sj_on"], e(6, 0.2), "SOUS-JACENTE 1,7 %", "green", "so_c", 0, -60)
# 7 vous
T["pu_on"] = w(7, "carburant"); T["gz_on"] = w(7, "gaz"); T["fa_on"] = w(7, "facture")
kw(w(7, "carburant"), w(7, "gaz"), "CARBURANT", "gold"); kw(w(7, "gaz"), w(7, "facture"), "GAZ", "gold"); kw(w(7, "facture"), w(7, "pas"), "FACTURE D'ÉNERGIE", "red"); kw(w(7, "pas"), e(7, 0.4), "PAS TOUS LES PRIX", "white")
note(T["pu_on"], e(7, 0.2), "CARBURANT", "gold", "vo_pump", 0, -60); note(T["fa_on"], e(7, 0.2), "FACTURE", "red", "vo_bill", 0, -60)
# 8 calendrier
T["cl_on"] = s(8, 0.1); T["ck_on"] = w(8, "bougé")
kw(w(8, "attention"), w(8, "estimation"), "ATTENTION", "red"); kw(w(8, "estimation"), w(8, "publiée"), "ESTIMATION DE NOVEMBRE", "white"); kw(w(8, "publiée"), w(8, "donc"), "PUBLIÉE LE 27 NOV.", "gold"); kw(w(8, "donc"), e(8, 0.4), "LES CHIFFRES PEUVENT BOUGER", "red")
note(w(8, "publiée"), e(8, 0.2), "27 NOVEMBRE", "gold", "cl_cal", 0, -60); note(T["ck_on"], e(8, 0.2), "DÉJÀ PÉRIMÉ ?", "red", "cl_ck", 0, -60)
# 9 retenez
T["re_on"] = s(9, 0.1)
kw(w(9, "retenez"), w(9, "cacher"), "3,4 % EN MOYENNE", "white"); kw(w(9, "cacher"), e(9, 0.4), "DES ÉCARTS ÉNORMES", "red")
note(w(9, "écarts"), e(9, 0.2), "ÉCARTS", "red", "re_all", 0, -60)
# cta
T["bubble_on"] = s(10, 0.2); T["button_on"] = w(11, "abonnez"); T["press"] = w(11, "decrypt")
note(w(10, "surpris"), e(10, 0.1), "ET VOUS ?", "gold", "bubble", 0, -70); kw(w(10, "dites"), e(10, 0.5), "COMMENTEZ", "gold")
kw(T["button_on"], e(11, 0.4), "ABONNEZ-VOUS", "red")
T["brand"] = e(11, -0.9)
B["cam"] = []; t = 0.0
while t <= DUR + 1e-6:
    p, l = cam(t); B["cam"].append([round(t, 3)] + [round(x, 3) for x in p + l]); t += 1 / 30
B["fov"] = 42
open("video/assets/beats.js", "w").write("window.BEATS=" + json.dumps(B, ensure_ascii=False) + ";")
json.dump(B, open("video/assets/beats.json", "w"), ensure_ascii=False)
print("dur", DUR, "cam keys", len(B["cam"]), "notes", len(B["notes"]), "kws", len(B["kws"]), "whoosh", T["whoosh"])
