"""v3 beat sheet. ONE continuous camera journey (no cuts, no flashes). Every overlay is anchored on the exact spoken word (offset 0)."""
import json, math, re
D = "voice/"
lines = json.load(open(D + "lines.json")); WD = json.load(open(D + "words.json")); CHN = json.load(open("script_ch.json"))
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
ORDER = ["resto", "marche", "addition", "prix", "matiere", "salaires", "loyer", "invest", "simulation", "pointmort", "patron", "defaillances", "modeles", "leviers", "cta"]
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

# ---- heroes (one per place = one chapter) ----
FIRSTL = {n: min(i for i, c in enumerate(CHN) if c == k + 1) for k, n in enumerate(ORDER)}
LASTL = {n: max(i for i, c in enumerate(CHN) if c == k + 1) for k, n in enumerate(ORDER)}
for n in ORDER: hero(n, 0.0 if n == ORDER[0] else s(FIRSTL[n]), e(LASTL[n], 0.1) if n != ORDER[-1] else DUR - LOOP + 0.4)
hero(ORDER[0], DUR - LOOP - 0.6, DUR + 3)
ORB = dict(resto=(0.4, -0.4, 21, 17, 7.5, 6.5, 3.2), marche=(0.4, -0.4, 25, 21, 9, 8, 3.0), addition=(0.4, -0.4, 22, 18, 8, 7, 3.4), prix=(0.4, -0.4, 22, 18, 8, 7, 3.4), matiere=(0.4, -0.4, 22, 18, 8, 7, 3.2),
           salaires=(0.4, -0.4, 22, 18, 8, 7, 3.2), loyer=(0.4, -0.4, 22, 18, 8, 7, 3.2), invest=(0.4, -0.4, 23, 19, 8.5, 7.5, 3.4), simulation=(0.3, -0.3, 22, 18, 8.5, 7.5, 4.4), pointmort=(0.3, -0.3, 22, 18, 8.5, 7.5, 4.4),
           patron=(0.4, -0.4, 20, 16, 7.5, 6.5, 3.0), defaillances=(0.4, -0.4, 22, 18, 8, 7, 3.4), modeles=(0.4, -0.4, 23, 19, 8.5, 7.5, 3.4), leviers=(0.4, -0.4, 22, 18, 8, 7, 3.2), cta=(0.3, -0.3, 22, 18, 7.5, 6.5, 4.2))
START = {n: (0.0 if n == ORDER[0] else s(FIRSTL[n])) for n in ORDER}
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
    a0, a1, r0, r1, h0, h1, ty = ORB[name]; r0, r1, h0, h1 = r0 * 0.82, r1 * 0.82, h0 * 0.9, h1 * 0.9; u = min(1, max(0, (t - START[name]) / max(0.01, END[name] - START[name])))
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

# ======== overlays, all exactly on the spoken word (wi(line, token) = start of that token) ========
wi = lambda i, k, o=0.0: round(byl[i][k]["s"] + o, 2)
def N(i, k, text, kind, anchor, dx=0, dy=-70, dur=1.7, until=None): note(wi(i, k), until if until else round(wi(i, k) + dur, 2), text, kind, anchor, dx, dy)
def KW(i, k, text, color="gold", dur=1.8, until=None, rot=-2): kw(wi(i, k), until if until else round(wi(i, k) + dur, 2), text, color, rot)
def cn(to, pre="", suf="", t0=0.0, d=0.7, dec=0): return dict(to=to, pre=pre, suf=suf, t0=t0, d=d, dec=dec)
def KC(i, k, text, color, to, pre="", suf="", d=0.7, dec=0, until=None, dur=2.2):
    t0 = wi(i, k); kw(t0, until if until else round(t0 + dur, 2), text, color, cnt=cn(to, pre, suf, t0, d, dec))
def ST(i, k, text, kind, dur=2.2, until=None): stamp(wi(i, k), until if until else round(wi(i, k) + dur, 2), text, kind, 960, 770)
# ---- CH1 ----
kw(0.1, e(0, 0.1), "OUVRIR UN RESTAURANT", "gold"); KW(1, 10, "PRESQUE RIEN", "red", 1.6)
ST(2, 1, "OBSERVATOIRE FIDUCIAL", "blue", until=e(2, 0.1)); KC(2, 11, "11 %", "green", 11, "", " %", 0.5, until=wi(2, 18), dur=1.5); KC(2, 20, "3 %", "red", 3, "", " %", 0.5, until=e(2, 0.3))
T["grid_on"] = wi(3, 0); T["gold3"] = wi(3, 2); T["grid_off"] = e(4, 0.4)
N(3, 4, "100 € ENCAISSÉS", "white", "rs_grid", 0, -80, until=wi(3, 5, 0.9)); N(3, 2, "3 € GARDÉS", "gold", "rs_grid", 180, -150, until=e(3, 0.3))
KW(4, 16, "POSTE PAR POSTE", "green", until=wi(4, 19)); KW(4, 21, "OÙ PART L'ARGENT ?", "gold", until=wi(4, 32)); KW(4, 33, "TANT DE FAILLITES", "red", until=e(4, 0.4))
# ---- CH2 ----
T["mk_on"] = wi(5, 7); T["tower_on"] = wi(5, 16); T["thin_on"] = wi(6, 13)
KC(5, 7, "179 000 RESTAURANTS", "blue", 179000, "", " RESTAURANTS", 0.9, until=wi(5, 15)); KC(5, 16, "120 MD €", "green", 120, "", " MD €", 0.7, until=wi(5, 24))
ST(5, 24, "SITES D'ÉTUDES · À VÉRIFIER", "gold", until=wi(5, 43)); KW(6, 7, "LE CONTRASTE", "gold", until=wi(6, 13)); KW(6, 13, "MARGES TRÈS FAIBLES", "red", until=wi(6, 16)); N(6, 13, "MARGE", "gold", "mk_thin", 0, -70, until=e(6, 0.2)); KW(7, 5, "SUIVRE UN EURO", "green", until=e(7, 0.3))
# ---- CH3 ----
T["ttc_on"] = wi(8, 18); T["tva_on"] = wi(9, 9); T["ht_on"] = wi(10, 5)
ST(8, 2, "KPMG · GIRA · L'ADDITION", "blue", until=wi(8, 15)); KC(8, 18, "30 € TTC", "gold", 30, "", " € TTC", 0.6, until=e(8, 0.4))
N(9, 9, "TVA 10 %", "red", "ad_gov", 0, -70, until=wi(9, 17)); N(9, 17, "ALCOOL 20 %", "gold", "ad_gov", 0, -70, until=wi(9, 22)); KW(9, 24, "DIRECT À L'ÉTAT", "blue", until=e(9, 0.4)); KC(10, 5, "28 € HT", "green", 28, "", " € HT", 0.6, until=wi(10, 9))
KW(10, 12, "LE VRAI CHIFFRE D'AFFAIRES", "gold", until=e(10, 0.4))
for k, (kk, txt, dx, col) in enumerate([(10, "NOURRITURE", -330, "red"), (12, "ÉQUIPES", -110, "blue"), (14, "LOCAL", 110, "gold"), (15, "ÉNERGIE", 330, "green")]): note(wi(11, kk), e(11, 0.3), txt, col, "ad_ht", dx, -120)
KW(11, 22, "AVANT DE SE PAYER", "red", until=e(11, 0.4))
# ---- CH4 ----
T["ing_on"] = wi(13, 3); T["x3_on"] = wi(14, 16); T["plate_on"] = wi(14, 18); T["c8_on"] = wi(14, 23); T["c24_on"] = wi(14, 29)
KW(12, 13, "3 À 4 FOIS LE PRIX", "red", until=wi(12, 21)); KW(13, 8, "≈ UN TIERS DU PRIX", "gold", until=wi(13, 15)); KW(13, 15, "COEFFICIENT MULTIPLICATEUR", "blue", until=wi(13, 24)); N(13, 3, "INGRÉDIENTS", "green", "pr_ing", 0, -70, until=wi(13, 12))
KC(14, 16, "× 3", "gold", 3, "× ", "", 0.4, until=wi(14, 23)); N(14, 16, "COEFFICIENT ≈ 3", "gold", "pr_x3", 0, -70, until=wi(14, 23)); KC(14, 23, "8 €", "blue", 8, "", " €", 0.5, until=wi(14, 29)); N(14, 23, "8 € D'INGRÉDIENTS", "blue", "pr_8", 0, -70, until=wi(14, 29))
KC(14, 29, "24 € HT", "green", 24, "", " € HT", 0.6, until=wi(14, 38)); N(14, 29, "24 € HT", "green", "pr_24", 0, -70, until=wi(14, 38)); KC(14, 38, "26,4 € TTC", "gold", 26.4, "", " € TTC", 0.6, dec=1, until=e(14, 0.3)); N(14, 41, "+ TVA 10 %", "red", "pr_plate", 0, -70, until=e(14, 0.3))
for kk, txt, dx in [(13, "CUISINIER", -330), (15, "SERVEUR", -110), (17, "LOYER", 110), (18, "ÉLECTRICITÉ", 330)]: note(wi(15, kk), e(15, 0.3), txt, "white", "pr_plate", dx, -120)
KW(15, 5, "PAS UN CADEAU", "gold", until=wi(15, 10)); KW(16, 8, "PROMOTIONS : DANGER", "red", until=wi(16, 19)); KW(16, 31, "AUTRES CHARGES ENTIÈRES", "red", until=e(16, 0.4))
# ---- CH5 ----
T["mat_on"] = wi(17, 0); T["pie_on"] = wi(17, 19); T["infl_on"] = wi(19, 6)
KW(17, 0, "PREMIER POSTE", "gold", until=wi(17, 9)); ST(17, 9, "KPMG · 2022", "blue", until=wi(17, 24)); KC(17, 19, "34,2 %", "gold", 34.2, "", " %", 0.7, dec=1, until=wi(17, 32)); N(17, 19, "MATIÈRES PREMIÈRES", "green", "mt_pie", 0, -70, until=wi(17, 30)); KW(17, 36, "+ 2 POINTS VS 2019", "red", until=e(17, 0.4))
N(18, 6, "≈ 9,50 € SUR 28 €", "white", "mt_pie", 0, -70, until=e(18, 0.3)); KW(19, 6, "L'INFLATION", "red", until=wi(19, 17)); ST(19, 8, "FIDUCIAL · 2024", "gold", until=wi(19, 17)); KC(19, 17, "+ 20 %", "red", 20, "+ ", " %", 0.6, until=wi(19, 24)); N(19, 17, "MATIÈRES : + 20 %", "red", "mt_up", 0, -70, until=e(19, 0.3)); KW(20, 19, "SANS CHANGER LE PRIX", "gold", until=e(20, 0.4))
# ---- CH6 ----
T["team_on"] = wi(21, 9); T["tow6_on"] = wi(22, 10); T["fix_on"] = wi(23, 7); T["rec_on"] = wi(24, 1)
KW(21, 7, "LES ÉQUIPES", "red", until=wi(21, 9)); N(21, 9, "CUISINIERS", "white", "sa_kitchen", 0, -70, until=wi(21, 10)); N(21, 10, "SERVEURS", "white", "sa_wait", 0, -70, until=wi(21, 11)); N(21, 11, "PLONGE · DIRECTION", "white", "sa_wait", 0, -70, until=e(21, 0.3))
KW(22, 10, "30 À 40 % DU CA", "red", until=wi(22, 22)); ST(22, 22, "REPÈRES D'ÉDITEURS · PAS OFFICIEL", "gold", until=e(22, 0.2)); N(22, 20, "MASSE SALARIALE", "red", "sa_tower", 0, -70, until=wi(22, 22))
KW(23, 5, "COÛT QUASI FIXE", "red", until=wi(23, 14)); N(23, 14, "PAS DE RENVOI À 15 H", "white", "sa_kitchen", 0, -70, until=e(23, 0.3)); ST(24, 7, "KPMG", "blue", until=wi(24, 10)); KC(24, 10, "83 %", "gold", 83, "", " %", 0.6, until=wi(24, 15)); N(24, 15, "PEINENT À RECRUTER", "gold", "sa_q", 0, -70, until=wi(24, 22)); N(24, 24, "SALAIRES RELEVÉS", "red", "sa_tower", 0, -70, until=e(24, 0.3)); KW(25, 10, "LE POIDS LE PLUS LOURD", "red", until=e(25, 0.4))
# ---- CH7 ----
T["rent_on"] = wi(26, 7); T["energy_on"] = wi(28, 1); T["fixed_on"] = wi(29, 4)
KW(26, 0, "TOUT LE RESTE", "gold", until=wi(26, 7))
for kk, txt, dx, col, nx in [(7, "LOYER", -330, "blue", 8), (8, "ÉLECTRICITÉ · GAZ", -110, "gold", 12), (13, "ASSURANCES", 110, "green", 15), (16, "COMPTABLE", 330, "white", 17)]: note(wi(26, kk), e(26, 0.3), txt, col, "lo_build", dx, -90)
KW(27, 19, "6 À 10 % DU CA", "gold", until=wi(27, 30)); KW(27, 33, "PAYÉ CHAQUE MOIS", "red", until=e(27, 0.4)); N(27, 33, "LOYER MENSUEL", "red", "lo_cal", 0, -70, until=e(27, 0.3))
N(28, 15, "ÉNERGIE EN HAUSSE", "red", "lo_energy", 0, -70, until=e(28, 0.3)); ST(28, 10, "FIDUCIAL · 2024", "gold", until=wi(28, 20)); N(29, 7, "INDÉPENDANTS DES CLIENTS", "white", "lo_fixed", 0, -70, until=wi(29, 19)); KW(29, 19, "COÛTS FIXES", "gold", until=e(29, 0.4))
# ---- CH8 ----
T["inv_on"] = wi(30, 8); T["eq_on"] = wi(30, 10); T["res_on"] = wi(32, 3); T["loan_on"] = wi(33, 3); T["chain8_on"] = wi(33, 6)
KW(30, 8, "INVESTIR D'ABORD", "red", until=wi(30, 17))
for kk, txt, nx in [(10, "DROIT AU BAIL", 17), (19, "TRAVAUX", 21), (21, "CUISINE PRO", 24), (24, "MOBILIER", 26), (26, "LICENCE", 32)]: note(wi(30, kk), wi(30, nx) if nx < 32 else e(30, 0.3), txt, "white", "in_eq", 0, -90)
KW(31, 15, "QUELQUES DIZAINES DE MILLIERS €", "white", until=wi(31, 25)); KW(31, 25, "PLUSIEURS CENTAINES DE MILLIERS €", "red", until=wi(31, 34)); ST(31, 34, "ORDRES DE GRANDEUR · SOURCES COMMERCIALES", "gold", until=e(31, 0.2))
N(32, 4, "RÉSERVE DE TRÉSORERIE", "gold", "in_res", 0, -70, until=wi(32, 17)); N(32, 18, "CHARGES DÈS LE 1ER MOIS", "red", "in_build", 0, -70, until=e(32, 0.3)); N(33, 3, "EMPRUNT", "blue", "in_bank", 0, -70, until=wi(33, 6)); N(33, 6, "MENSUALITÉ = CHARGE FIXE", "red", "in_chain", 0, -70, until=e(33, 0.3))
# ---- CH9 ----
T["s500"] = wi(35, 5); T["couv_on"] = wi(35, 21); T["sm_mat"] = wi(36, 4); T["sm_sal"] = wi(36, 18); T["sm_loy"] = wi(36, 27); T["sm_aut"] = wi(36, 39); T["sm_res"] = wi(37, 11)
KW(34, 6, "SIMULATION", "gold", until=wi(34, 8)); ST(34, 6, "ILLUSTRATIF · PAS UN RESTAURANT RÉEL", "gold", until=e(34, 0.2))
KC(35, 5, "500 000 €", "green", 500000, "", " €", 0.8, until=wi(35, 21)); N(35, 14, "28 € / COUVERT", "white", "sm_tab", 0, -90, until=wi(35, 21)); KC(35, 21, "≈ 17 900 COUVERTS", "blue", 17900, "≈ ", " COUVERTS", 0.8, until=wi(35, 27)); KC(35, 27, "60 / JOUR", "gold", 60, "", " / JOUR", 0.6, until=e(35, 0.4))
for kk, txt, col, anc, nx in [(1, "MATIÈRES · 34 %", "red", "sm_mat", 12), (13, "SALAIRES · 38 %", "red", "sm_sal", 25), (25, "LOYER · 8 %", "gold", "sm_loy", 32), (32, "ÉNERGIE… · 14 %", "gold", "sm_res", 43)]: note(wi(36, kk), wi(36, nx) if nx < 43 else e(36, 0.3), txt, col, anc, 0, -70)
KC(36, 8, "170 000 €", "red", 170000, "", " €", 0.7, until=wi(36, 13)); KC(36, 21, "190 000 €", "red", 190000, "", " €", 0.7, until=wi(36, 25)); KC(36, 30, "40 000 €", "gold", 40000, "", " €", 0.6, until=wi(36, 32)); KC(36, 42, "70 000 €", "gold", 70000, "", " €", 0.6, until=e(36, 0.4))
KC(37, 2, "470 000 €", "red", 470000, "", " €", 0.8, until=wi(37, 11)); KC(37, 11, "30 000 €", "gold", 30000, "", " €", 0.7, until=wi(37, 15)); KC(37, 15, "6 %", "green", 6, "", " %", 0.5, until=wi(37, 18)); N(37, 19, "PAS ENCORE LE SALAIRE DU PATRON", "white", "sm_res", 0, -90, until=e(37, 0.3)); KW(38, 5, "UN BON RESTAURANT", "gold", until=e(38, 0.4))
# ---- CH10 ----
T["dec_on"] = wi(39, 7); T["var_on"] = wi(40, 11); T["fix_on10"] = wi(40, 22); T["pm_on"] = wi(42, 4)
KC(39, 8, "− 10 % DE CLIENTS", "red", 10, "− ", " % DE CLIENTS", 0.6, until=e(39, 0.4)); KC(40, 5, "450 000 €", "green", 450000, "", " €", 0.7, until=wi(40, 11)); N(40, 11, "MATIÈRE : BAISSE AVEC LES VENTES", "orange" if False else "gold", "pm_var", 0, -70, until=wi(40, 21)); KC(40, 18, "153 000 €", "gold", 153000, "", " €", 0.6, until=wi(40, 22)); N(40, 23, "SALAIRES · LOYER · CHARGES : FIXES", "blue", "pm_fix", 0, -70, until=e(40, 0.3)); KC(40, 35, "300 000 €", "blue", 300000, "", " €", 0.7, until=e(40, 0.4))
KW(41, 0, "450 − 153 − 300", "white", until=wi(41, 18)); KC(41, 18, "≈ − 3 000 €", "red", 3000, "≈ − ", " €", 0.6, until=wi(41, 28)); KW(41, 28, "UNE LÉGÈRE PERTE", "red", until=e(41, 0.4))
KW(42, 3, "LE POINT MORT", "gold", until=wi(42, 22)); N(42, 22, "POINT MORT ≈ 455 000 €", "white", "pm_line", 0, -70, until=wi(42, 29)); KC(42, 29, "− 9 %", "red", 9, "− ", " %", 0.5, until=e(42, 0.4))
KW(43, 2, "EFFET DE LEVIER", "blue", until=wi(43, 6)); KW(43, 6, "COÛTS FIXES", "gold", until=wi(43, 19)); KW(43, 19, "ÇA FAIT MAL TRÈS VITE", "red", until=e(43, 0.4))
# ---- CH11 ----
T["pt_stack_on"] = wi(44, 13); T["claims_on"] = wi(44, 19)
for i2, (kk, txt, col, anc) in enumerate([(20, "EMPRUNT", "blue", "pt_c1"), (25, "MATÉRIEL", "gold", "pt_c2"), (29, "RÉSERVE", "green", "pt_c3"), (35, "PATRON", "red", "pt_c4")]): T["cl%d" % i2] = wi(44, kk); note(wi(44, kk), e(44, 0.3) if i2 == 3 else wi(44, kk + 3), txt, col, anc, 0, -70)
KW(44, 5, "QUI PAIE LE RESTAURATEUR ?", "gold", until=wi(44, 13)); KC(44, 13, "30 000 €", "gold", 30000, "", " €", 0.6, until=wi(44, 18))
KC(45, 4, "60 H / SEMAINE", "red", 60, "", " H / SEMAINE", 0.6, until=wi(45, 12)); KW(45, 29, "SA PROPRE PAIE DISPARAÎT", "red", until=e(45, 0.4)); KW(46, 8, "LE RISQUE : TOUT SEUL", "gold", until=e(46, 0.4))
# ---- CH12 ----
T["b22"] = wi(47, 20); T["b23"] = wi(47, 30); T["b24"] = wi(47, 40); T["row_on"] = wi(47, 14); T["close_on"] = wi(47, 30); T["s25_on"] = wi(48, 3)
ST(47, 7, "G.H.R. · ALTARES", "blue", until=wi(47, 20)); KC(47, 20, "5 358", "gold", 5358, "", "", 0.7, until=wi(47, 30)); N(47, 26, "2022", "white", "df_b22", 0, -70, until=wi(47, 33)); KC(47, 30, "7 990", "gold", 7990, "", "", 0.7, until=wi(47, 40)); N(47, 36, "2023", "white", "df_b23", 0, -70, until=wi(47, 43)); KC(47, 40, "8 714", "red", 8714, "", "", 0.7, until=e(47, 0.4)); N(47, 46, "2024", "white", "df_b24", 0, -70, until=e(47, 0.3))
N(48, 0, "1ER SEMESTRE 2025", "white", "df_s25", 0, -70, until=wi(48, 10)); KC(48, 10, "+ 10 %", "red", 10, "+ ", " %", 0.5, until=e(48, 0.4)); KW(49, 7, "TOUT LE SECTEUR · HÔTELS COMPRIS", "gold", until=wi(49, 19)); KW(49, 19, "PEU DE MARGE · COÛTS RIGIDES", "red", until=e(49, 0.4)); KW(50, 10, "REMPLISSAGE EN RECUL", "gold", until=e(50, 0.4))
# ---- CH13 ----
T["trad_on"] = wi(51, 10); T["fast_on"] = wi(52, 2); T["occ_on"] = wi(53, 9)
N(51, 11, "RESTAURATION TRADITIONNELLE", "gold", "md_trad", 0, -70, until=wi(51, 26)); KW(51, 26, "LES SALAIRES PÈSENT LOURD", "red", until=e(51, 0.4)); N(52, 2, "RESTAURATION RAPIDE", "blue", "md_fast", 0, -70, until=wi(52, 19)); KW(52, 23, "VITESSE ET VOLUME", "gold", until=e(52, 0.4))
ST(53, 7, "FIDUCIAL · 2024", "blue", until=wi(53, 18)); KC(53, 18, "94 %", "blue", 94, "", " %", 0.5, until=wi(53, 20)); KC(53, 20, "84 %", "red", 84, "", " %", 0.5, until=wi(53, 27)); N(53, 12, "RAPIDE : OCCUPATION", "blue", "md_thB", 0, -70, until=wi(53, 27)); KC(53, 33, "60 %", "gold", 60, "", " %", 0.5, until=wi(53, 35)); KC(53, 35, "58 %", "red", 58, "", " %", 0.5, until=e(53, 0.4)); N(53, 31, "TRADITIONNEL : OCCUPATION", "gold", "md_thA", 0, -70, until=e(53, 0.3))
ST(54, 2, "ALTARES · 9 PREMIERS MOIS 2025", "blue", until=wi(54, 9)); KC(54, 9, "5 419 DÉFAILLANCES", "red", 5419, "", " DÉFAILLANCES", 0.8, until=wi(54, 25)); KC(54, 25, "+ 9 %", "red", 9, "+ ", " %", 0.5, until=e(54, 0.4)); KW(55, 22, "COÛTS FIXES + FRÉQUENTATION", "gold", until=e(55, 0.4))
# ---- CH14 ----
T["menu_on"] = wi(57, 1); T["ticket_on"] = wi(57, 14); T["take_on"] = wi(57, 32); T["track_on"] = wi(58, 4)
KW(56, 1, "COMMENT TIENNENT-ILS ?", "gold", until=wi(56, 12)); ST(56, 12, "ANALYSE GÉNÉRALE · NON SOURCÉE", "gold", until=e(56, 0.2))
N(57, 1, "CARTE COURTE", "green", "lv_menu", 0, -70, until=wi(57, 13)); N(57, 14, "TICKET MOYEN PLUS ÉLEVÉ", "gold", "lv_ticket", 0, -70, until=wi(57, 27)); N(57, 32, "VENTE À EMPORTER", "blue", "lv_take", 0, -70, until=wi(57, 37)); N(57, 37, "SERVICE DU MIDI", "blue", "lv_take", 0, -70, until=e(57, 0.3))
KW(58, 1, "LA DISCIPLINE", "gold", until=wi(58, 8)); N(58, 8, "COÛT MATIÈRE", "red", "lv_track", 0, -70, until=wi(58, 11)); N(58, 11, "MASSE SALARIALE", "red", "lv_track", 0, -70, until=wi(58, 14)); N(58, 14, "VENTES", "green", "lv_track", 0, -70, until=e(58, 0.3))
KC(59, 6, "3 %", "red", 3, "", " %", 0.5, until=wi(59, 8)); KC(59, 8, "10 %", "green", 10, "", " %", 0.5, until=e(59, 0.4))
# ---- CH15 ----
T["rc1"] = wi(62, 4); T["rc2"] = wi(62, 13); T["rc3"] = wi(62, 19); T["bubble_on"] = wi(64, 0); T["button_on"] = wi(65, 1); T["press"] = wi(65, 3)
KW(60, 5, "RENTABLE ?", "gold", until=e(60, 0.4)); KW(61, 8, "3 À 6 % DE MARGE", "gold", until=wi(61, 22)); KW(61, 22, "COÛTS FIXES", "red", until=e(61, 0.4))
N(62, 4, "MATIÈRE ≈ 1/3", "green", "cta_mat", 0, -70, until=wi(62, 13)); N(62, 13, "SALAIRES : UN PEU PLUS", "red", "cta_sal", 0, -70, until=wi(62, 19)); N(62, 19, "LOYER · CHARGES", "blue", "cta_tab", 0, -70, until=wi(62, 27)); N(62, 28, "POINT MORT : PRÈS DU NORMAL", "white", "cta_rest", 0, -70, until=e(62, 0.3)); KW(63, 12, "UNE BONNE GESTION", "gold", until=e(63, 0.4))
N(64, 5, "PETIT OU GRAND RESTAURANT ?", "gold", "bubble", 0, -70, until=wi(64, 19)); KW(64, 19, "COMMENTEZ", "gold", until=e(64, 0.5)); KW(65, 1, "ABONNEZ-VOUS", "red", until=e(65, 0.4))
T["brand"] = e(65, -0.9); T["whoosh"] = -100
# no collisions: trim keywords / stamps to the next one, and notes sharing an anchor
def trim(lst, key=None):
    lst.sort(key=lambda d: d["t0"])
    for a, b in zip(lst, lst[1:]):
        if a["t1"] > b["t0"] - 0.03: a["t1"] = max(a["t0"] + 0.45, round(b["t0"] - 0.03, 2))
trim(B["kws"]); trim(B["stamps"])
byA = {}
for n_ in B["notes"]: byA.setdefault((n_["anchor"], n_["dx"], n_["dy"]), []).append(n_)
for v in byA.values(): trim(v)
B["cam"] = []; t = 0.0
while t <= DUR + 1e-6:
    p, l = cam(t); B["cam"].append([round(t, 3)] + [round(x, 3) for x in p + l]); t += 1 / 30
B["fov"] = 40
open("video/assets/beats.js", "w").write("window.BEATS=" + json.dumps(B, ensure_ascii=False) + ";")
json.dump(B, open("video/assets/beats.json", "w"), ensure_ascii=False)
print("dur", DUR, "cam keys", len(B["cam"]), "notes", len(B["notes"]), "kws", len(B["kws"]), "stamps", len(B["stamps"]))
