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
ORDER = ["usine", "capex", "four", "co2", "facture", "distance", "local", "fixes", "verdict", "cta"]
FIRST = {"usine": 0, "capex": 1, "four": 4, "co2": 6, "facture": 8, "distance": 9, "local": 11, "fixes": 12, "verdict": 14, "cta": 16}
LAST = {"usine": 0, "capex": 3, "four": 5, "co2": 7, "facture": 8, "distance": 10, "local": 11, "fixes": 13, "verdict": 15, "cta": 17}
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
for n in ORDER: hero(n, 0.0 if n == "usine" else s(FIRST[n]), e(LAST[n], 0.1) if n != "cta" else DUR - LOOP + 0.4)
hero("usine", DUR - LOOP - 0.6, DUR + 3)
_o = (0.5, -0.4, 25, 20, 9, 9, 3.6)
ORB = {n: _o for n in ORDER}
ORB["cta"] = (0.3, -0.3, 22, 16, 7, 7, 5.5)
START = {n: (0.0 if n == "usine" else s(FIRST[n])) for n in ORDER}
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
T["whoosh"] = s(4) - 0.55   # one single big subject change: from the market to the costs

# ---- overlays, all exactly on the spoken word ----
T["plant_on"] = s(0, 0.1); kw(w(0, "lourdes"), e(0, 0.4), "INDUSTRIE LOURDE", "gold"); note(w(0, "cimenterie"), e(0, 0.2), "UNE CIMENTERIE", "gold", "us_plant", 0, -60)
T["cap_on"] = s(1, 0.1); T["fortune_on"] = w(1, "200")
stamp(w(1, "Cembureau"), e(1, -0.1), "CEMBUREAU", "blue", 540, 1180)
kw(w(1, "200"), w(1, "par"), "> 200 M€", "gold", cnt=dict(to=200, pre="> ", suf=" M€", t0=w(1, "200"), d=0.8)); kw(w(1, "par"), e(1, 0.4), "PAR MILLION DE TONNES", "blue")
note(w(1, "capacité"), e(1, 0.2), "CAPACITÉ ANNUELLE", "blue", "cx_cap", 0, -60); note(T["fortune_on"], e(1, 0.2), "L'INVESTISSEMENT", "gold", "cx_coin", 0, -60)
kw(w(2, "avant"), w(2, "fortune"), "AVANT LE 1ER SAC", "red"); kw(w(2, "fortune"), e(2, 0.4), "UNE FORTUNE", "gold"); note(w(2, "immobiliser"), e(2, 0.2), "IMMOBILISÉ", "gold", "cx_coin", 0, -60)
T["amort_on"] = w(3, "longtemps"); kw(w(3, "tourner"), w(3, "amortir"), "TOURNER FORT", "green"); kw(w(3, "amortir"), e(3, 0.4), "AMORTIR", "gold"); note(T["amort_on"], e(3, 0.2), "LONGTEMPS", "white", "cx_clock", 0, -60)
T["kiln_on"] = s(4, 0.1); T["rock_on"] = w(4, "calcaire")
kw(w(4, "chauffer"), T["rock_on"], "CHAUFFER", "red"); kw(T["rock_on"], w(4, "très"), "LE CALCAIRE", "white"); kw(w(4, "très"), e(4, 0.4), "HAUTE TEMPÉRATURE", "red")
note(w(4, "chauffer"), e(4, 0.2), "LE FOUR", "red", "fo_kiln", 0, -60); note(T["rock_on"], e(4, 0.2), "CALCAIRE", "white", "fo_rock", 0, -60)
T["energy_on"] = w(5, "énergie"); kw(T["energy_on"], w(5, "coûts"), "L'ÉNERGIE", "red"); kw(w(5, "20"), w(5, "selon"), "20 À 30 %", "gold"); kw(w(5, "selon"), e(5, 0.4), "ANCIENNES SOURCES", "blue")
stamp(w(5, "selon"), e(5, -0.1), "ESTIMATIONS ANCIENNES", "blue", 540, 1180); note(T["energy_on"], e(5, 0.2), "ÉNERGIE", "red", "fo_pie", 0, -60)
T["chim_on"] = s(6, 0.1); T["smoke_on"] = w(6, "CO2")
kw(T["smoke_on"], w(6, "France"), "CO₂", "red"); stamp(w(6, "France"), e(6, -0.1), "FRANCE CIMENT · SFIC", "blue", 540, 1180); kw(w(6, "660"), e(6, 0.4), "660–700 kg / t", "gold"); note(T["smoke_on"], e(6, 0.2), "ÉMISSIONS", "red", "co_smoke", 0, -60)
T["quota_on"] = w(7, "quotas"); kw(T["quota_on"], w(7, "mais"), "QUOTAS GRATUITS", "green"); kw(w(7, "décarbonation"), e(7, 0.4), "DÉCARBONATION", "red"); note(T["quota_on"], e(7, 0.2), "QUOTAS GRATUITS", "green", "co_quota", 0, -60)
T["bill_on"] = w(8, "3"); T["rev_on"] = w(8, "chiffre")
stamp(w(8, "France"), w(8, "3"), "FRANCE CIMENT", "blue", 540, 1180); kw(w(8, "3"), w(8, "environ"), "> 3 Md€", "gold", cnt=dict(to=3, pre="> ", suf=" Md€", t0=w(8, "3"), d=0.7)); kw(w(8, "deux"), e(8, 0.4), "≈ 2 × LE CA", "red")
note(T["bill_on"], e(8, 0.2), "LA FACTURE", "red", "fa_bill", 0, -60); note(T["rev_on"], e(8, 0.2), "CA ANNUEL", "gold", "fa_rev", 0, -60)
T["heavy_on2"] = s(9, 0.1); T["truck_on"] = w(9, "transporte"); T["ring_on"] = w(9, "200")
kw(w(9, "lourd"), T["truck_on"], "TRÈS LOURD", "gold"); kw(T["ring_on"], e(9, 0.4), "200–300 km", "gold"); stamp(w(9, "dit"), T["ring_on"], "RÈGLE EMPIRIQUE", "blue", 540, 1180); note(T["ring_on"], e(9, 0.2), "LIMITE DE TRANSPORT", "gold", "di_ring", 0, -60)
kw(w(10, "Votre"), w(10, "région"), "VOTRE MARCHÉ", "white"); kw(w(10, "région"), e(10, 0.4), "LA RÉGION", "gold"); note(w(10, "région"), e(10, 0.2), "L'USINE", "white", "di_plant", 0, -60)
T["local_on"] = s(11, 0.1); T["slow_on"] = w(11, "ralentit")
kw(w(11, "construction"), T["slow_on"], "LA CONSTRUCTION", "white"); kw(T["slow_on"], w(11, "près"), "RALENTIT", "red"); kw(w(11, "ailleurs"), e(11, 0.4), "PAS D'AILLEURS", "red"); note(w(11, "chez"), e(11, 0.2), "VOTRE RÉGION", "white", "lo_blocks", 0, -60); note(T["slow_on"], e(11, 0.2), "CHUTE", "red", "lo_arrow", 0, -60)
T["idle_on"] = s(12, 0.1); T["restart_on"] = w(13, "repartent")
kw(w(12, "continue"), e(12, 0.4), "ÇA COÛTE TOUJOURS", "red"); note(T["idle_on"], e(12, 0.2), "COÛTS FIXES", "red", "fx_clock", 0, -60)
kw(T["restart_on"], w(13, "volumes"), "CHANTIERS ↑", "green"); kw(w(13, "montent"), w(13, "coûts"), "VOLUMES ↑", "green"); kw(w(13, "diluent"), e(13, 0.4), "COÛTS FIXES DILUÉS", "gold"); note(T["restart_on"], e(13, 0.2), "PLUS DE CAMIONS", "green", "fx_trucks", 0, -60)
T["ver_on"] = s(14, 0.1); T["actif_on"] = w(14, "pari")
kw(T["actif_on"], w(14, "long"), "UN PARI", "red"); kw(w(14, "long"), w(14, "sur"), "LONG TERME", "gold"); kw(w(14, "bâtiment"), e(14, 0.4), "LE BÂTIMENT LOCAL", "white")
note(T["actif_on"], e(14, 0.2), "ACTIF LOURD", "white", "vd_weight", 0, -60); note(s(14, 0.4), w(14, "pari"), "LE CYCLE", "blue", "vd_wave", 0, -60)
T["cost_on"] = w(15, "coûts"); T["dist_on"] = w(15, "limité")
kw(w(15, "énorme"), T["cost_on"], "ACTIF ÉNORME", "gold"); kw(T["cost_on"], w(15, "marché"), "COÛTS ↑", "red"); kw(T["dist_on"], e(15, 0.4), "LIMITÉ PAR LA DISTANCE", "red"); note(T["cost_on"], e(15, 0.2), "COÛTS", "red", "vd_coin", 0, -60); note(T["dist_on"], e(15, 0.2), "200–300 KM", "gold", "vd_ring", 0, -60)
T["bubble_on"] = s(16, 0.2); T["button_on"] = w(17, "abonnez"); T["press"] = w(17, "Decrypt")
note(w(16, "investiriez"), e(16, 0.1), "INVESTIR ?", "gold", "bubble", 0, -70); kw(w(16, "Dites"), e(16, 0.5), "COMMENTEZ", "gold")
kw(T["button_on"], e(17, 0.4), "ABONNEZ-VOUS", "red")
T["brand"] = e(17, -0.9)
B["cam"] = []; t = 0.0
while t <= DUR + 1e-6:
    p, l = cam(t); B["cam"].append([round(t, 3)] + [round(x, 3) for x in p + l]); t += 1 / 30
B["fov"] = 42
open("video/assets/beats.js", "w").write("window.BEATS=" + json.dumps(B, ensure_ascii=False) + ";")
json.dump(B, open("video/assets/beats.json", "w"), ensure_ascii=False)
print("dur", DUR, "cam keys", len(B["cam"]), "notes", len(B["notes"]), "kws", len(B["kws"]), "whoosh", T["whoosh"])
