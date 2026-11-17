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
ORDER = ["equipe", "camion", "mo", "vehicule", "saison", "demande", "petites", "marge", "risque", "calendrier", "cta"]
FIRST = dict(equipe=0, camion=2, mo=5, vehicule=7, saison=8, demande=10, petites=12, marge=13, risque=14, calendrier=15, cta=17)
LAST = dict(equipe=1, camion=4, mo=6, vehicule=7, saison=9, demande=11, petites=12, marge=13, risque=14, calendrier=16, cta=18)
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
for n in ORDER: hero(n, 0.0 if n == "equipe" else s(FIRST[n]), e(LAST[n], 0.1) if n != "cta" else DUR - LOOP + 0.4)
hero("equipe", DUR - LOOP - 0.6, DUR + 3)
ORB = dict(equipe=(0.5, -0.4, 26, 20, 9, 9, 3.6), camion=(0.5, -0.4, 25, 20, 9, 9, 3.6), mo=(0.5, -0.4, 24, 19, 8, 8, 5.0), vehicule=(0.5, -0.4, 24, 19, 9, 9, 3.6),
           saison=(0.4, -0.4, 24, 19, 8, 8, 4.2), demande=(0.4, -0.4, 24, 19, 8, 8, 4.6), petites=(0.4, -0.3, 24, 19, 10, 10, 2.2), marge=(0.5, -0.4, 24, 19, 9, 9, 2.0),
           risque=(0.4, -0.4, 24, 19, 8, 8, 4.0), calendrier=(0.4, -0.4, 24, 19, 8.5, 8.5, 4.4), cta=(0.3, -0.3, 22, 16, 7, 7, 5.5))
START = {n: (0.0 if n == "equipe" else s(FIRST[n])) for n in ORDER}
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
T["whoosh"] = s(5) - 0.55   # one single big subject change: from the market to the costs

# ---- overlays, all exactly on the spoken word ----
T["figs_on"] = s(0, 0.3); T["coin_on"] = w(1, "milliard")
stamp(w(0, "salariés"), e(0, -0.1), "OPTL · CHAMBRE SYNDICALE", "blue", 540, 1180)
kw(w(0, "dix"), e(0, 0.4), "10 000", "gold", cnt=dict(to=10000, t0=w(0, "dix"), d=0.8)); note(w(0, "salariés"), e(0, 0.2), "SALARIÉS", "green", "eq_crowd", 0, -60)
stamp(w(1, "pèse"), e(1, -0.1), "XERFI · ESTIMATION", "blue", 540, 1180)
kw(T["coin_on"], e(1, 0.4), "1,5 Md€", "gold", cnt=dict(to=1.5, dec=1, suf=" Md€", t0=T["coin_on"], d=0.7)); note(w(1, "par"), e(1, 0.3), "PAR AN", "gold", "eq_coin", 0, -60)
T["truck_on"] = s(2, 0.15); T["crew_on"] = w(2, "bras"); T["hours_on"] = w(2, "heures")
kw(T["hours_on"], w(2, "mètres"), "HEURES DE BRAS", "gold"); kw(w(2, "mètres"), e(2, 0.4), "PAS DES M³", "red"); note(T["hours_on"], e(2, 0.2), "HEURES VENDUES", "gold", "tr_clock", 0, -60)
note(w(3, "camion"), e(3, 0.2), "UN CAMION", "blue", "tr_truck", 0, -60); note(w(3, "costauds"), e(3, 0.3), "TROIS COSTAUDS", "white", "tr_crew", 0, -60); kw(w(4, "bilan"), e(4, 0.4), "LE BILAN", "red")
T["mo_on"] = w(5, "main"); T["idle_on"] = s(6, 0.0); T["pay_on"] = w(6, "payée")
kw(T["mo_on"], w(5, "stocke"), "MAIN-D'ŒUVRE", "red"); note(w(5, "premier"), e(5, 0.3), "1ER POSTE DE COÛTS", "red", "mo_stack", 0, -60); kw(w(5, "stocke"), e(5, 0.4), "SE STOCKE PAS", "gold")
note(w(6, "mission"), e(6, 0.2), "SANS MISSION", "white", "mo_idle", 0, -60); kw(T["pay_on"], e(6, 0.4), "PAYÉE QUAND MÊME", "red")
T["veh_on"] = s(7, 0.1); T["ach_on"] = w(7, "achat"); T["ass_on"] = w(7, "assurance"); T["car_on"] = w(7, "carburant"); T["ent_on"] = w(7, "entretien"); T["burn_on"] = w(7, "roule")
kw(T["ach_on"], T["ass_on"], "ACHAT", "gold"); kw(T["ass_on"], T["car_on"], "ASSURANCE", "blue"); kw(T["car_on"], T["ent_on"], "CARBURANT", "red"); kw(T["ent_on"], T["burn_on"], "ENTRETIEN", "green"); kw(T["burn_on"], e(7, 0.4), "ROULE OU NON", "red")
note(T["ach_on"], e(7, 0.2), "ACHAT / LOCATION", "gold", "ve_key", 0, -60); note(T["ass_on"], e(7, 0.2), "ASSURANCE", "blue", "ve_shield", 0, -60); note(T["car_on"], e(7, 0.2), "CARBURANT", "red", "ve_fuel", 0, -60); note(T["ent_on"], e(7, 0.2), "ENTRETIEN", "green", "ve_wrench", 0, -60)
T["cal_on"] = s(8, 0.1); T["sum_on"] = w(8, "été"); T["eom_on"] = w(8, "fins"); T["we_on"] = w(8, "week-ends"); T["idle5_on"] = s(9, 0.1)
kw(w(8, "capricieuse"), T["sum_on"], "CAPRICIEUSE", "gold"); kw(T["sum_on"], T["eom_on"], "L'ÉTÉ", "gold"); kw(T["eom_on"], T["we_on"], "FINS DE MOIS", "gold"); kw(T["we_on"], e(8, 0.4), "WEEK-ENDS", "gold")
note(T["sum_on"], e(8, 0.2), "ÉTÉ", "gold", "sa_sun", 0, -60); note(T["eom_on"], e(8, 0.2), "PICS D'ACTIVITÉ", "gold", "sa_cal", 0, -60)
kw(w(9, "attendent"), e(9, 0.4), "ILS ATTENDENT", "white"); note(s(9, 0.3), e(9, 0.2), "SANS MISSION", "white", "sa_idle", 0, -60)
T["b23_on"] = w(10, "2023"); T["b13_on"] = w(10, "sept"); T["dn_on"] = w(11, "Moins"); T["fix_on"] = w(11, "coûts")
stamp(w(10, "2023"), w(10, "contre"), "INSEE", "blue", 540, 1180)
kw(w(10, "cinq"), w(10, "contre"), "5,9 M", "gold", cnt=dict(to=5.9, dec=1, suf=" M", t0=w(10, "cinq"), d=0.9)); kw(w(10, "contre"), e(10, 0.4), "6,95 M", "blue", cnt=dict(to=6.95, dec=2, suf=" M", t0=w(10, "contre"), d=0.8))
note(T["b23_on"], e(10, 0.2), "2023", "gold", "de_b23", 0, -60); note(T["b13_on"], e(10, 0.2), "2013", "blue", "de_b13", 0, -60)
kw(T["dn_on"], T["fix_on"], "MOINS DE CLIENTS", "red"); kw(T["fix_on"], e(11, 0.4), "COÛTS FIXES", "gold"); note(T["dn_on"], e(11, 0.2), "≈ −15 % EN 10 ANS", "red", "de_arrow", 0, -60); note(w(11, "mêmes"), e(11, 0.3), "INCHANGÉS", "red", "de_fix", 0, -60)
T["pt_on"] = s(12, 0.1); T["seven_on"] = w(12, "sept")
kw(T["seven_on"], w(12, "moins"), "7 SUR 10", "gold", cnt=dict(to=7, suf=" SUR 10", t0=T["seven_on"], d=0.4)); kw(w(12, "moins"), e(12, 0.4), "< 10 SALARIÉS", "blue"); note(T["seven_on"], e(12, 0.3), "71 % DES ENTREPRISES", "gold", "pt_seven", 0, -60)
T["pie_on"] = w(13, "quelques"); T["pie_blue"] = s(13, 0.3)
kw(w(13, "marges"), T["pie_on"], "MARGE NETTE", "green"); kw(T["pie_on"], e(13, 0.4), "QUELQUES %", "red"); note(T["pie_on"], e(13, 0.3), "TRÈS MINCE", "gold", "mg_pie", 0, -60); stamp(w(13, "américaines"), e(13, -0.1), "SOURCES AMÉRICAINES", "blue", 540, 1180)
T["quote_on"] = w(14, "devis"); T["fail_on"] = w(14, "panne"); T["rain_on"] = w(14, "pluie"); T["red_on"] = w(14, "rouge")
kw(T["quote_on"], T["fail_on"], "DEVIS TROP BAS", "red"); kw(T["fail_on"], T["rain_on"], "UNE PANNE", "red"); kw(T["rain_on"], T["red_on"], "PLUIE", "blue"); kw(T["red_on"], e(14, 0.5), "DANS LE ROUGE", "red")
note(T["quote_on"], e(14, 0.2), "DEVIS", "gold", "rk_quote", 0, -60); note(T["fail_on"], e(14, 0.2), "PANNE", "red", "rk_truck", 0, -60); note(T["rain_on"], e(14, 0.2), "PLUIE", "blue", "rk_rain", 0, -60)
T["cal2_on"] = s(15, 0.1); T["fill_on"] = w(15, "remplit"); T["void_on"] = w(16, "vide"); T["rent_on"] = w(16, "loyer")
kw(w(15, "service"), T["fill_on"], "PAS UN SERVICE", "red"); kw(T["fill_on"], e(15, 0.4), "UN CALENDRIER", "gold"); note(T["fill_on"], e(15, 0.3), "CRÉNEAUX REMPLIS", "green", "ca_cal", 0, -60)
kw(T["void_on"], T["rent_on"], "CRÉNEAU VIDE", "red"); kw(T["rent_on"], w(16, "personne"), "UN LOYER", "red"); kw(w(16, "personne"), e(16, 0.4), "PERSONNE NE PAIE", "red"); note(T["void_on"], e(16, 0.3), "0 €", "red", "ca_empty", 0, -60)
T["bubble_on"] = s(17, 0.2); T["button_on"] = w(18, "abonnez"); T["press"] = w(18, "Decrypt")
note(w(17, "prix"), e(17, 0.1), "À QUEL PRIX ?", "gold", "bubble", 0, -70); kw(w(17, "Dites"), e(17, 0.5), "COMMENTEZ", "gold")
kw(T["button_on"], e(18, 0.4), "ABONNEZ-VOUS", "red")
T["brand"] = e(18, -0.9)
B["cam"] = []; t = 0.0
while t <= DUR + 1e-6:
    p, l = cam(t); B["cam"].append([round(t, 3)] + [round(x, 3) for x in p + l]); t += 1 / 30
B["fov"] = 42
open("video/assets/beats.js", "w").write("window.BEATS=" + json.dumps(B, ensure_ascii=False) + ";")
json.dump(B, open("video/assets/beats.json", "w"), ensure_ascii=False)
print("dur", DUR, "cam keys", len(B["cam"]), "notes", len(B["notes"]), "kws", len(B["kws"]), "whoosh", T["whoosh"])
