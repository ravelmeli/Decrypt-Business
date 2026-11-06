"""v3 beat sheet. ONE continuous camera journey (no cuts, no flashes). Every overlay is anchored on the exact spoken word (offset 0)."""
import json, math, re
D = "../voice/"
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
ORDER = ["marche", "marge", "capital", "salaires", "tp", "aube", "ao", "reprise", "planning", "heures", "cta"]
FIRST = dict(marche=0, marge=2, capital=3, salaires=5, tp=6, aube=7, ao=8, reprise=9, planning=10, heures=11, cta=13)
LAST = dict(marche=1, marge=2, capital=4, salaires=5, tp=6, aube=7, ao=8, reprise=9, planning=10, heures=12, cta=14)
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
for n in ORDER: hero(n, 0.0 if n == "marche" else s(FIRST[n]), e(LAST[n], 0.1) if n != "cta" else DUR - LOOP + 0.4)
hero("marche", DUR - LOOP - 0.6, DUR + 3)
ORB = dict(marche=(0.5, -0.4, 26, 20, 9, 9, 3.6), marge=(0.5, -0.4, 24, 19, 9, 9, 2.0), capital=(0.5, -0.4, 24, 19, 8, 8, 3.6), salaires=(0.5, -0.4, 24, 19, 8, 8, 5.0),
           tp=(0.4, -0.3, 24, 19, 10, 10, 2.2), aube=(0.4, -0.4, 24, 19, 8, 8, 4.2), ao=(0.4, -0.4, 24, 19, 8, 8, 3.6), reprise=(0.5, -0.4, 24, 19, 8, 8, 3.2),
           planning=(0.4, -0.4, 24, 19, 8, 8, 4.4), heures=(0.4, -0.4, 24, 19, 8.5, 8.5, 4.0), cta=(0.3, -0.3, 22, 16, 7, 7, 5.5))
START = {n: (0.0 if n == "marche" else s(FIRST[n])) for n in ORDER}
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
T["whoosh"] = s(8) - 0.55   # one single big subject change: from the cost structure to the contracts (tenders)

# ---- overlays, all exactly on the spoken word ----
T["figs_on"] = s(0, 0.3); T["coin_on"] = w(0, "21"); T["vans_on"] = w(1, "15")
stamp(w(0, "Bpifrance"), e(0, -0.1), "BPIFRANCE CRÉATION", "blue", 540, 1180); kw(0.12, w(0, "600"), "21 Md€", "gold", cnt=dict(to=21, suf=" Md€", t0=0.12, d=round(T["coin_on"] - 0.22, 2))); note(w(0, "600"), e(0, 0.2), "600 000 PERSONNES", "green", "mc_crowd", 0, -60); kw(w(0, "600"), e(0, 0.4), "600 000", "green", cnt=dict(to=600000, t0=w(0, "600"), d=0.8))
note(w(1, "entreprises"), e(1, 0.2), "15 000 ENTREPRISES", "blue", "mc_vans", 0, -60); kw(T["vans_on"], e(1, 0.4), "15 000", "blue", cnt=dict(to=15000, t0=T["vans_on"], d=0.7)); note(w(1, "petites"), e(1, 0.3), "SOUVENT TRÈS PETITES", "white", "mc_vans", 0, -110)
T["pie_on"] = w(2, "10"); T["pie_blue"] = s(2, 0.3)
stamp(w(2, "Insee"), e(2, -0.1), "INSEE · 2015", "blue", 540, 1180); note(w(2, "taux"), e(2, 0.2), "TAUX DE MARGE", "gold", "mg_pie", 0, -60); kw(T["pie_on"], e(2, 0.4), "10 %", "red", cnt=dict(to=10, suf=" %", t0=T["pie_on"], d=0.6))
T["fig_on"] = s(3, 0.3); T["k11"] = w(4, "11"); T["k76"] = w(4, "76")
note(w(3, "équipes"), e(3, 0.2), "SES ÉQUIPES", "green", "cp_fig", 0, -60); kw(w(3, "rien"), e(3, 0.4), "PRESQUE RIEN", "gold")
note(w(4, "salarié"), e(4, 0.2), "PAR SALARIÉ", "gold", "cp_small", 0, -60); note(w(4, "services"), e(4, 0.2), "SERVICES AUX ENTREPRISES", "blue", "cp_big", 0, -60); kw(T["k11"], T["k76"], "11 000 €", "gold", cnt=dict(to=11000, suf=" €", t0=T["k11"], d=0.6)); kw(T["k76"], e(4, 0.4), "76 000 €", "blue", cnt=dict(to=76000, suf=" €", t0=T["k76"], d=0.9))
focus("capital", (T["k11"] - 0.5, 1.6, 0, 0), (T["k76"] - 0.5, 4.2, 1.6, 0))
T["sal_on"] = w(5, "salaires"); T["va_on"] = w(5, "valeur")
kw(T["sal_on"], T["va_on"], "SALAIRES", "red"); note(T["va_on"], e(5, 0.3), "VALEUR AJOUTÉE", "white", "sl_bar", 0, -60); kw(T["va_on"], e(5, 0.4), "LOURD", "red")
T["tp_on"] = w(6, "44")
kw(T["tp_on"], w(6, "fois"), "44 %", "gold", cnt=dict(to=44, suf=" %", t0=T["tp_on"], d=0.6)); note(w(6, "partiel"), e(6, 0.2), "TEMPS PARTIEL", "blue", "tp_grid", 0, -60); kw(w(6, "fois"), e(6, 0.4), "×2", "red")
T["sun_on"] = s(7, 0.2); T["share31"] = w(7, "31"); T["h6"] = w(7, "6")
stamp(w(7, "Dares"), e(7, -0.1), "DARES", "blue", 540, 1180); kw(T["share31"], T["h6"], "31 %", "gold", cnt=dict(to=31, suf=" %", t0=T["share31"], d=0.5)); kw(T["h6"], w(7, "8"), "6 H", "gold"); kw(w(7, "8"), e(7, 0.4), "8 %", "white", cnt=dict(to=8, suf=" %", t0=w(7, "8"), d=0.4)); note(T["h6"], e(7, 0.2), "6 HEURES DU MATIN", "gold", "au_clock", 0, -60); note(w(7, "8"), e(7, 0.3), "EN MOYENNE", "white", "au_crowd", 0, -60)
T["env_on"] = s(8, 0.3); T["win_on"] = w(8, "compte")
kw(w(8, "appels"), w(8, "prix"), "APPELS D'OFFRES", "gold"); kw(w(8, "prix"), e(8, 0.4), "LE PRIX", "red"); note(T["win_on"], e(8, 0.3), "PRIX LE PLUS BAS", "green", "ao_win", 0, -60)
T["ct_on"] = s(9, 0.3); T["move_on"] = w(9, "change"); T["stay_on"] = w(9, "repris")
stamp(w(9, "convention"), e(9, -0.1), "CONVENTION COLLECTIVE", "blue", 540, 1180); note(w(9, "contrat"), e(9, 0.2), "ANCIEN PRESTATAIRE", "gold", "rp_a", 0, -60); note(w(9, "nouveau"), e(9, 0.2), "NOUVEAU PRESTATAIRE", "gold", "rp_b", 0, -60); note(T["stay_on"], e(9, 0.3), "ANNEXE 7", "white", "rp_team", 0, -60); kw(T["stay_on"], e(9, 0.4), "REPRIS", "green")
T["board_on"] = s(10, 0.2); T["fill_on"] = s(10, 0.8); T["org_on"] = w(10, "organisation")
kw(w(10, "prix"), T["org_on"], "LE PRIX", "red"); kw(T["org_on"], e(10, 0.4), "ORGANISATION", "gold"); note(T["org_on"], e(10, 0.3), "PLANNING DES HEURES", "green", "pl_board", 0, -60)
T["cross_on"] = w(11, "pas"); T["clock_on"] = w(12, "heures"); T["min_on"] = w(12, "minute")
kw(T["cross_on"], e(11, 0.4), "PAS DES M²", "red"); note(w(11, "mètres"), e(11, 0.3), "MÈTRES CARRÉS", "gold", "ht_floor", 0, -60); kw(T["clock_on"], T["min_on"], "DES HEURES", "gold"); kw(T["min_on"], e(12, 0.4), "CHAQUE MINUTE", "green"); note(T["clock_on"], e(12, 0.3), "HEURES DE TRAVAIL", "white", "ht_clock", 0, -60)
T["bubble_on"] = w(13, "Selon"); T["button_on"] = w(14, "abonnez"); T["press"] = w(14, "Decrypt")
note(w(13, "prix"), e(13, 0.1), "PRIX OU QUALITÉ ?", "gold", "bubble", 0, -70); kw(w(13, "Dites"), e(13, 0.5), "COMMENTEZ", "gold")
kw(T["button_on"], e(14, 0.4), "ABONNEZ-VOUS", "red")
T["brand"] = e(14, -0.9)
B["cam"] = []; t = 0.0
while t <= DUR + 1e-6:
    p, l = cam(t); B["cam"].append([round(t, 3)] + [round(x, 3) for x in p + l]); t += 1 / 30
B["fov"] = 42
open("video/assets/beats.js", "w").write("window.BEATS=" + json.dumps(B, ensure_ascii=False) + ";")
json.dump(B, open("video/assets/beats.json", "w"), ensure_ascii=False)
print("dur", DUR, "cam keys", len(B["cam"]), "notes", len(B["notes"]), "kws", len(B["kws"]), "whoosh", T["whoosh"])
