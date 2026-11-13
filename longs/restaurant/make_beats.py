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
ORDER = ["ecole", "contrats", "depenses", "salaires", "horscontrat", "souscontrat", "immo", "simulation", "directeur", "risques", "friction", "cta"]
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
ORB = dict(ecole=(0.4, -0.4, 17, 13, 7, 6, 3.0), contrats=(0.4, -0.4, 25, 22, 8, 7.5, 3.0), depenses=(0.4, -0.4, 22, 18, 7.5, 6.5, 3.2), salaires=(0.4, -0.4, 23, 19, 8, 7, 3.0),
           horscontrat=(0.4, -0.4, 22, 18, 7.5, 7, 3.0), souscontrat=(0.4, -0.4, 22, 19, 8, 7, 3.2), immo=(0.4, -0.4, 23, 19, 8, 7.5, 3.6), simulation=(0.3, -0.3, 22, 18, 8, 7.5, 4.2),
           directeur=(0.4, -0.4, 14, 11, 6, 5.5, 2.8), risques=(0.4, -0.4, 24, 20, 8, 7.5, 3.0), friction=(0.4, -0.4, 20, 16, 8.5, 7.5, 4.4), cta=(0.3, -0.3, 22, 18, 7.5, 6.5, 4.2))
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

# ======== overlays, all exactly on the spoken word ========
def cn(to, pre="", suf="", t0=0.0, d=0.7, dec=0): return dict(to=to, pre=pre, suf=suf, t0=t0, d=d, dec=dec)
def KC(t0, t1, text, color, to, pre="", suf="", d=0.7, dec=0): kw(t0, t1, text, color, cnt=cn(to, pre, suf, t0, d, dec))
STY = 760   # stamp y (1920x1080 canvas)
# ---- CH1 ----
kw(0.1, e(0, 0.1), "L'ÉCONOMIE D'UNE ÉCOLE", "gold")
note(w(1, "salaires"), e(1, 0.2), "SALAIRES", "red", "sc_mid", -330, -120); note(w(1, "loyer"), e(1, 0.2), "LOYER", "blue", "sc_mid", -110, -120); note(w(1, "assurances"), e(1, 0.2), "ASSURANCES", "green", "sc_mid", 110, -120); note(w(1, "cantine"), e(1, 0.2), "CANTINE", "gold", "sc_mid", 330, -120)
kw(w(2, "avant"), e(2, 0.4), "AVANT LA RENTRÉE", "red")
T["q_on"] = w(3, "question"); kw(w(3, "d'où"), e(3, 0.5), "D'OÙ VIENT L'ARGENT ?", "gold")
kw(w(4, "deux"), e(4, 0.4), "DEUX FAÇONS", "blue"); kw(w(5, "comptes"), e(5, 0.4), "COMPTES DIFFÉRENTS", "white")
note(w(6, "poste"), e(6, 0.3), "POSTE PAR POSTE", "green", "sc_top", 0, -60)
KC(w(8, "trente"), e(8, 0.5), "+30 ÉLÈVES", "green", 30, "+", " ÉLÈVES", 0.7)
# ---- CH2 ----
T["lone_on"] = w(10, "hors"); T["fam_on"] = w(12, "seule"); T["state_on"] = w(14, "sous"); T["flow_on"] = w(16, "prend"); T["n7500"] = w(18, "7"); T["dbl_on"] = w(20, "doublé")
note(w(9, "contrat"), e(9, 0.2), "LE CONTRAT", "gold", "ct_state", 0, -60); note(w(10, "hors"), e(11, 0.3), "HORS CONTRAT", "gold", "ct_hc", 0, -70); kw(w(10, "libre"), e(10, 0.4), "LIBRE", "green")
note(w(12, "seule"), e(12, 0.3), "SEULE POUR PAYER", "red", "ct_hc", 0, -70); kw(w(13, "familles"), e(13, 0.4), "LES FAMILLES", "gold")
note(w(14, "sous"), e(15, 0.3), "SOUS CONTRAT", "blue", "ct_sc", 0, -70); kw(w(16, "rémunération"), e(16, 0.4), "ÉTAT PAIE LES PROFS", "blue")
KC(w(18, "millions"), w(18, "17"), "2 MILLIONS D'ÉLÈVES", "blue", 2, "", " MILLIONS D'ÉLÈVES", 0.6); KC(w(18, "17"), w(18, "7"), "17 %", "gold", 17, "", " %", 0.5); KC(w(18, "7"), e(18, 0.4), "7 500 ÉTABLISSEMENTS", "green", 7500, "", " ÉTABLISSEMENTS", 0.8)
note(w(19, "minuscule"), e(19, 0.2), "HORS CONTRAT : MINUSCULE", "gold", "ct_lone", 0, -60); kw(w(20, "doublé"), w(20, "2"), "×2", "red"); KC(w(20, "pour") if False else w(20, "atteindre"), e(20, 0.4), "≈ 2 % DES ÉCOLES", "gold", 2, "≈ ", " % DES ÉCOLES", 0.6)
stamp(w(17, "ordres"), e(17, 0.1), "COUR DES COMPTES · 2023", "blue", 960, STY)
# ---- CH3 ----
T["b1"] = w(23, "salaires"); T["b2"] = w(25, "locaux"); T["b3"] = w(27, "fonctionnement"); T["b4"] = w(29, "pédagogique"); T["big"] = w(31, "écrase")
kw(w(22, "quatre"), e(22, 0.3), "4 GRANDS BLOCS", "gold")
note(T["b1"], e(24, 0.3), "1 · SALAIRES", "red", "dp0", 0, -60); note(T["b2"], e(26, 0.3), "2 · LOCAUX", "blue", "dp1", 0, -60); note(T["b3"], e(28, 0.3), "3 · FONCTIONNEMENT", "gold", "dp2", 0, -60); note(T["b4"], e(30, 0.3), "4 · PÉDAGOGIE", "green", "dp3", 0, -60)
note(w(24, "enseignants"), e(24, 0.3), "ENSEIGNANTS · ADMINISTRATION", "white", "dp0", 0, -135); note(w(26, "loyer"), e(26, 0.3), "LOYER · EMPRUNT · TRAVAUX", "white", "dp1", 0, -135); note(w(28, "énergie"), e(28, 0.3), "ÉNERGIE · ASSURANCES", "white", "dp2", 0, -135); note(w(30, "manuels"), e(30, 0.3), "MANUELS · SORTIES", "white", "dp3", 0, -135)
kw(T["big"], e(31, 0.4), "UN POSTE ÉCRASE LES AUTRES", "red")
# ---- CH4 ----
T["tow_on"] = w(33, "moitié"); T["c30"] = w(40, "trente"); T["c20"] = w(40, "vingt"); T["hc_pay"] = w(43, "l'école"); T["st_pay"] = w(45, "l'état")
kw(w(32, "salaires"), w(33, "moitié"), "LES SALAIRES", "red"); KC(w(33, "moitié"), e(33, 0.4), "+ DE 50 % DU BUDGET", "red", 50, "+ DE ", " % DU BUDGET", 0.7)
note(T["tow_on"], e(33, 0.3), "SALAIRES", "red", "sa_tower", 0, -60); note(T["tow_on"] + 0.5, e(33, 0.3), "AUTRES POSTES", "blue", "sa_rest", 0, -60)
kw(w(35, "temps"), e(35, 0.4), "DU TEMPS HUMAIN", "gold"); kw(w(39, "souple"), e(39, 0.4), "COÛT NON SOUPLE", "white")
note(T["c30"], e(40, 0.3), "30 ÉLÈVES", "green", "sa_c30", 0, -60); note(T["c20"], e(40, 0.3), "20 ÉLÈVES", "blue", "sa_c20", 0, -60); kw(w(40, "autant"), e(40, 0.4), "≈ MÊME COÛT", "gold")
kw(w(41, "remplissage"), e(41, 0.4), "TAUX DE REMPLISSAGE", "green"); kw(w(42, "qui"), e(42, 0.4), "QUI PAIE LES PROFS ?", "gold")
note(T["hc_pay"], e(44, 0.3), "HORS CONTRAT : L'ÉCOLE", "red", "sa_school", 0, -60); note(T["st_pay"], e(46, 0.3), "SOUS CONTRAT : L'ÉTAT", "blue", "sa_state", 0, -60)
# ---- CH5 ----
T["fees_on"] = w(49, "frais"); T["gauge_on"] = w(51, "seuil"); T["thr_on"] = w(51, "minimum"); T["inv_on"] = w(54, "investir"); T["cost_on"] = w(57, "charges"); T["enrol_on"] = w(58, "inscriptions")
kw(T["fees_on"], e(49, 0.4), "FRAIS DE SCOLARITÉ", "gold"); note(T["fees_on"], e(50, 0.3), "100 % DES FAMILLES", "green", "hc_chest", 0, -70)
note(w(50, "quelques"), w(50, "plusieurs"), "QUELQUES MILLIERS €", "white", "hc_chest", 0, -135); note(w(50, "plusieurs"), e(50, 0.3), "PARFOIS DES DIZAINES DE MILLIERS €", "gold", "hc_chest", 0, -135)
kw(T["gauge_on"], e(51, 0.4), "SEUIL DE RENTABILITÉ", "gold"); note(T["thr_on"], e(53, 0.3), "NOMBRE MINIMUM D'ÉLÈVES", "blue", "hc_gauge", 0, -60)
stamp(w(53, "estimations"), e(53, 0.2), "ESTIMATIONS · PAS OFFICIEL", "gold", 960, STY)
kw(T["inv_on"], e(54, 0.4), "INVESTIR D'ABORD", "red"); kw(w(55, "centaines"), e(55, 0.4), "CENTAINES DE MILLIERS €", "red"); note(w(55, "locaux"), e(55, 0.3), "LOCAUX · TRAVAUX · MATÉRIEL", "white", "hc_inv", 0, -60)
kw(w(56, "démarrage"), e(56, 0.4), "LE DÉMARRAGE", "gold"); note(T["cost_on"], e(57, 0.3), "CHARGES : DÈS LE JOUR 1", "red", "hc_cost", 0, -60); note(T["enrol_on"], e(58, 0.3), "INSCRIPTIONS : LENTES", "blue", "hc_enr", 0, -60)
# ---- CH6 ----
T["state_s"] = w(61, "l'état"); T["tow8"] = w(62, "8"); T["coll_on"] = w(63, "collectivités"); T["fam_s"] = w(66, "familles")
KC(w(60, "trois"), e(60, 0.4), "3 SOURCES", "gold", 3, "", " SOURCES", 0.5); note(T["state_s"], e(62, 0.3), "L'ÉTAT", "blue", "so_state", 0, -60)
stamp(w(62, "cour"), e(62, -0.1), "COUR DES COMPTES · 2022", "blue", 960, STY); KC(w(62, "8"), w(62, "142"), "8 Md€", "blue", 8, "", " Md€", 0.6); KC(w(62, "142"), e(62, 0.4), "142 000 PROFS", "green", 142000, "", " PROFS", 0.9)
note(T["coll_on"], e(65, 0.3), "COLLECTIVITÉS", "gold", "so_coll", 0, -60); note(w(64, "communes"), w(64, "départements"), "COMMUNES · PRIMAIRE", "white", "so_coll", 0, -125); note(w(64, "départements"), w(64, "régions"), "DÉPARTEMENTS · COLLÈGES", "white", "so_coll", 0, -125); note(w(64, "régions"), e(64, 0.3), "RÉGIONS · LYCÉES", "white", "so_coll", 0, -125)
stamp(w(65, "forfait"), e(65, 0.2), "FORFAIT D'EXTERNAT", "gold", 960, STY)
note(T["fam_s"], e(69, 0.3), "FAMILLES", "green", "so_fam", 0, -60); note(w(68, "centaines"), e(68, 0.3), "CENTAINES À MILLIERS € / AN", "white", "so_fam", 0, -125); kw(w(69, "quart"), e(69, 0.4), "≈ 1 QUART", "gold")
kw(w(71, "immobilier"), e(71, 0.4), "L'IMMOBILIER", "red")
# ---- CH7 ----
T["works_on"] = w(76, "construire"); T["loan_on"] = w(79, "emprunt"); T["chain_on"] = w(79, "années")
kw(w(72, "angle"), e(72, 0.4), "L'ANGLE MORT", "red"); note(w(73, "bâtiments"), e(73, 0.3), "BÂTIMENTS : À LA CHARGE DE L'ÉCOLE", "red", "im_build", 0, -70)
note(w(74, "enseignants"), e(74, 0.3), "PROFS : L'ÉTAT", "blue", "im_build", 0, -135); note(w(75, "fonctionnement"), e(75, 0.3), "FONCTIONNEMENT : COLLECTIVITÉS", "gold", "im_build", 0, -135)
note(w(76, "toiture"), w(76, "alarmes"), "TOITURE", "white", "im_crane", 0, -60); note(w(76, "alarmes"), w(76, "mettre"), "ALARMES", "white", "im_crane", 0, -60); note(w(76, "mettre"), w(76, "c'est"), "NORMES", "white", "im_crane", 0, -60); kw(w(76, "c'est"), e(76, 0.4), "C'EST L'ÉCOLE QUI PAIE", "red")
note(w(77, "familles"), e(77, 0.3), "FAMILLES · DONS", "green", "im_bricks", 0, -60); kw(w(78, "fragiles"), e(78, 0.4), "BUDGETS FRAGILES", "red"); note(T["loan_on"], e(79, 0.3), "EMPRUNT", "gold", "im_bank", 0, -60); note(T["chain_on"], e(79, 0.3), "DES ANNÉES", "red", "im_chain", 0, -60)
# ---- CH8 ----
T["s100"] = w(81, "100"); T["rec_on"] = w(82, "600"); T["sal_on"] = w(84, "dix"); T["loy_on"] = w(85, "loyer"); T["fct_on"] = w(86, "énergie"); T["s130"] = w(89, "130"); T["rec2"] = w(90, "780")
kw(w(80, "exercice"), e(80, 0.4), "SIMULATION", "gold"); stamp(w(80, "illustratifs"), e(80, 0.1), "CHIFFRES ILLUSTRATIFS", "gold", 960, STY)
KC(T["s100"], e(81, 0.4), "100 ÉLÈVES", "blue", 100, "", " ÉLÈVES", 0.6); note(w(81, "6"), e(81, 0.3), "6 000 € / AN", "white", "sm_cA", 0, -60)
KC(T["rec_on"], e(82, 0.4), "600 000 €", "green", 600000, "", " €", 0.7); note(T["rec_on"], e(84, 0.2), "RECETTES", "green", "sm_recA", -130, -60)
kw(w(83, "dépenses"), e(83, 0.3), "LES DÉPENSES", "red"); KC(w(84, "520"), e(84, 0.4), "520 000 €", "red", 520000, "", " €", 0.8); note(T["sal_on"], e(84, 0.3), "SALAIRES (13 PERS.)", "red", "sm_expA", 150, -60)
KC(w(85, "60"), e(85, 0.3), "60 000 €", "gold", 60000, "", " €", 0.5); note(T["loy_on"], e(85, 0.3), "LOYER", "gold", "sm_expA", 150, -125); KC(w(86, "40"), e(86, 0.3), "40 000 €", "gold", 40000, "", " €", 0.5); note(T["fct_on"], e(86, 0.3), "ÉNERGIE · CANTINE…", "gold", "sm_expA", 150, -190)
KC(w(87, "620"), w(87, "600"), "620 000 €", "red", 620000, "", " €", 0.7); kw(w(87, "600"), e(87, 0.4), "600 000 €", "green", cnt=cn(600000, "", " €", w(87, "600"), 0.5))
KC(w(88, "perd"), e(88, 0.5), "−20 000 € / AN", "red", 20000, "−", " € / AN", 0.6)
KC(T["s130"], e(89, 0.3), "130 ÉLÈVES", "blue", 130, "", " ÉLÈVES", 0.6); KC(T["rec2"], e(90, 0.4), "780 000 €", "green", 780000, "", " €", 0.8); note(T["rec2"], e(92, 0.2), "RECETTES", "green", "sm_recB", 0, -60)
note(w(91, "salaires"), e(91, 0.3), "SALAIRES + LOYER : QUASI FIXES", "red", "sm_expB", 0, -60); KC(w(92, "150"), e(92, 0.5), "+ 150 000 € / AN", "green", 150000, "+ ", " € / AN", 0.8)
KC(w(93, "trente"), e(93, 0.4), "+30 ÉLÈVES", "green", 30, "+", " ÉLÈVES", 0.5); kw(w(94, "levier"), e(94, 0.4), "EFFET DE LEVIER", "gold"); note(w(95, "perdre"), e(95, 0.3), "QUELQUES ÉLÈVES EN MOINS = LE ROUGE", "red", "sm_a", 0, -60)
# ---- CH9 ----
T["task_on"] = w(97, "budget"); T["asso_on"] = w(99, "associations"); T["watch_on"] = w(103, "surveille")
kw(w(96, "directeur"), e(96, 0.4), "LE DIRECTEUR", "gold")
for k, (wd, txt, col, dx) in enumerate([("budget", "BUDGET", "gold", -520), ("banque", "BANQUE", "blue", -260), ("recrute", "RECRUTER", "green", 0), ("inscriptions", "INSCRIPTIONS", "red", 270), ("trésorerie", "TRÉSORERIE", "white", 540)]): note(w(97, wd), e(97, 0.3), txt, col, "dr_tasks", dx, -100)
kw(w(98, "profit"), e(98, 0.4), "PAS DE PROFIT À MAXIMISER", "green"); note(T["asso_on"], e(99, 0.3), "ASSOCIATIONS NON LUCRATIVES", "green", "dr_loop", 0, -70); kw(w(100, "réinvestis"), e(100, 0.4), "RÉINVESTIS DANS L'ÉCOLE", "gold")
note(w(101, "hors"), e(102, 0.3), "HORS CONTRAT : STATUT PLUS LIBRE", "gold", "dr_dir", 0, -60); note(T["watch_on"], e(103, 0.3), "L'ÉTAT SURVEILLE", "blue", "dr_shield", 0, -60); kw(w(105, "erreur"), e(105, 0.4), "ERREUR DE PRÉVISION", "red")
# ---- CH10 ----
T["r1"] = w(107, "démographie"); T["demo_out"] = w(108, "baisse"); T["r2"] = w(110, "concurrence"); T["r3"] = w(112, "règlementation"); T["r4"] = w(114, "trésorerie"); T["drain"] = w(115, "tombent")
kw(w(106, "stable"), e(106, 0.4), "UN ÉQUILIBRE STABLE ?", "gold"); kw(T["r1"], e(107, 0.4), "1 · DÉMOGRAPHIE", "red"); note(T["demo_out"], e(109, 0.3), "BAISSE DES EFFECTIFS · RENTRÉE 2024", "red", "rk_demo", 0, -60)
kw(T["r2"], e(110, 0.4), "2 · CONCURRENCE", "blue"); note(w(111, "public"), e(111, 0.3), "PRIVÉ ET PUBLIC", "white", "rk_conc", 0, -60); kw(T["r3"], e(112, 0.4), "3 · RÈGLEMENTATION", "gold"); note(w(113, "contrôles"), e(113, 0.3), "CONTRÔLES · NORMES · TRANSPARENCE", "white", "rk_reg", 0, -60)
kw(T["r4"], e(114, 0.4), "4 · TRÉSORERIE", "green"); note(T["drain"], e(115, 0.3), "COÛTS D'UN COUP", "red", "rk_tres", 0, -60); kw(w(116, "gestionnaire"), e(116, 0.4), "BON GESTIONNAIRE", "gold")
# ---- CH11 ----
T["forfait_on"] = w(118, "forfait"); T["flou_q"] = w(121, "inverse"); T["fam_q"] = w(123, "familles")
kw(w(117, "débat"), e(117, 0.4), "LE DÉBAT S'ENFLAMME", "red"); note(T["forfait_on"], e(118, 0.3), "FORFAIT D'EXTERNAT", "gold", "fr_coin", 0, -60)
stamp(w(119, "représentants"), e(119, -0.1), "ENSEIGNEMENT CATHOLIQUE (FNOGEC)", "gold", 960, STY); KC(w(119, "900"), e(119, 0.4), "≈ 900 M€ / AN RÉCLAMÉS", "gold", 900, "≈ ", " M€ / AN RÉCLAMÉS", 0.8)
kw(w(120, "flou"), e(120, 0.4), "PÉRIMÈTRE FLOU", "red"); note(T["flou_q"], e(121, 0.3), "COMBIEN FINANCE L'ARGENT PUBLIC ?", "white", "fr_q", 0, -60)
stamp(w(122, "cour"), e(122, -0.1), "COUR DES COMPTES", "blue", 960, STY); kw(w(122, "calculer"), e(122, 0.4), "COÛT RÉEL : INCALCULABLE", "red")
note(T["fam_q"], e(124, 0.3), "AUCUN CHIFFRE NATIONAL FIABLE", "white", "fr_qL", 0, -60); kw(w(125, "pas"), e(125, 0.4), "TOUT N'EST PAS CLAIR", "gold")
# ---- CH12 ----
T["rc1"] = w(132, "salaires"); T["rc2"] = w(134, "bâtiments"); T["rc3"] = w(135, "remplissage"); T["bubble_on"] = w(136, "vous"); T["button_on"] = w(138, "abonnez"); T["press"] = w(138, "decrypt")
kw(w(126, "diriger"), e(126, 0.4), "DIRIGER UNE ÉCOLE ?", "gold"); note(w(127, "pari"), e(128, 0.3), "HORS CONTRAT : UN PARI", "gold", "cta_hc", 0, -60); note(w(129, "équilibre"), e(130, 0.3), "SOUS CONTRAT : UN ÉQUILIBRE", "blue", "cta_sc", 0, -60)
kw(w(131, "masse"), e(131, 0.4), "UNE MASSE SALARIALE", "red"); kw(w(132, "retenir"), e(132, 0.1), "À RETENIR", "gold")
note(T["rc1"], e(135, 0.3), "SALAIRES = 1ER POSTE", "red", "cta_sal", 0, -60); note(T["rc2"], e(135, 0.3), "BÂTIMENTS : L'ÉCOLE", "blue", "cta_bld", 0, -60); note(T["rc3"], e(135, 0.3), "REMPLISSAGE", "green", "cta_cls", 0, -60)
note(w(136, "financée"), e(136, 0.1), "ÉTAT OU FAMILLES ?", "gold", "bubble", 0, -70); kw(w(137, "dites"), e(137, 0.5), "COMMENTEZ", "gold"); kw(T["button_on"], e(138, 0.4), "ABONNEZ-VOUS", "red")
T["brand"] = e(138, -0.9); T["whoosh"] = -100
B["cam"] = []; t = 0.0
while t <= DUR + 1e-6:
    p, l = cam(t); B["cam"].append([round(t, 3)] + [round(x, 3) for x in p + l]); t += 1 / 30
B["fov"] = 40
open("video/assets/beats.js", "w").write("window.BEATS=" + json.dumps(B, ensure_ascii=False) + ";")
json.dump(B, open("video/assets/beats.json", "w"), ensure_ascii=False)
print("dur", DUR, "cam keys", len(B["cam"]), "notes", len(B["notes"]), "kws", len(B["kws"]), "stamps", len(B["stamps"]))
