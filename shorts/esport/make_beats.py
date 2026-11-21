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
ORDER = ["arene", "sponso", "depenses", "ligue", "pertes", "valo", "diversif", "verdict", "cta"]
FIRST = {"arene": 0, "sponso": 1, "depenses": 4, "ligue": 6, "pertes": 7, "valo": 8, "diversif": 9, "verdict": 10, "cta": 12}
LAST = {"arene": 0, "sponso": 3, "depenses": 5, "ligue": 6, "pertes": 7, "valo": 8, "diversif": 9, "verdict": 11, "cta": 13}
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
for n in ORDER: hero(n, 0.0 if n == "arene" else s(FIRST[n]), e(LAST[n], 0.1) if n != "cta" else DUR - LOOP + 0.4)
hero("arene", DUR - LOOP - 0.6, DUR + 3)
_o = (0.5, -0.4, 25, 20, 9, 9, 3.6)
ORB = {n: _o for n in ORDER}
ORB["cta"] = (0.3, -0.3, 22, 16, 7, 7, 5.5)
START = {n: (0.0 if n == "arene" else s(FIRST[n])) for n in ORDER}
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
T["team_on"] = s(0, 0.1); T["tv_on"] = w(0, "droits")
kw(w(0, "équipe"), w(0, "club"), "ÉQUIPE D'ESPORT", "gold"); kw(w(0, "club"), T["tv_on"], "COMME UN CLUB", "white"); kw(T["tv_on"], e(0, 0.4), "SANS DROITS TV", "red")
note(w(0, "équipe"), e(0, 0.2), "L'ÉQUIPE", "gold", "ar_team", 0, -60); note(T["tv_on"], e(0, 0.2), "PAS DE DROITS TV", "red", "ar_tv", 0, -60)
T["pieA_on"] = s(1, 0.3)
stamp(w(1, "Next"), T["pieA_on"], "NEXT.INK · 3 ÉQUIPES", "blue", 540, 1180); kw(w(1, "80"), w(1, "des"), "80 À 100 %", "gold"); kw(w(1, "des"), e(1, 0.4), "DES RECETTES", "white")
note(w(1, "sponsoring"), e(1, 0.2), "SPONSORING", "gold", "sp_pieA", 0, -60)
T["pieB_on"] = w(2, "mondial")
kw(w(2, "63"), w(2, "revenus"), "63 %", "gold", cnt=dict(to=63, pre="", suf=" %", t0=w(2, "63"), d=0.7)); kw(w(2, "revenus"), w(2, "selon"), "MONDE · 2021", "white"); stamp(w(2, "selon"), e(2, -0.1), "SIÈCLE DIGITAL", "blue", 540, 1180)
note(T["pieB_on"], e(2, 0.2), "LE MONDE", "white", "sp_pieB", 0, -60)
T["boards_on"] = s(3, 0.1); T["leave_on"] = w(3, "partir")
kw(w(3, "quelques"), T["leave_on"], "QUELQUES MARQUES", "white"); kw(T["leave_on"], e(3, 0.4), "ELLES PEUVENT PARTIR", "red"); note(w(3, "marques"), e(3, 0.2), "SPONSORS", "gold", "sp_boards", 0, -60)
T["pay_on"] = s(4, 0.1); T["cost_on"] = w(4, "salaires")
kw(w(4, "dépenses"), T["cost_on"], "LES DÉPENSES", "red"); kw(T["cost_on"], w(4, "coachs"), "SALAIRES", "gold"); kw(w(4, "coachs"), e(4, 0.4), "COACHS · VOYAGES", "white")
note(T["cost_on"], e(4, 0.2), "JOUEURS PAYÉS", "gold", "dp_players", 0, -60); note(T["pay_on"], w(4, "salaires"), "L'ORGANISATION", "white", "dp_org", 0, -60)
T["prize_on"] = w(5, "gains")
kw(T["prize_on"], w(5, "filet"), "GAINS EN TOURNOI", "gold"); kw(w(5, "filet"), w(5, "surtout"), "PAS UN FILET", "red"); kw(w(5, "surtout"), e(5, 0.4), "ILS VONT AUX JOUEURS", "green")
note(T["prize_on"], e(5, 0.2), "TROPHÉE", "gold", "dp_trophy", 0, -60)
T["gate_on"] = s(6, 0.1); T["ticket_on"] = w(6, "ticket"); T["fee_on"] = w(6, "10")
kw(T["ticket_on"], w(6, "2017"), "LE TICKET D'ENTRÉE", "white"); kw(w(6, "2017"), T["fee_on"], "RIOT · 2017", "blue"); kw(T["fee_on"], w(6, "dollars"), "≥ 10 M$", "gold", cnt=dict(to=10, pre="≥ ", suf=" M$", t0=T["fee_on"], d=0.7)); kw(w(6, "dollars"), e(6, 0.4), "LIGUE NORD-AMÉRICAINE", "white")
stamp(w(6, "Riot"), T["fee_on"], "BLOOMBERG 2017", "blue", 540, 1180)
note(T["gate_on"], e(6, 0.2), "LA LIGUE", "white", "li_gate", 0, -60); note(T["fee_on"], e(6, 0.2), "DROIT D'ENTRÉE", "gold", "li_coin", 0, -60)
T["bars_on"] = s(7, 0.1); T["loss_on"] = w(7, "perdent")
kw(w(7, "rentabilité"), w(7, "démontrée"), "RENTABILITÉ ?", "white"); kw(w(7, "démontrée"), T["loss_on"], "PAS DÉMONTRÉE", "red"); kw(T["loss_on"], e(7, 0.4), "ELLES PERDENT", "red")
stamp(w(7, "selon"), e(7, -0.1), "FRANCE ÉPARGNE", "blue", 540, 1180); note(T["loss_on"], e(7, 0.2), "PERTES", "red", "pe_arrow", 0, -60)
T["val_on"] = w(8, "valorisations"); T["rev_on"] = w(8, "chiffre")
kw(T["val_on"], w(8, "13"), "VALORISATION", "gold"); kw(w(8, "13"), T["rev_on"], "13 ×", "red", cnt=dict(to=13, pre="", suf=" ×", t0=w(8, "13"), d=0.6)); kw(T["rev_on"], w(8, "Mercer"), "LE CHIFFRE D'AFFAIRES", "white"); stamp(w(8, "Mercer"), w(8, "donc"), "MERCER CAPITAL", "blue", 540, 1180); kw(w(8, "promesse"), e(8, 0.4), "PROMESSE DE CROISSANCE", "gold")
note(T["val_on"], e(8, 0.2), "VALORISATION", "gold", "va_big", 0, -60); note(T["rev_on"], e(8, 0.2), "CHIFFRE D'AFFAIRES", "white", "va_small", 0, -60)
T["div_on"] = s(9, 0.1); T["merch_on"] = w(9, "dérivés"); T["cont_on"] = w(9, "contenus"); T["spon_on"] = w(9, "sponsors"); T["edit_on"] = w(9, "éditeur")
kw(w(9, "diversifient"), T["merch_on"], "ELLES DIVERSIFIENT", "green"); kw(T["merch_on"], T["cont_on"], "PRODUITS DÉRIVÉS", "gold"); kw(T["cont_on"], T["spon_on"], "CONTENUS", "white"); kw(T["spon_on"], T["edit_on"], "PLUSIEURS SPONSORS", "gold"); kw(T["edit_on"], e(9, 0.4), "REVENUS ÉDITEUR", "blue")
note(T["merch_on"], T["cont_on"], "MERCH", "gold", "dv_merch", 0, -60); note(T["cont_on"], T["spon_on"], "CONTENUS", "white", "dv_cam", 0, -60); note(T["spon_on"], T["edit_on"], "SPONSORS", "gold", "dv_spon", 0, -60); note(T["edit_on"], e(9, 0.2), "ÉDITEUR", "blue", "dv_edit", 0, -60)
T["ver_on"] = s(10, 0.1); T["aud_on"] = w(10, "audience"); T["brand_on"] = w(10, "marques")
kw(w(10, "financer"), T["aud_on"], "FINANCER", "red"); kw(T["aud_on"], T["brand_on"], "UNE AUDIENCE", "gold"); kw(T["brand_on"], e(10, 0.4), "SI LES MARQUES PAIENT", "white")
note(T["aud_on"], e(10, 0.2), "L'AUDIENCE", "gold", "vd_crowd", 0, -60)
T["frag_on"] = w(11, "fragiles"); T["cost2_on"] = w(11, "coûts")
kw(w(11, "public"), T["frag_on"], "PUBLIC PASSIONNÉ", "green"); kw(T["frag_on"], T["cost2_on"], "REVENUS FRAGILES", "red"); kw(T["cost2_on"], e(11, 0.4), "COÛTS TOUJOURS LÀ", "red")
note(T["frag_on"], e(11, 0.2), "REVENUS", "red", "vd_wave", 0, -60); note(T["cost2_on"], e(11, 0.2), "COÛTS", "red", "vd_coin", 0, -60)
T["bubble_on"] = s(12, 0.2); T["button_on"] = w(13, "abonnez"); T["press"] = w(13, "Decrypt")
note(w(12, "posséderiez"), e(12, 0.1), "POSSÉDER ?", "gold", "bubble", 0, -70); kw(w(12, "Dites"), e(12, 0.5), "COMMENTEZ", "gold")
kw(T["button_on"], e(13, 0.4), "ABONNEZ-VOUS", "red")
T["brand"] = e(13, -0.9)
B["cam"] = []; t = 0.0
while t <= DUR + 1e-6:
    p, l = cam(t); B["cam"].append([round(t, 3)] + [round(x, 3) for x in p + l]); t += 1 / 30
B["fov"] = 42
open("video/assets/beats.js", "w").write("window.BEATS=" + json.dumps(B, ensure_ascii=False) + ";")
json.dump(B, open("video/assets/beats.json", "w"), ensure_ascii=False)
print("dur", DUR, "cam keys", len(B["cam"]), "notes", len(B["notes"]), "kws", len(B["kws"]), "whoosh", T["whoosh"])
