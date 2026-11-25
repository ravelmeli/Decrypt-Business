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
ORDER = ["salle", "prix", "club", "calcul", "plateau", "fantomes", "sanschiffre", "dgccrf", "contrat", "cta"]
FIRST = {"salle": 0, "prix": 1, "club": 2, "calcul": 3, "plateau": 4, "fantomes": 5, "sanschiffre": 7, "dgccrf": 8, "contrat": 10, "cta": 11}
LAST = {"salle": 0, "prix": 1, "club": 2, "calcul": 3, "plateau": 4, "fantomes": 6, "sanschiffre": 7, "dgccrf": 9, "contrat": 10, "cta": 12}
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
for n in ORDER: hero(n, 0.0 if n == "salle" else s(FIRST[n]), e(LAST[n], 0.1) if n != "cta" else DUR - LOOP + 0.4)
hero("salle", DUR - LOOP - 0.6, DUR + 3)
_o = (0.5, -0.4, 25, 20, 9, 9, 3.6)
ORB = {n: _o for n in ORDER}
ORB["cta"] = (0.3, -0.3, 22, 16, 7, 7, 5.5)
START = {n: (0.0 if n == "salle" else s(FIRST[n])) for n in ORDER}
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
# 0 salle
T["sl_on"] = s(0, 0.1); T["cr_on"] = w(0, "abonnés")
kw(w(0, "salle"), w(0, "accueillir"), "UNE SALLE DE SPORT", "white"); kw(w(0, "accueillir"), w(0, "modèle"), "PAS DE PLACE POUR TOUS", "red"); kw(w(0, "modèle"), e(0, 0.4), "LE MODÈLE REPOSE LÀ-DESSUS", "gold")
note(s(0, 0.4), e(0, 0.2), "LA SALLE", "gold", "sa_b", 0, -60); note(T["cr_on"], e(0, 0.2), "LES ABONNÉS", "white", "sa_c", 0, -60)
# 1 prix
T["pr_on"] = w(1, "quarante"); T["b29_on"] = w(1, "vingtneuf")
stamp(w(1, "choisir"), w(1, "quarante"), "QUE CHOISIR", "blue", 540, 1180)
kw(w(1, "quarante"), w(1, "vingtneuf"), "40 € / MOIS", "gold"); kw(w(1, "vingtneuf"), w(1, "réseau"), "29 € / MOIS", "green"); kw(w(1, "réseau"), w(1, "basicfit"), "RÉSEAU LE MOINS CHER", "white"); kw(w(1, "basicfit"), e(1, 0.4), "BASIC-FIT", "green")
note(T["pr_on"], e(1, 0.2), "MOYENNE", "gold", "pr_a", 0, -60); note(T["b29_on"], e(1, 0.2), "BASIC-FIT", "green", "pr_b", 0, -60)
# 2 club
T["cl_on"] = s(2, 0.1); T["cw_on"] = w(2, "deux")
kw(w(2, "basicfit"), w(2, "environ"), "BASIC-FIT : FIN 2025", "white"); kw(w(2, "environ"), w(2, "par"), "≈ 2 900 ABONNEMENTS", "gold"); kw(w(2, "par"), e(2, 0.4), "PAR CLUB", "white")
note(T["cw_on"], e(2, 0.2), "≈ 2 900", "gold", "cl_c", 0, -60)
# 3 calcul
T["ca_on"] = s(3, 0.1); T["ml_on"] = w(3, "million")
kw(w(3, "vingtneuf"), w(3, "calcul"), "29 € PAR MOIS", "white"); kw(w(3, "calcul"), w(3, "million"), "ORDRE DE GRANDEUR", "white"); kw(w(3, "million"), w(3, "avant"), "≈ 1 M€ PAR AN", "gold"); kw(w(3, "avant"), e(3, 0.4), "AVANT FRAIS ET OFFRES", "red")
note(T["ml_on"], e(3, 0.2), "≈ 1 M€ / AN / CLUB", "gold", "ca_t", 0, -60)
# 4 plateau
T["pl_on"] = s(4, 0.1); T["gh_on"] = w(4, "petite")
kw(w(4, "personne"), w(4, "modèle"), "2 900 SUR LE MÊME PLATEAU ?", "red"); kw(w(4, "modèle"), w(4, "seule"), "LE MODÈLE SUPPOSE", "white"); kw(w(4, "seule"), e(4, 0.4), "SEULE UNE PETITE PARTIE EST PRÉSENTE", "gold")
note(T["gh_on"], e(4, 0.2), "PRÉSENTS", "gold", "pl_m", 0, -60); note(T["gh_on"] + 0.3, e(4, 0.2), "ABSENTS", "white", "pl_g", 0, -60)
# 5-6 fantomes
T["fa_on"] = s(5, 0.1); T["ghost_on"] = w(5, "fantômes"); T["cb_on"] = w(6, "échantillon")
stamp(w(5, "choisir"), w(5, "mille"), "QUE CHOISIR", "blue", 540, 1180)
kw(w(5, "mille"), w(5, "seuls"), "1 352 ABONNÉS", "white"); kw(w(5, "seuls"), w(5, "fantômes"), "SEULS 5 %", "gold"); kw(w(5, "fantômes"), e(5, 0.4), "ABONNÉS FANTÔMES", "red")
note(T["ghost_on"], e(5, 0.2), "5 %", "gold", "fa_g", 0, -60)
kw(w(6, "échantillon"), w(6, "âge"), "NON REPRÉSENTATIF", "red"); kw(w(6, "âge"), w(6, "beaucoup"), "ÂGE MÉDIAN : 66 ANS", "white"); kw(w(6, "beaucoup"), e(6, 0.4), "BEAUCOUP DE RETRAITÉS", "gold")
note(T["cb_on"], e(6, 0.2), "ENQUÊTE", "red", "fa_cb", 0, -60)
# 7 sanschiffre
T["ns_on"] = s(7, 0.1); T["x_on"] = w(7, "fiable")
kw(w(7, "chiffre"), w(7, "part"), "PAS DE CHIFFRE FIABLE", "red"); kw(w(7, "part"), w(7, "alors"), "LA PART QUI NE VIENT JAMAIS", "white"); kw(w(7, "alors"), e(7, 0.4), "MÉFIEZ-VOUS DES % SANS SOURCE", "gold")
note(T["x_on"], e(7, 0.2), "SANS SOURCE", "red", "ns_b", 0, -60)
# 8-9 dgccrf
T["dg_on"] = s(8, 0.1); T["flag_on"] = w(8, "soixantedix"); T["pie_on"] = w(9, "quarantesix")
stamp(w(8, "dgccrf"), w(8, "établissements"), "DGCCRF", "blue", 540, 1180)
kw(w(8, "établissements"), w(8, "plus"), "571 CONTRÔLÉS · 2022-2023", "white"); kw(w(8, "plus"), w(8, "moins"), "PLUS DE 70 %", "red"); kw(w(8, "moins"), e(8, 0.4), "AU MOINS UNE ANOMALIE", "white")
note(T["flag_on"], e(8, 0.2), "ANOMALIE", "red", "dg_s", 0, -60)
kw(w(9, "quarantesix"), w(9, "clauses"), "46 % DES CONTRATS", "red"); kw(w(9, "clauses"), w(9, "résiliation"), "CLAUSES ILLICITES OU ABUSIVES", "white"); kw(w(9, "résiliation"), e(9, 0.4), "RÉSILIATION PLUS DURE POUR VOUS", "gold")
note(T["pie_on"], e(9, 0.2), "46 %", "red", "dg_p", 0, -60)
# 10 contrat
T["ct_on"] = s(10, 0.1); T["clk_on"] = w(10, "durée")
kw(w(10, "retenez"), w(10, "durée"), "AVANT DE SIGNER", "white"); kw(w(10, "durée"), w(10, "reconduction"), "LA DURÉE", "gold"); kw(w(10, "reconduction"), w(10, "résiliation"), "LA RECONDUCTION", "white"); kw(w(10, "résiliation"), w(10, "comptez"), "LA RÉSILIATION", "red"); kw(w(10, "comptez"), e(10, 0.4), "COMPTEZ VOS VISITES", "green")
note(s(10, 0.4), e(10, 0.2), "CONTRAT", "white", "ct_d", 0, -60); note(T["clk_on"], e(10, 0.2), "DURÉE", "gold", "ct_k", 0, -60)
# cta
T["bubble_on"] = s(11, 0.2); T["button_on"] = w(12, "abonnez"); T["press"] = w(12, "decrypt")
note(w(11, "semaine"), e(11, 0.1), "ET VOUS ?", "gold", "bubble", 0, -70); kw(w(11, "dites"), e(11, 0.5), "COMMENTEZ", "gold")
kw(T["button_on"], e(12, 0.4), "ABONNEZ-VOUS", "red")
T["brand"] = e(12, -0.9)
B["cam"] = []; t = 0.0
while t <= DUR + 1e-6:
    p, l = cam(t); B["cam"].append([round(t, 3)] + [round(x, 3) for x in p + l]); t += 1 / 30
B["fov"] = 42
open("video/assets/beats.js", "w").write("window.BEATS=" + json.dumps(B, ensure_ascii=False) + ";")
json.dump(B, open("video/assets/beats.json", "w"), ensure_ascii=False)
print("dur", DUR, "cam keys", len(B["cam"]), "notes", len(B["notes"]), "kws", len(B["kws"]), "whoosh", T["whoosh"])
