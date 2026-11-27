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
ORDER = ["vote", "recettes", "senat", "cible", "virtuel", "navette", "article", "delai", "douziemes", "inconnu", "retenez", "cta"]
FIRST = {"vote": 0, "recettes": 1, "senat": 2, "cible": 3, "virtuel": 4, "navette": 5, "article": 6, "delai": 7, "douziemes": 8, "inconnu": 9, "retenez": 10, "cta": 11}
LAST = {"vote": 0, "recettes": 1, "senat": 2, "cible": 3, "virtuel": 4, "navette": 5, "article": 6, "delai": 7, "douziemes": 8, "inconnu": 9, "retenez": 10, "cta": 12}
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
for n in ORDER: hero(n, 0.0 if n == "vote" else s(FIRST[n]), e(LAST[n], 0.1) if n != "cta" else DUR - LOOP + 0.4)
hero("vote", DUR - LOOP - 0.6, DUR + 3)
_o = (0.5, -0.4, 25, 20, 9, 9, 3.6)
ORB = {n: _o for n in ORDER}
ORB["cta"] = (0.3, -0.3, 22, 16, 7, 7, 5.5)
START = {n: (0.0 if n == "vote" else s(FIRST[n])) for n in ORDER}
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
# 0 vote
T["vo_on"] = s(0, 0.1); T["bx_on"] = w(0, "aucun")
kw(w(0, "quatre"), w(0, "contre"), "458 DÉPUTÉS", "white"); kw(w(0, "contre"), w(0, "aucun"), "CONTRE LES RECETTES 2027", "red"); kw(w(0, "aucun"), e(0, 0.4), "AUCUN POUR", "gold")
note(s(0, 0.9), e(0, 0.2), "458 CONTRE", "red", "vt_arc", 0, -60); note(T["bx_on"], e(0, 0.2), "0 POUR", "gold", "vt_box", 0, -60)
# 1 recettes
T["re_on"] = s(1, 0.1); T["rej_on"] = w(1, "rejetée"); T["dep_on"] = w(1, "dépenses")
kw(w(1, "vote"), w(1, "comme"), "LE 4 NOVEMBRE 2026", "white"); kw(w(1, "comme"), w(1, "dépenses"), "RECETTES : REJETÉES", "red"); kw(w(1, "dépenses"), e(1, 0.4), "DÉPENSES : NON EXAMINÉES", "gold")
note(T["rej_on"], e(1, 0.2), "RECETTES", "red", "rc_a", 0, -60); note(T["dep_on"], e(1, 0.2), "DÉPENSES", "white", "rc_b", 0, -60)
# 2 senat
T["se_on"] = s(2, 0.1); T["tr_on"] = w(2, "transformé"); T["sn_on"] = w(2, "sénat")
kw(w(2, "selon"), w(2, "profondément"), "SELON LA PRESSE", "white"); kw(w(2, "profondément"), w(2, "version"), "TEXTE TRANSFORMÉ", "red"); kw(w(2, "version"), w(2, "part"), "VERSION INITIALE", "gold"); kw(w(2, "part"), e(2, 0.4), "PART AU SÉNAT", "white")
note(w(2, "initiale"), e(2, 0.2), "TEXTE INITIAL", "gold", "se_doc", 0, -60); note(T["sn_on"], e(2, 0.2), "SÉNAT", "white", "se_sen", 0, -60)
# 3 cible
T["b27_on"] = w(3, "cinq", 0); T["b26_on"] = w(3, "cinq", 1)
kw(w(3, "vise"), w(3, "cinq", 0), "DÉFICIT VISÉ EN 2027", "white"); kw(w(3, "cinq", 0), w(3, "après"), "5 % DU PIB", "green"); kw(w(3, "après"), e(3, 0.4), "≈ 5,4 % EN 2026", "gold")
note(T["b27_on"], e(3, 0.2), "2027 : 5 %", "green", "cb_27", 0, -60); note(T["b26_on"], e(3, 0.2), "2026 : 5,4 %", "gold", "cb_26", 0, -60)
# 4 virtuel
T["vr_on"] = s(4, 0.1); T["v59_on"] = w(4, "cinq"); T["mi_on"] = w(4, "milliards"); 
kw(w(4, "selon"), w(4, "voté"), "SELON LE MINISTRE", "white"); kw(w(4, "voté"), w(4, "cinq"), "SI LE TEXTE VOTÉ", "white"); kw(w(4, "cinq"), w(4, "soit"), "5,9 % DE DÉFICIT", "red"); kw(w(4, "soit"), w(4, "chiffre"), "+ 20,7 MD€", "gold"); kw(w(4, "chiffre"), e(4, 0.4), "CHIFFRE CONTESTÉ", "red")
note(s(4, 0.5), e(4, 0.2), "OBJECTIF 5 %", "green", "vr_a", 0, -60); note(T["v59_on"], e(4, 0.2), "5,9 % (VIRTUEL)", "red", "vr_b", 0, -60); note(T["mi_on"], e(4, 0.2), "+ 20,7 Md€", "gold", "vr_c", 0, -60)
# 5 navette
T["na_on"] = s(5, 0.1); T["na2_on"] = w(5, "chambres")
kw(w(5, "sénat"), w(5, "depuis"), "LE SÉNAT EXAMINE", "white"); kw(w(5, "depuis"), w(5, "puis"), "DEPUIS LE 20 NOVEMBRE", "gold"); kw(w(5, "puis"), e(5, 0.4), "DEUX CHAMBRES : UN ACCORD ?", "red")
note(T["na_on"], e(5, 0.2), "ASSEMBLÉE", "white", "nv_a", 0, -60); note(T["na_on"], e(5, 0.2), "SÉNAT", "gold", "nv_b", 0, -60)
# 6 article
T["g_on"] = w(6, "article"); T["ar_on"] = w(6, "adopte"); T["ce_on"] = w(6, "motion")
kw(w(6, "défaut"), w(6, "article"), "À DÉFAUT", "white"); kw(w(6, "article"), w(6, "adopte"), "ARTICLE 49.3", "gold"); kw(w(6, "adopte"), w(6, "risque"), "TEXTE ADOPTÉ SANS VOTE", "white"); kw(w(6, "risque"), e(6, 0.4), "RISQUE DE CENSURE", "red")
note(T["g_on"], e(6, 0.2), "49.3", "gold", "ar_g", 0, -60); note(T["ce_on"], e(6, 0.2), "CENSURE", "red", "ar_c", 0, -60)
# 7 delai
T["de_on"] = s(7, 0.1); T["cal_on"] = w(7, "17"); T["or_on"] = w(7, "ordonnance")
kw(w(7, "délai"), w(7, "17"), "UN DÉLAI DE 70 JOURS", "white"); kw(w(7, "17"), w(7, "ordonnance"), "17 DÉCEMBRE", "red"); kw(w(7, "ordonnance"), w(7, "jamais"), "ORDONNANCE", "gold"); kw(w(7, "jamais"), e(7, 0.4), "JAMAIS UTILISÉE SOUS LA Ve", "red")
note(T["cal_on"], e(7, 0.2), "17 DÉC.", "red", "dl_cal", 0, -60); note(T["or_on"], e(7, 0.2), "ORDONNANCE", "gold", "dl_ord", 0, -60)
# 8 douziemes
T["do_on"] = w(8, "douzièmes"); T["un_on"] = w(8, "douzième", 1)
kw(w(8, "sans"), w(8, "douzièmes"), "SANS BUDGET EN JANVIER", "white"); kw(w(8, "douzièmes"), w(8, "cestàdire"), "DOUZIÈMES PROVISOIRES", "gold"); kw(w(8, "cestàdire"), w(8, "chaque"), "1/12 DU BUDGET PRÉCÉDENT", "white"); kw(w(8, "chaque"), e(8, 0.4), "CHAQUE MOIS", "green")
note(T["do_on"], e(8, 0.2), "1/12", "gold", "dz_p", 0, -60)
# 9 inconnu
T["in_on"] = s(9, 0.1)
kw(w(9, "trouvé"), w(9, "résultat"), "PAS TROUVÉ", "red"); kw(w(9, "résultat"), w(9, "donc"), "RÉSULTAT DU VOTE AU SÉNAT", "white"); kw(w(9, "donc"), e(9, 0.4), "LA SUITE RESTE OUVERTE", "gold")
note(w(9, "résultat"), e(9, 0.2), "VOTE DU SÉNAT ?", "white", "in_s", 0, -60)
# 10 retenez
T["rt_on"] = s(10, 0.1); T["st_on"] = w(10, "état"); T["inc_on"] = w(10, "décisions")
kw(w(10, "retenez"), w(10, "narrête"), "BUDGET REJETÉ", "white"); kw(w(10, "narrête"), w(10, "mais"), "L'ÉTAT CONTINUE", "green"); kw(w(10, "mais"), e(10, 0.4), "DÉCISIONS PLUS INCERTAINES", "red")
note(T["st_on"], e(10, 0.2), "L'ÉTAT", "green", "rt_off", 0, -60); note(T["inc_on"], e(10, 0.2), "INCERTAIN", "red", "rt_gh", 0, -60)
# cta
T["bubble_on"] = s(11, 0.2); T["button_on"] = w(12, "abonnez"); T["press"] = w(12, "decrypt")
note(w(11, "prix"), e(11, 0.1), "ET VOUS ?", "gold", "bubble", 0, -70); kw(w(11, "dites"), e(11, 0.5), "COMMENTEZ", "gold")
kw(T["button_on"], e(12, 0.4), "ABONNEZ-VOUS", "red")
T["brand"] = e(12, -0.9)
B["cam"] = []; t = 0.0
while t <= DUR + 1e-6:
    p, l = cam(t); B["cam"].append([round(t, 3)] + [round(x, 3) for x in p + l]); t += 1 / 30
B["fov"] = 42
open("video/assets/beats.js", "w").write("window.BEATS=" + json.dumps(B, ensure_ascii=False) + ";")
json.dump(B, open("video/assets/beats.json", "w"), ensure_ascii=False)
print("dur", DUR, "cam keys", len(B["cam"]), "notes", len(B["notes"]), "kws", len(B["kws"]), "whoosh", T["whoosh"])
