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
ORDER = ["ship", "marche", "cout", "affret", "loyer", "couts", "equipe", "recettes", "simulation", "pointmort", "finance", "risques", "gagnants", "leviers", "cta"]
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
ORB = {n: (0.4, -0.4, 22, 18, 8, 7, 3.4) for n in ORDER}
for n in ("simulation", "pointmort"): ORB[n] = (0.3, -0.3, 22, 18, 8.5, 7.5, 4.4)
ORB["ship"] = (0.4, -0.4, 24, 20, 8.5, 7.5, 3.8); ORB["cta"] = (0.3, -0.3, 22, 18, 7.5, 6.5, 4.2)
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

# ======== overlays, all exactly on the spoken word ========
wi = lambda i, k, o=0.0: round(byl[i][k]["s"] + o, 2)
SL = [l.split() for l in open("script.txt", encoding="utf-8").read().split("\n") if l.strip()]
nrm = lambda t: re.sub(r"[^\w]", "", t.lower().replace("’", "'"))
def F(i, word, n=0):
    h = [k for k, tk in enumerate(SL[i]) if nrm(tk) == nrm(word)] or [k for k, tk in enumerate(SL[i]) if nrm(word) in nrm(tk)]
    if len(h) <= n: raise SystemExit(f"{word!r}#{n} not in line {i}: {SL[i]}")
    return h[n]
A = lambda i, word, n=0, o=0.0: wi(i, F(i, word, n), o)
def cn(to, pre="", suf="", t0=0.0, d=0.7, dec=0): return dict(to=to, pre=pre, suf=suf, t0=t0, d=d, dec=dec)
def KWt(t0, t1, text, color="gold", rot=-2): kw(t0, t1, text, color, rot)
def KCt(t0, t1, text, color, to, pre="", suf="", d=0.7, dec=0): kw(t0, t1, text, color, cnt=cn(to, pre, suf, t0, d, dec))
def Nt(t0, t1, text, kind, anchor, dx=0, dy=-70): note(t0, t1, text, kind, anchor, dx, dy)
def STt(t0, t1, text, kind): stamp(t0, t1, text, kind, 960, 770)
E = lambda i, o=0.3: e(i, o)
# ---- CH1 ----
KWt(0.1, e(0, 0.1), "AFFRÉTER UN NAVIRE DE CROISIÈRE", "gold")
STt(A(1, "Icon"), E(1, 0.1), "ESTIMATION DE PRESSE", "gold"); KCt(A(1, "deux"), E(1, 0.2), "≈ 2 MD $", "green", 2, "≈ ", " MD $", 0.5)
Nt(A(1, "Icon"), A(1, "deux"), "ICON OF THE SEAS", "white", "sh_ship"); T["coin_on"] = wi(2, 0); Nt(wi(2, 0), E(2, 0.3), "2 MD $", "gold", "sh_coin")
KWt(A(2, "avant"), E(2, 0.4), "AVANT LE 1ER BILLET", "red"); KWt(A(3, "pari"), A(3, "Et"), "UN PARI FINANCIER", "red"); KWt(A(3, "affréter"), E(3, 0.4), "AFFRÉTER OU ACHETER ?", "gold")
# ---- CH2 ----
T["fleet_on"] = wi(4, 0); T["pax_on"] = A(4, "trente-sept"); T["tower_on"] = A(5, "quatre-vingt-onze")
STt(A(4, "CLIA"), A(4, "trente-sept"), "CLIA · ASSOCIATION PRO", "blue"); KCt(A(4, "trente-sept"), A(4, "soit"), "37,3 M PASSAGERS", "blue", 37.3, "", " M PASSAGERS", 0.7, 1); KCt(A(4, "soit"), A(4, "Elle"), "+ 7,7 %", "green", 7.7, "+ ", " %", 0.5, 1)
KWt(A(4, "trente-neuf"), E(4, 0.4), "39 M EN 2026", "gold"); KCt(A(5, "quatre-vingt-onze"), A(5, "cent"), "91 NAVIRES", "blue", 91, "", " NAVIRES", 0.6); KCt(A(5, "cent"), E(5, 0.3), "> 100 MD $", "green", 100, "> ", " MD $", 0.7)
Nt(A(5, "cent"), E(5, 0.3), "COMMANDES", "gold", "mk_tower"); KWt(A(6, "parie"), E(6, 0.4), "UN PARI SUR LA DEMANDE", "gold"); KWt(A(7, "toujours"), A(7, "parce"), "TOUJOURS PLUS GRAND", "red"); Nt(A(7, "répartit"), E(7, 0.3), "COÛTS FIXES RÉPARTIS", "green", "mk_fleet")
# ---- CH3 ----
T["wish_on"] = A(9, "Disney"); T["icon_on"] = A(9, "Icon"); T["msc_on"] = A(10, "MSC"); T["avg_on"] = A(11, "obtient")
KWt(A(8, "prix"), E(8, 0.4), "PAS DE PRIX OFFICIEL", "red"); Nt(A(9, "Disney"), A(9, "Icon"), "DISNEY WISH ≈ 1 MD $", "blue", "ct_wish"); Nt(A(9, "Icon"), E(9, 0.3), "ICON ≈ 2 MD $", "gold", "ct_icon")
STt(A(9, "aurait"), E(9, 0.2), "ESTIMATIONS DE PRESSE", "gold"); STt(A(10, "MSC"), A(10, "trois"), "MSC · SAINT-NAZAIRE", "blue"); KCt(A(10, "trois"), A(10, "soit"), "3,5 MD €", "green", 3.5, "", " MD €", 0.6, 1)
Nt(A(10, "soit"), E(10, 0.3), "≈ 1,75 MD € / NAVIRE", "gold", "ct_msc"); KCt(A(11, "obtient"), E(11, 0.4), "≈ 1,1 MD $", "green", 1.1, "≈ ", " MD $", 0.6, 1); Nt(A(11, "obtient"), E(11, 0.3), "MOYENNE", "white", "ct_avg")
KWt(wi(12, 0), E(12, 0.3), "ORDRES DE GRANDEUR", "gold"); KWt(A(13, "payé"), E(13, 0.4), "PAYÉ PAR ÉTAPES", "gold")
# ---- CH4 ----
T["tc_on"] = A(15, "temps"); T["bb_on"] = A(16, "coque"); T["crew_b"] = A(16, "embaucher")
KWt(A(14, "louer"), E(14, 0.3), "LOUER, PAS ACHETER", "green"); Nt(A(15, "temps"), A(15, "équipage"), "À TEMPS", "gold", "af_tc"); Nt(A(15, "équipage"), A(15, "locataire"), "ÉQUIPAGE FOURNI", "green", "af_crew"); KWt(A(15, "loyer"), E(15, 0.4), "LOYER PAR JOUR", "blue")
Nt(A(16, "coque"), A(16, "embaucher"), "COQUE NUE", "red", "af_bb"); Nt(A(16, "embaucher"), E(16, 0.3), "TOUT À SA CHARGE", "red", "af_empty"); KWt(A(17, "évite"), A(17, "Mais"), "ON ÉVITE L'ACHAT", "green"); KWt(A(17, "paie"), E(17, 0.4), "MAIS ON PAIE CHAQUE JOUR", "red")
# ---- CH5 ----
T["cal_on"] = A(18, "jour"); T["coin5_on"] = A(19, "cent"); T["floor_on"] = A(20, "propriétaire")
KWt(A(18, "grille"), E(18, 0.4), "PAS DE GRILLE PUBLIQUE", "red"); KWt(A(19, "simulation"), A(19, "pas"), "SIMULATION ILLUSTRATIVE", "gold"); KCt(A(19, "virgule"), A(19, "cent"), "1,2 MD €", "blue", 1.2, "", " MD €", 0.5, 1)
KCt(A(19, "cent"), E(19, 0.3), "180 000 € / JOUR", "red", 180000, "", " € / JOUR", 0.8); Nt(A(19, "coût"), E(19, 0.3), "COÛT DE CAPITAL", "white", "ly_coin"); KWt(A(20, "plancher"), E(20, 0.4), "LE PLANCHER D'UN LOYER", "gold"); Nt(A(20, "marge"), E(20, 0.3), "+ MARGE", "gold", "ly_floor")
KWt(A(21, "payé"), E(21, 0.4), "PAYÉ AU JOUR LE JOUR", "gold")
# ---- CH6 ----
T["sal6"] = A(23, "virgule", 0); T["fuel6"] = A(23, "virgule", 1); T["food6"] = A(23, "virgule", 2); T["pie6_on"] = A(24, "onze")
KWt(A(22, "quatre-vingt-cinq"), A(22, "Ces"), "85 000 À 300 000 $ / JOUR", "gold"); STt(A(22, "Ces"), E(22, 0.2), "SITES PEU FIABLES", "red"); STt(A(23, "Carnival"), A(23, "Sur"), "CARNIVAL · COMPTES 2025", "blue")
Nt(T["sal6"], T["fuel6"], "SALAIRES 1,9 MD $", "blue", "cs_sal"); Nt(T["fuel6"], T["food6"], "CARBURANT 1,4 MD $", "gold", "cs_fuel"); Nt(T["food6"], E(23, 0.3), "NOURRITURE 1,1 MD $", "green", "cs_food")
KCt(A(24, "onze"), E(24, 0.4), "≈ 11 %", "gold", 11, "≈ ", " %", 0.6); Nt(A(24, "carburant"), E(24, 0.3), "CARBURANT", "gold", "cs_pie"); KWt(A(25, "carburant"), A(25, "ensemble"), "PAS LE CARBURANT", "red"); KWt(A(25, "ensemble"), E(25, 0.4), "TOUT S'ADDITIONNE", "gold")
# ---- CH7 ----
T["crew7_on"] = A(26, "Cuisiniers"); T["fuel7_on"] = A(27, "carburant"); T["food7_on"] = A(28, "nourriture")
KWt(A(26, "équipes"), A(26, "Cuisiniers"), "LES ÉQUIPES", "blue"); KCt(A(26, "millier"), E(26, 0.3), "> 1 000 D'ÉQUIPAGE", "blue", 1000, "> ", " D'ÉQUIPAGE", 0.7); Nt(A(26, "Cuisiniers"), E(26, 0.3), "ÉQUIPAGE", "white", "eq_crew")
KWt(A(27, "vitesse"), E(27, 0.4), "VITESSE · PRIX DU MARCHÉ", "gold"); Nt(A(27, "carburant"), E(27, 0.3), "CARBURANT", "gold", "eq_fuel"); Nt(A(28, "nourriture"), E(28, 0.3), "NOURRITURE", "green", "eq_food")
KWt(A(28, "droits"), A(28, "tous"), "PORTS · ASSURANCES · ENTRETIEN", "blue"); KWt(A(28, "tous"), E(28, 0.4), "TOUS LES JOURS", "red"); KWt(A(29, "presque"), E(29, 0.4), "MÊME COÛT, MOINS DE RECETTES", "gold")
# ---- CH8 ----
T["tk_on"] = A(30, "billet"); T["ob_on"] = A(30, "dépenses"); T["gauge_on"] = A(32, "cent")
KWt(A(30, "deux"), A(30, "Le"), "DEUX SOURCES", "gold"); Nt(A(30, "billet"), A(30, "dépenses"), "BILLET", "blue", "rc_tk"); Nt(A(30, "dépenses"), E(30, 0.3), "DÉPENSES À BORD", "gold", "rc_ob"); KWt(A(31, "remplit"), E(31, 0.4), "REMPLIR, PUIS VENDRE", "green")
KWt(A(32, "remplissage"), A(32, "Selon"), "LE REMPLISSAGE", "gold"); STt(A(32, "Carnival"), A(32, "affiche"), "CARNIVAL · RÉSULTATS 2025", "blue"); Nt(A(32, "taux"), A(32, "cent"), "OCCUPATION", "white", "rc_gauge"); KCt(A(32, "cent"), A(32, "plus"), "105 %", "green", 105, "", " %", 0.6)
STt(A(33, "Royal"), A(33, "dix-sept"), "ROYAL CARIBBEAN · 2025", "blue"); KCt(A(33, "dix-sept"), A(33, "et"), "17,9 MD $ DE REVENUS", "green", 17.9, "", " MD $ DE REVENUS", 0.7, 1); KCt(A(33, "quatre"), E(33, 0.3), "4,3 MD $ DE BÉNÉFICE", "gold", 4.3, "", " MD $ DE BÉNÉFICE", 0.7, 1)
# ---- CH9 ----
T["rev9"] = A(35, "six"); T["cost9"] = A(36, "quatre"); T["res9"] = A(37, "deux"); T["sship_on"] = A(38, "navire")
KWt(A(34, "simulation"), A(34, "pas"), "SIMULATION ILLUSTRATIVE", "gold"); KWt(A(34, "pas"), E(34, 0.4), "PAS DES COMPTES RÉELS", "red")
KCt(A(35, "cinquante"), A(35, "Chaque"), "3 150 PASSAGERS", "blue", 3150, "", " PASSAGERS", 0.7); KCt(A(35, "deux"), A(35, "Cela"), "200 € / PAX / JOUR", "gold", 200, "", " € / PAX / JOUR", 0.6); KCt(A(35, "six"), E(35, 0.3), "630 k€ / JOUR", "green", 630, "", " k€ / JOUR", 0.7)
Nt(A(35, "six"), E(35, 0.3), "RECETTES", "green", "sm_rev"); KCt(A(36, "quatre"), E(36, 0.3), "430 k€ / JOUR", "red", 430, "", " k€ / JOUR", 0.7); Nt(A(36, "coûts"), E(36, 0.3), "COÛTS D'EXPLOITATION", "red", "sm_cost")
KCt(A(37, "deux"), A(37, "soit"), "200 k€ / JOUR", "white", 200, "", " k€ / JOUR", 0.6); KCt(A(37, "soixante-six"), E(37, 0.3), "66 M€ / AN", "gold", 66, "", " M€ / AN", 0.7); Nt(A(37, "reste"), E(37, 0.3), "IL RESTE", "white", "sm_res")
KCt(A(38, "dix-huit"), E(38, 0.4), "18 ANS POUR REMBOURSER", "red", 18, "", " ANS POUR REMBOURSER", 0.7); Nt(A(38, "navire"), E(38, 0.3), "1,2 MD €", "gold", "sm_ship")
# ---- CH10 ----
T["bef10"] = round(wi(39, 0) + 0.3, 2); T["aft10"] = A(42, "deviennent"); T["fix10"] = A(43, "loyer")
KWt(A(39, "dix"), E(39, 0.3), "10 % DE PASSAGERS EN MOINS", "red"); KCt(A(40, "soixante-trois"), A(40, "Mais"), "− 63 k€ / JOUR", "red", 63, "− ", " k€ / JOUR", 0.6); KWt(A(40, "équipage"), E(40, 0.4), "COÛTS FIXES", "gold")
KWt(A(41, "levier"), A(41, "quand"), "EFFET DE LEVIER DES COÛTS FIXES", "blue"); Nt(wi(42, 0), A(42, "deviennent"), "AVANT : 200 k€", "white", "pm_bef"); KCt(A(42, "quarante"), A(42, "Trente"), "140 k€ / JOUR", "red", 140, "", " k€ / JOUR", 0.6); Nt(A(42, "deviennent"), E(42, 0.3), "APRÈS : 140 k€", "red", "pm_aft")
KCt(A(42, "Trente"), E(42, 0.4), "− 30 % DE MARGE", "red", 30, "− ", " % DE MARGE", 0.6); KWt(A(43, "tombe"), E(43, 0.4), "LE LOYER TOMBE QUAND MÊME", "red"); Nt(A(43, "cabines"), E(43, 0.3), "CABINES VIDES", "red", "pm_fix")
# ---- CH11 ----
T["bank_on"] = A(44, "banques"); T["loan_on"] = A(44, "emprunte"); T["fship_on"] = A(45, "navire"); T["rate_on"] = A(46, "intérêt")
KWt(A(44, "emprunte"), A(44, "auprès"), "ON EMPRUNTE", "gold"); Nt(A(44, "banques"), E(44, 0.3), "BANQUES · CRÉDIT EXPORT", "blue", "fi_bank"); STt(A(45, "analyse"), A(45, "Mais"), "ANALYSE GÉNÉRALE · NON SOURCÉE", "gold"); KWt(A(45, "rembourser"), E(45, 0.4), "REMBOURSER LA DETTE", "red")
Nt(A(46, "monte"), E(46, 0.3), "TAUX ↑", "red", "fi_rate"); KWt(A(46, "moins"), E(46, 0.3), "MOINS RENTABLE", "red"); KWt(A(47, "dette"), E(47, 0.4), "DETTE = REMPLISSAGE", "gold")
# ---- CH12 ----
T["delay_on"] = A(48, "délai"); T["idle_on"] = A(49, "navires"); T["fuel12_on"] = A(50, "carburant"); T["contract_on"] = A(51, "contrat")
KWt(A(48, "premier"), A(48, "chantier"), "RISQUE 1 : LE DÉLAI", "gold"); KCt(A(48, "neuf"), E(48, 0.3), "> 900 JOURS DE CHANTIER", "red", 900, "> ", " JOURS DE CHANTIER", 0.7); Nt(A(48, "délai"), E(48, 0.3), "CAPITAL IMMOBILISÉ", "white", "rk_clock")
KWt(A(49, "deuxième"), A(49, "Pendant"), "RISQUE 2 : LA DEMANDE", "red"); Nt(A(49, "navires"), A(49, "C'est"), "À QUAI", "white", "rk_idle"); STt(A(49, "analyse"), E(49, 0.2), "ANALYSE GÉNÉRALE", "gold")
KWt(A(50, "troisième"), E(50, 0.4), "RISQUE 3 : CARBURANT · TAUX", "red"); Nt(A(50, "carburant"), A(50, "taux"), "CARBURANT ↑", "red", "rk_fuel"); Nt(A(50, "taux"), E(50, 0.3), "TAUX ↑", "red", "rk_rate")
KWt(A(51, "quatrième"), A(51, "S'il"), "RISQUE 4 : LE CONTRAT", "red"); KWt(A(51, "loyer"), E(51, 0.4), "LOYER FIXE · DEMANDE INCERTAINE", "gold"); Nt(A(51, "contrat"), E(51, 0.3), "CONTRAT", "white", "rk_contract")
# ---- CH13 ----
T["fleet13_on"] = A(52, "grands"); T["tower13_on"] = A(52, "Carnival"); T["small_on"] = A(54, "petit")
KWt(A(52, "grands"), A(52, "Carnival"), "LES GRANDS GROUPES", "gold"); STt(A(52, "Carnival"), A(52, "et"), "CARNIVAL · BÉNÉFICE NET RECORD", "blue"); KCt(A(52, "quatre"), E(52, 0.3), "4,3 MD $ · ROYAL CARIBBEAN", "green", 4.3, "", " MD $ · ROYAL CARIBBEAN", 0.7, 1)
Nt(A(52, "Surtout"), A(52, "Carnival"), "FLOTTES", "white", "gn_fleet"); KWt(A(53, "séries"), A(53, "négocient"), "DES NAVIRES PAR SÉRIES", "green"); KWt(A(53, "fidèles"), E(53, 0.4), "CLIENTS FIDÈLES", "blue")
KWt(A(54, "échelle"), A(54, "volumes"), "PAS D'ÉCHELLE", "red"); Nt(A(54, "jour"), E(54, 0.3), "LOYER FIXE", "red", "gn_small"); KWt(A(55, "grandes"), E(55, 0.4), "LES GÉANTS PARIENT", "gold")
# ---- CH14 ----
T["fill_on"] = A(57, "Remplir"); T["drink_on"] = A(57, "Augmenter"); T["big_on"] = A(57, "Construire"); T["long_on"] = A(58, "longue"); T["life_on"] = A(59, "durée")
KWt(A(56, "leviers"), A(56, "qui"), "LEVIERS CLASSIQUES", "gold"); STt(A(56, "relèvent"), E(56, 0.3), "ANALYSE · PAS DES STATISTIQUES", "gold")
Nt(A(57, "Remplir"), A(57, "Augmenter"), "REMPLIR LE NAVIRE", "green", "lv_fill"); Nt(A(57, "Augmenter"), A(57, "Construire"), "DÉPENSES À BORD", "gold", "lv_drink"); Nt(A(57, "Construire"), E(57, 0.3), "PLUS GRAND", "blue", "lv_big")
Nt(A(58, "longue"), A(58, "Aucun"), "AFFRÈTEMENT LONG", "green", "lv_long"); KWt(A(58, "Aucun"), E(58, 0.4), "AUCUN LEVIER NE SUPPRIME LE RISQUE", "gold"); KCt(A(59, "vingt-cinq"), E(59, 0.4), "25 ANS DE VIE", "green", 25, "", " ANS DE VIE", 0.6); Nt(A(59, "durée"), E(59, 0.3), "DURÉE DE VIE", "white", "lv_life")
# ---- CH15 ----
T["rc1"] = A(62, "coûte"); T["rc2"] = A(62, "consomme"); T["rc3"] = A(62, "plein"); T["bubble_on"] = wi(64, 0); T["button_on"] = wi(65, 0); T["press"] = round(A(65, "abonnez-vous") + 0.3, 2)
KWt(A(60, "rentable"), E(60, 0.3), "RENTABLE ?", "gold"); KWt(A(61, "massif"), E(61, 0.4), "INVESTISSEMENT MASSIF", "red")
Nt(A(62, "coûte"), A(62, "consomme"), "1 À 2 MD", "gold", "cta_cost"); Nt(A(62, "consomme"), A(62, "plein"), "CENTAINES DE MILLIERS € / JOUR", "red", "cta_day"); Nt(A(62, "plein"), E(62, 0.3), "RESTER PLEIN", "blue", "cta_fill"); KWt(A(63, "pari"), E(63, 0.4), "UN PARI FINANCIER", "gold")
Nt(A(64, "posséder"), A(64, "commentaire"), "POSSÉDER OU AFFRÉTER ?", "gold", "bubble"); KWt(A(64, "commentaire"), E(64, 0.5), "COMMENTEZ", "gold"); KWt(A(65, "abonnez-vous"), E(65, 0.4), "ABONNEZ-VOUS", "red")
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
