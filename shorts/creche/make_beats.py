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
ORDER = ["creche", "cout", "salaires", "financeurs", "micro", "entreprise", "plafond", "verdict", "cta"]
FIRST = {"creche": 0, "cout": 1, "salaires": 3, "financeurs": 4, "micro": 5, "entreprise": 7, "plafond": 8, "verdict": 9, "cta": 11}
LAST = {"creche": 0, "cout": 2, "salaires": 3, "financeurs": 4, "micro": 6, "entreprise": 7, "plafond": 8, "verdict": 10, "cta": 12}
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
for n in ORDER: hero(n, 0.0 if n == "creche" else s(FIRST[n]), e(LAST[n], 0.1) if n != "cta" else DUR - LOOP + 0.4)
hero("creche", DUR - LOOP - 0.6, DUR + 3)
_o = (0.5, -0.4, 25, 20, 9, 9, 3.6)
ORB = {n: _o for n in ORDER}
ORB["cta"] = (0.3, -0.3, 22, 16, 7, 7, 5.5)
START = {n: (0.0 if n == "creche" else s(FIRST[n])) for n in ORDER}
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
T["whoosh"] = s(4) - 0.55
T["bld_on"] = s(0, 0.1); T["cost_on"] = w(0, "coûte"); T["par_on"] = w(0, "parents")
kw(w(0, "crèche"), w(0, "19"), "UNE PLACE EN CRÈCHE", "white"); kw(w(0, "19"), w(0, "par"), "≈ 19 500 €", "gold", cnt=dict(to=19500, pre="≈ ", suf=" €", t0=w(0, "19"), d=0.9)); kw(w(0, "par"), T["par_on"], "PAR AN", "white"); kw(T["par_on"], e(0, 0.4), "LES PARENTS : UNE PARTIE", "green")
note(T["cost_on"], e(0, 0.2), "COÛT D'UNE PLACE", "gold", "cr_coin", 0, -60); note(T["par_on"], e(0, 0.2), "PART DES PARENTS", "green", "cr_parents", 0, -60)
T["avg_on"] = w(1, "19"); T["micro1_on"] = w(2, "micro")
stamp(w(1, "selon"), e(1, -0.1), "BANQUE DES TERRITOIRES", "blue", 540, 1180); kw(w(1, "coût"), T["avg_on"], "COÛT DE REVIENT MOYEN", "white"); kw(T["avg_on"], w(1, "selon"), "19 450 €", "gold", cnt=dict(to=19450, pre="", suf=" €", t0=T["avg_on"], d=0.9))
note(T["avg_on"], e(1, 0.2), "MOYENNE 2024", "gold", "co_avg", 0, -60)
kw(T["micro1_on"], w(2, "plus"), "MICRO-CRÈCHES", "white"); kw(w(2, "plus"), w(2, "20"), "ENCORE PLUS", "red"); kw(w(2, "20"), e(2, 0.4), "≈ 20 700 €", "gold", cnt=dict(to=20700, pre="≈ ", suf=" €", t0=w(2, "20"), d=0.8))
note(T["micro1_on"], e(2, 0.2), "MICRO-CRÈCHE", "gold", "co_micro", 0, -60)
T["pay_on"] = w(3, "salariale"); T["staff_on"] = w(3, "personnel"); T["clock_on"] = w(3, "journée")
kw(w(3, "Pourquoi"), T["pay_on"], "POURQUOI SI CHER ?", "red"); kw(T["pay_on"], T["staff_on"], "LA MASSE SALARIALE", "gold"); kw(T["staff_on"], T["clock_on"], "DU PERSONNEL", "white"); kw(T["clock_on"], e(3, 0.4), "TOUTE LA JOURNÉE", "green")
note(T["pay_on"], e(3, 0.2), "PERSONNEL", "gold", "sa_staff", 0, -60); note(T["clock_on"], e(3, 0.2), "TOUTE LA JOURNÉE", "white", "sa_clock", 0, -60)
T["fam_on"] = w(4, "famille"); T["caf_on"] = w(4, "CAF")
kw(w(4, "classique"), T["fam_on"], "CRÈCHE CLASSIQUE", "white"); kw(T["fam_on"], w(4, "revenus"), "LA FAMILLE PAIE", "green"); kw(w(4, "revenus"), T["caf_on"], "SELON SES REVENUS", "white"); kw(T["caf_on"], e(4, 0.4), "LA CAF COMPLÈTE", "gold")
note(T["fam_on"], T["caf_on"], "FAMILLE", "green", "fi_house", 0, -60); note(T["caf_on"], e(4, 0.2), "CAF", "gold", "fi_caf", 0, -60)
T["micro_on"] = s(5, 0.1); T["pie1_on"] = w(5, "87"); T["pie2_on"] = w(5, "93")
kw(w(5, "micro"), T["pie1_on"], "MICRO-CRÈCHES", "white"); kw(T["pie1_on"], T["pie2_on"], "87 % : PAJE", "gold", cnt=dict(to=87, pre="", suf=" % : PAJE", t0=T["pie1_on"], d=0.7)); kw(T["pie2_on"], w(5, "rapport"), "93 % LUCRATIFS", "red", cnt=dict(to=93, pre="", suf=" % LUCRATIFS", t0=T["pie2_on"], d=0.7)); stamp(w(5, "rapport"), e(5, -0.1), "RAPPORT PUBLIC", "blue", 540, 1180)
T["rent_on"] = w(6, "rentabilité"); T["lib_on"] = w(6, "liberté")
kw(T["lib_on"], w(6, "permet"), "LIBERTÉ COMMERCIALE", "gold"); kw(w(6, "permet"), e(6, 0.4), "RENTABILITÉ", "green")
note(T["lib_on"], e(6, 0.2), "PRATIQUES LIBRES", "white", "mi_bld", 0, -60); note(T["rent_on"], e(6, 0.2), "RENTABILITÉ", "green", "mi_coin", 0, -60)
T["biz_on"] = w(7, "entreprises"); T["cots_on"] = w(7, "berceaux"); T["cif_on"] = w(7, "50")
kw(T["biz_on"], w(7, "réserver"), "ENTREPRISES", "white"); kw(w(7, "réserver"), w(7, "crédit"), "RÉSERVER DES BERCEAUX", "gold"); kw(w(7, "crédit"), T["cif_on"], "CRÉDIT D'IMPÔT", "green"); kw(T["cif_on"], w(7, "selon"), "50 %", "green", cnt=dict(to=50, pre="", suf=" %", t0=T["cif_on"], d=0.6)); stamp(w(7, "selon"), e(7, -0.1), "CAF", "blue", 540, 1180)
note(T["cots_on"], T["cif_on"], "BERCEAUX RÉSERVÉS", "gold", "en_cots", 0, -60); note(T["cif_on"], e(7, 0.2), "- 50 %", "green", "en_coin", 0, -60)
T["pl_on"] = s(8, 0.1); T["cap_on"] = w(8, "capacité"); T["queue_on"] = w(8, "forte"); T["ceil_on"] = w(8, "plafond")
kw(w(8, "plus"), T["cap_on"], "PAS PLUS D'ENFANTS", "red"); kw(T["cap_on"], T["queue_on"], "SA CAPACITÉ", "gold"); kw(T["queue_on"], T["ceil_on"], "FORTE DEMANDE", "green"); kw(T["ceil_on"], e(8, 0.4), "LE PLAFOND : LES BERCEAUX", "red")
note(T["ceil_on"], e(8, 0.2), "PLAFOND", "red", "pl_ceil", 0, -60); note(T["queue_on"], T["ceil_on"], "FILE D'ATTENTE", "white", "pl_queue", 0, -60)
T["ver_on"] = s(9, 0.1); T["staff2_on"] = w(9, "personnel"); T["fin_on"] = w(9, "recettes"); T["cap2_on"] = w(10, "limitée")
kw(w(9, "Posséder"), T["staff2_on"], "POSSÉDER UNE CRÈCHE", "gold"); kw(T["staff2_on"], T["fin_on"], "COÛT = PERSONNEL", "white"); kw(T["fin_on"], e(9, 0.4), "RECETTES : LES FINANCEURS", "green")
note(T["staff2_on"], T["fin_on"], "PERSONNEL", "gold", "vd_staff", 0, -60); note(T["fin_on"], e(9, 0.2), "FINANCEURS", "green", "vd_fin", 0, -60)
kw(w(10, "besoin"), w(10, "marge"), "BESOIN IMMENSE", "green"); kw(w(10, "marge"), T["cap2_on"], "MARGE LIMITÉE", "red"); kw(T["cap2_on"], e(10, 0.4), "PAR LES BERCEAUX", "white"); note(T["cap2_on"], e(10, 0.2), "BERCEAUX", "gold", "vd_cots", 0, -60)
T["bubble_on"] = s(11, 0.2); T["button_on"] = w(12, "abonnez"); T["press"] = w(12, "Decrypt")
note(w(11, "devrait"), e(11, 0.1), "QUI PAIE ?", "gold", "bubble", 0, -70); kw(w(11, "Dites"), e(11, 0.5), "COMMENTEZ", "gold")
kw(T["button_on"], e(12, 0.4), "ABONNEZ-VOUS", "red")
T["brand"] = e(12, -0.9)
B["cam"] = []; t = 0.0
while t <= DUR + 1e-6:
    p, l = cam(t); B["cam"].append([round(t, 3)] + [round(x, 3) for x in p + l]); t += 1 / 30
B["fov"] = 42
open("video/assets/beats.js", "w").write("window.BEATS=" + json.dumps(B, ensure_ascii=False) + ";")
json.dump(B, open("video/assets/beats.json", "w"), ensure_ascii=False)
print("dur", DUR, "cam keys", len(B["cam"]), "notes", len(B["notes"]), "kws", len(B["kws"]), "whoosh", T["whoosh"])
