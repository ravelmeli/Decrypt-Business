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
ORDER = ["hook", "pib", "conso", "export", "voisins", "recession", "ministre", "menage", "estim", "verdict", "cta"]
FIRST = {"hook": 0, "pib": 1, "conso": 3, "export": 4, "voisins": 5, "recession": 6, "ministre": 7, "menage": 8, "estim": 9, "verdict": 10, "cta": 11}
LAST = {"hook": 0, "pib": 2, "conso": 3, "export": 4, "voisins": 5, "recession": 6, "ministre": 7, "menage": 8, "estim": 9, "verdict": 10, "cta": 12}
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
for n in ORDER: hero(n, 0.0 if n == "hook" else s(FIRST[n]), e(LAST[n], 0.1) if n != "cta" else DUR - LOOP + 0.4)
hero("hook", DUR - LOOP - 0.6, DUR + 3)
_o = (0.5, -0.4, 25, 20, 9, 9, 3.6)
ORB = {n: _o for n in ORDER}
ORB["cta"] = (0.3, -0.3, 22, 16, 7, 7, 5.5)
START = {n: (0.0 if n == "hook" else s(FIRST[n])) for n in ORDER}
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
# 0 hook
T["q1_on"] = w(0, "trois"); T["q2_on"] = w(0, "économie"); T["q3_on"] = w(0, "presque")
kw(w(0, "trois"), w(0, "économie"), "TROIS TRIMESTRES", "white"); kw(w(0, "économie"), w(0, "presque"), "L'ÉCONOMIE FRANÇAISE", "gold"); kw(w(0, "presque"), e(0, 0.4), "PRESQUE IMMOBILE", "red")
note(T["q1_on"], e(0, 0.2), "T1", "white", "hk_q1", 0, -60); note(T["q2_on"], e(0, 0.2), "T2", "gold", "hk_q2", 0, -60); note(T["q3_on"], e(0, 0.2), "T3", "red", "hk_q3", 0, -60)
# 1 pib
T["pib_on"] = s(1, 0.1); T["tw_on"] = s(1, 0.2); T["fall_on"] = w(1, "reculé")
stamp(w(1, "insee"), w(1, "reculé"), "INSEE", "blue", 540, 1180)
kw(w(1, "reculé"), w(1, "troisième"), "PIB : −0,1 %", "red"); kw(w(1, "troisième"), w(1, "après"), "3E TRIMESTRE 2026", "white"); kw(w(1, "après"), e(1, 0.4), "APRÈS UN TRIMESTRE STABLE", "gold")
kw(w(2, "pib"), w(2, "valeur"), "LE PIB", "gold"); kw(w(2, "valeur"), w(2, "baisse", 0), "TOUT CE QUE LE PAYS PRODUIT", "white"); kw(w(2, "baisse", 0), e(2, 0.4), "SI ÇA BAISSE : MOINS DE RICHESSE", "red")
note(w(2, "valeur"), e(2, 0.2), "PRODUCTION DU TRIMESTRE", "gold", "pb_tower", 0, -60)
# 3 conso
T["cons_on"] = w(3, "consommation"); T["cart_on"] = w(3, "ménages"); T["up_on"] = w(3, "04")
kw(w(3, "détail"), w(3, "consommation"), "LE DÉTAIL", "white"); kw(w(3, "consommation"), w(3, "04"), "CONSOMMATION DES MÉNAGES", "white"); kw(w(3, "04"), e(3, 0.4), "+ 0,4 %", "green")
note(T["cart_on"], e(3, 0.2), "MÉNAGES", "green", "cs_hh", 0, -60)
# 4 export
T["exp_on"] = w(4, "échanges"); T["expdown_on"] = w(4, "moins")
kw(w(4, "échanges"), w(4, "pesé"), "ÉCHANGES AVEC L'ÉTRANGER", "white"); kw(w(4, "moins"), w(4, "avec", 1), "− 0,6 POINT DE PIB", "red"); kw(w(4, "avec", 1), e(4, 0.4), "EXPORTATIONS EN BAISSE", "red")
note(w(4, "exportations"), e(4, 0.2), "EXPORTATIONS", "red", "ex_van", 0, -60)
# 5 voisins
T["nb_on"] = s(5, 0.1); T["de_on"] = w(5, "allemagne"); T["es_on"] = w(5, "espagne")
kw(w(5, "temps"), w(5, "allemagne"), "PENDANT CE TEMPS", "white"); kw(w(5, "allemagne"), w(5, "espagne"), "ALLEMAGNE + 0,2 %", "gold"); kw(w(5, "espagne"), e(5, 0.4), "ESPAGNE + 0,6 %", "green")
note(T["nb_on"], e(5, 0.2), "FRANCE", "red", "nb_fr", 0, -60); note(T["de_on"], e(5, 0.2), "+ 0,2 %", "gold", "nb_de", 0, -60); note(T["es_on"], e(5, 0.2), "+ 0,6 %", "green", "nb_es", 0, -60)
# 6 recession
T["def_on"] = w(6, "deux", 0); T["fr_on"] = w(6, "affilée"); T["flat_on"] = w(6, "stable")
kw(w(6, "récession"), w(6, "deux", 0), "RÉCESSION ?", "gold"); kw(w(6, "deux", 0), w(6, "affilée"), "2 TRIMESTRES DE RECUL", "red"); kw(w(6, "affilée"), w(6, "deuxième"), "D'AFFILÉE", "white"); kw(w(6, "deuxième"), e(6, 0.4), "LE 2E ÉTAIT STABLE", "green")
note(T["def_on"], T["fr_on"], "DÉFINITION", "white", "rc_def", 0, -60); note(T["fr_on"], e(6, 0.2), "FRANCE 2026", "gold", "rc_fr", 0, -60)
# 7 ministre
T["min_on"] = w(7, "ministre"); T["stop_on"] = w(7, "arrêt")
kw(w(7, "selon"), w(7, "ministre"), "SELON LA PRESSE", "white"); kw(w(7, "ministre"), w(7, "est"), "LE MINISTRE DE L'ÉCONOMIE", "gold"); kw(w(7, "est"), e(7, 0.4), "« À L'ARRÊT »", "red")
note(T["min_on"], w(7, "est"), "LE MINISTRE", "gold", "mn_pers", 0, -60)
# 8 menage
T["m_on"] = s(8, 0.1); T["sal_on"] = w(8, "salaires"); T["emb_on"] = w(8, "embauches"); T["etat_on"] = w(8, "recettes")
kw(w(8, "croissance"), w(8, "moins"), "CROISSANCE ≈ 0", "gold"); kw(w(8, "moins"), w(8, "salaires"), "MOINS DE MARGE", "red"); kw(w(8, "salaires"), w(8, "embauches"), "SALAIRES", "white"); kw(w(8, "embauches"), w(8, "recettes"), "EMBAUCHES", "white"); kw(w(8, "recettes"), e(8, 0.4), "RECETTES DE L'ÉTAT", "white")
note(T["sal_on"], T["emb_on"], "SALAIRES", "gold", "my_sal", 0, -60); note(T["emb_on"], T["etat_on"], "EMBAUCHES", "white", "my_emb", 0, -60); note(T["etat_on"], e(8, 0.2), "ÉTAT", "red", "my_etat", 0, -60)
# 9 estim
T["est_on"] = w(9, "estimations"); T["rev_on"] = w(9, "révisables")
kw(w(9, "attention"), w(9, "révisables"), "PREMIÈRES ESTIMATIONS", "gold"); kw(w(9, "révisables"), w(9, "27"), "RÉVISABLES", "red"); kw(w(9, "27"), e(9, 0.4), "27 NOVEMBRE", "white")
note(T["est_on"], e(9, 0.2), "À RÉVISER", "red", "es_cal", 0, -60)
# 10 verdict
T["ver_on"] = s(10, 0.1); T["pt_on"] = w(10, "chaque")
kw(w(10, "encore"), w(10, "chaque"), "PAS ENCORE UNE CRISE", "white"); kw(w(10, "chaque"), e(10, 0.4), "CHAQUE POINT COMPTE", "gold")
note(T["pt_on"], e(10, 0.2), "1 POINT", "gold", "vr_top", 0, -60)
# cta
T["bubble_on"] = s(11, 0.2); T["button_on"] = w(12, "abonnez"); T["press"] = w(12, "decrypt")
note(w(11, "sentezvous"), e(11, 0.1), "ET VOUS ?", "gold", "bubble", 0, -70); kw(w(11, "dites"), e(11, 0.5), "COMMENTEZ", "gold")
kw(T["button_on"], e(12, 0.4), "ABONNEZ-VOUS", "red")
T["brand"] = e(12, -0.9)
B["cam"] = []; t = 0.0
while t <= DUR + 1e-6:
    p, l = cam(t); B["cam"].append([round(t, 3)] + [round(x, 3) for x in p + l]); t += 1 / 30
B["fov"] = 42
open("video/assets/beats.js", "w").write("window.BEATS=" + json.dumps(B, ensure_ascii=False) + ";")
json.dump(B, open("video/assets/beats.json", "w"), ensure_ascii=False)
print("dur", DUR, "cam keys", len(B["cam"]), "notes", len(B["notes"]), "kws", len(B["kws"]), "whoosh", T["whoosh"])
