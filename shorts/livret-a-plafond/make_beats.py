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
ORDER = ["livret", "nouveau", "avantage", "plafonnes", "moitie", "etat", "cout", "conso", "taux", "retenez", "cta"]
FIRST = {"livret": 0, "nouveau": 1, "avantage": 3, "plafonnes": 4, "moitie": 5, "etat": 6, "cout": 8, "conso": 9, "taux": 10, "retenez": 11, "cta": 12}
LAST = {"livret": 0, "nouveau": 2, "avantage": 3, "plafonnes": 4, "moitie": 5, "etat": 7, "cout": 8, "conso": 9, "taux": 10, "retenez": 11, "cta": 13}
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
for n in ORDER: hero(n, 0.0 if n == "livret" else s(FIRST[n]), e(LAST[n], 0.1) if n != "cta" else DUR - LOOP + 0.4)
hero("livret", DUR - LOOP - 0.6, DUR + 3)
_o = (0.5, -0.4, 25, 20, 9, 9, 3.6)
ORB = {n: _o for n in ORDER}
ORB["cta"] = (0.3, -0.3, 22, 16, 7, 7, 5.5)
START = {n: (0.0 if n == "livret" else s(FIRST[n])) for n in ORDER}
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
# 0 livret
T["bk_on"] = w(0, "livret"); T["ct_on"] = w(0, "accueillir")
kw(w(0, "livret"), w(0, "accueillir"), "LE LIVRET A", "gold"); kw(w(0, "accueillir"), w(0, "état"), "PLUS D'ARGENT ?", "white"); kw(w(0, "état"), e(0, 0.4), "L'ÉTAT Y A UN INTÉRÊT", "red")
note(T["bk_on"], e(0, 0.2), "LIVRET A", "gold", "lv_book", 0, -60); note(T["ct_on"], e(0, 0.2), "+ D'ÉPARGNE", "green", "lv_tower", 0, -60)
# 1 nouveau : today
T["b1_on"] = w(1, "22")
kw(w(1, "novembre"), w(1, "annoncé"), "3 NOVEMBRE 2026", "white"); kw(w(1, "annoncé"), w(1, "aujourdhui"), "RELÈVEMENT DU PLAFOND", "gold"); kw(w(1, "aujourdhui"), e(1, 0.4), "AUJOURD'HUI : 22 950 €", "white")
note(T["b1_on"], e(1, 0.2), "22 950 €", "gold", "nv_b1", 0, -60)
T["b2_on"] = w(2, "25"); T["b3_on"] = w(2, "30"); T["cal_on"] = w(2, "février")
kw(w(2, "compris"), w(2, "partir"), "ENTRE 25 000 ET 30 000 €", "gold"); kw(w(2, "partir"), w(2, "montant"), "1ER FÉVRIER 2027", "white"); kw(w(2, "montant"), e(2, 0.4), "MONTANT PAS ENCORE FIXÉ", "red")
note(T["b2_on"], e(2, 0.2), "25 000 €", "white", "nv_b2", 0, -60); note(T["b3_on"], e(2, 0.2), "30 000 €", "green", "nv_b3", 0, -60); note(T["cal_on"], e(2, 0.2), "1ER FÉV. 2027", "white", "nv_cal", 0, -150)
# 3 avantage
T["av_on"] = s(3, 0.1); T["tax_on"] = w(3, "impôt")
kw(w(3, "placement"), w(3, "sans"), "UN PLACEMENT", "white"); kw(w(3, "sans"), w(3, "disponible"), "SANS IMPÔT", "green"); kw(w(3, "disponible"), w(3, "jusquà"), "DISPONIBLE À TOUT MOMENT", "white"); kw(w(3, "jusquà"), e(3, 0.4), "JUSQU'À UN MONTANT PLUS HAUT", "gold")
note(w(3, "disponible"), e(3, 0.2), "DISPONIBLE", "gold", "av_safe", 0, -60); note(T["tax_on"], e(3, 0.2), "SANS IMPÔT", "green", "av_doc", 0, -60)
# 4 plafonnes
T["pl_on"] = s(4, 0.1); T["gold_on"] = w(4, "15")
kw(w(4, "plupart"), w(4, "moneyvox"), "LA PLUPART : NON CONCERNÉS", "white"); stamp(w(4, "moneyvox"), w(4, "87"), "MONEYVOX", "blue", 540, 1180); kw(w(4, "87"), w(4, "environ"), "8,7 MILLIONS D'ÉPARGNANTS", "gold"); kw(w(4, "environ"), e(4, 0.4), "≈ 15 % AU PLAFOND", "red")
note(T["gold_on"], e(4, 0.2), "≈ 15 %", "gold", "pl_gold", 0, -60)
# 5 moitie
T["mo_on"] = s(5, 0.1); T["ht_on"] = w(5, "moitié")
kw(w(5, "près"), w(5, "encours"), "PRESQUE LA MOITIÉ", "gold"); kw(w(5, "encours"), w(5, "relèvement"), "DE L'ENCOURS TOTAL", "white"); kw(w(5, "relèvement"), e(5, 0.4), "UNE MINORITÉ EN PROFITE", "red")
note(T["ht_on"], e(5, 0.2), "LES PLAFONNÉS", "gold", "mo_l", 0, -60); note(T["ht_on"] + 0.3, e(5, 0.2), "LES AUTRES", "white", "mo_r", 0, -60)
# 6 etat
T["et_on"] = s(6, 0.1); T["fl_on"] = w(6, "collecter"); T["nuc_on"] = w(6, "réacteurs"); T["eco_on"] = w(6, "écoles")
kw(w(6, "pourquoi"), w(6, "collecter"), "POURQUOI L'ÉTAT ?", "white"); kw(w(6, "collecter"), w(6, "financer"), "COLLECTER DES FONDS", "gold"); kw(w(6, "financer"), w(6, "réacteurs"), "FINANCER DES PROJETS", "white"); kw(w(6, "réacteurs"), w(6, "rénovation"), "NOUVEAUX RÉACTEURS", "green"); kw(w(6, "rénovation"), e(6, 0.4), "RÉNOVER LES ÉCOLES", "green")
note(T["nuc_on"], e(6, 0.2), "NUCLÉAIRE", "green", "et_nuc", 0, -60); note(T["eco_on"], e(6, 0.2), "ÉCOLES", "gold", "et_sch", 0, -60)
kw(w(7, "votre"), w(7, "sert"), "VOTRE ÉPARGNE", "gold"); kw(w(7, "sert"), e(7, 0.4), "OUTIL DE FINANCEMENT PUBLIC", "white")
note(w(7, "épargne"), e(7, 0.2), "VOTRE ÉPARGNE", "gold", "et_pers", 0, -60)
# 8 cout
T["co_on"] = s(8, 0.1); T["tax2_on"] = w(8, "exonéré"); T["cost_on"] = w(8, "coût")
kw(w(8, "critiques"), w(8, "exonéré"), "LES CRITIQUES", "white"); kw(w(8, "exonéré"), w(8, "donc"), "EXONÉRÉ D'IMPÔT", "green"); kw(w(8, "coût"), e(8, 0.4), "UN COÛT POUR L'ÉTAT", "red")
note(w(8, "finances"), e(8, 0.2), "FINANCES PUBLIQUES", "gold", "co_off", 0, -60); note(T["tax2_on"], e(8, 0.2), "EXONÉRÉ", "green", "co_doc", 0, -60)
# 9 conso
T["cn_on"] = s(9, 0.1); T["sav_on"] = w(9, "épargner"); T["cons_dn"] = w(9, "consommation")
kw(w(9, "épargner"), w(9, "détriment"), "ÉPARGNER PLUS", "gold"); kw(w(9, "détriment"), w(9, "quand"), "AU DÉTRIMENT DE LA CONSOMMATION", "red"); kw(w(9, "quand"), e(9, 0.4), "QUAND LA CROISSANCE EST FAIBLE", "white")
note(T["sav_on"], e(9, 0.2), "ÉPARGNE", "gold", "cs_tower", 0, -60); note(T["cons_dn"], e(9, 0.2), "CONSOMMATION", "red", "cs_cart", 0, -60)
# 10 taux
T["tx_on"] = w(10, "170"); T["gh_on"] = w(10, "hausse")
kw(w(10, "taux"), w(10, "certains"), "TAUX : 1,70 % NET", "gold"); kw(w(10, "certains"), w(10, "mais"), "UNE HAUSSE ATTENDUE ?", "white"); kw(w(10, "mais"), e(10, 0.4), "PAS D'ANNONCE OFFICIELLE", "red")
note(T["tx_on"], e(10, 0.2), "1,70 %", "gold", "tx_now", 0, -60); note(T["gh_on"], e(10, 0.2), "HAUSSE ATTENDUE ?", "white", "tx_gh", 0, -60)
# 11 retenez
T["rt_on"] = s(11, 0.1); T["place_on"] = w(11, "place"); T["same_on"] = w(11, "rendement")
kw(w(11, "plafond"), w(11, "place"), "UN PLAFOND PLUS HAUT", "white"); kw(w(11, "place"), w(11, "pas"), "PLUS DE PLACE", "gold"); kw(w(11, "pas"), e(11, 0.4), "PAS PLUS DE RENDEMENT", "red")
note(T["place_on"], e(11, 0.2), "PLUS DE PLACE", "gold", "rt_tray", 0, -60); note(T["same_on"], e(11, 0.2), "MÊME TAUX", "white", "rt_bar", 0, -60)
# cta
T["bubble_on"] = s(12, 0.2); T["button_on"] = w(13, "abonnez"); T["press"] = w(13, "decrypt")
note(w(12, "montait"), e(12, 0.1), "ET VOUS ?", "gold", "bubble", 0, -70); kw(w(12, "dites"), e(12, 0.5), "COMMENTEZ", "gold")
kw(T["button_on"], e(13, 0.4), "ABONNEZ-VOUS", "red")
T["brand"] = e(13, -0.9)
B["cam"] = []; t = 0.0
while t <= DUR + 1e-6:
    p, l = cam(t); B["cam"].append([round(t, 3)] + [round(x, 3) for x in p + l]); t += 1 / 30
B["fov"] = 42
open("video/assets/beats.js", "w").write("window.BEATS=" + json.dumps(B, ensure_ascii=False) + ";")
json.dump(B, open("video/assets/beats.json", "w"), ensure_ascii=False)
print("dur", DUR, "cam keys", len(B["cam"]), "notes", len(B["notes"]), "kws", len(B["kws"]), "whoosh", T["whoosh"])
