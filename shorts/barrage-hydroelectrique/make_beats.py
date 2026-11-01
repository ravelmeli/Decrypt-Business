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
DUR = round(lines[-1]["end"] + 0.75, 2)
SPACING = 46
ORDER = ["dam", "etat", "share", "concurrence", "echues", "invest", "redevance", "step", "souplesse", "droit", "cta"]
FIRST = dict(dam=0, etat=1, share=3, concurrence=4, echues=5, invest=6, redevance=7, step=8, souplesse=11, droit=12, cta=14)
LAST = dict(dam=0, etat=2, share=3, concurrence=4, echues=5, invest=6, redevance=7, step=10, souplesse=11, droit=13, cta=15)
B = {"dur": DUR, "times": {}, "heroes": {}, "notes": [], "kws": [], "panels": [], "stamps": [], "cuts": [], "order": ORDER, "spacing": SPACING}
T = B["times"]
def hero(name, a, b): B["heroes"].setdefault(name, []).append([a, b])
def note(t0, t1, text, kind, anchor, dx=0, dy=-95): B["notes"].append(dict(t0=t0, t1=t1, text=text, kind=kind, anchor=anchor, dx=dx, dy=dy))
def kw(t0, t1, text, color="gold", rot=-2): B["kws"].append(dict(t0=t0, t1=t1, text=text, color=color, rot=rot))
def panel(t0, t1, pid, y=760, o=None): B["panels"].append(dict(t0=t0, t1=t1, id=pid, y=y, o=o))
def stamp(t0, t1, text, kind, x=540, y=470, rot=-3): B["stamps"].append(dict(t0=t0, t1=t1, text=text, kind=kind, x=x, y=y, rot=rot))

# ---- heroes (one per place) ----
for n in ORDER: hero(n, 0.0 if n == "dam" else s(FIRST[n]), e(LAST[n], 0.1) if n != "cta" else DUR + 2)
ORB = dict(dam=(0.5, -0.4, 24, 19, 7, 7, 5), etat=(0.5, -0.3, 22, 17, 7, 7, 4), share=(0.4, -0.5, 22, 17, 8, 8, 2.5), concurrence=(0.5, -0.4, 20, 15, 6.5, 6.5, 3),
           echues=(0.3, -0.3, 20, 16, 10, 10, 1.5), invest=(0.5, -0.4, 22, 17, 7, 7, 4.5), redevance=(0.5, -0.4, 22, 17, 8, 8, 2.5), step=(0.5, -0.5, 24, 19, 9, 9, 3.5),
           souplesse=(0.4, -0.4, 22, 17, 7, 7, 5.5), droit=(0.5, -0.4, 24, 19, 7.5, 7.5, 5.5), cta=(0.3, -0.3, 22, 16, 7, 7, 5.5))
START = {n: (0.0 if n == "dam" else s(FIRST[n])) for n in ORDER}
END = {n: (START[ORDER[i + 1]] if i + 1 < len(ORDER) else DUR) for i, n in enumerate(ORDER)}
def state(name, t):
    a0, a1, r0, r1, h0, h1, ty = ORB[name]; u = min(1, max(0, (t - START[name]) / max(0.01, END[name] - START[name])))
    k = u * u * (3 - 2 * u) * 0.35 + u * 0.65          # almost-linear, soft ends
    cz = -SPACING * ORDER.index(name); a = a0 + (a1 - a0) * k; r = r0 + (r1 - r0) * k; h = h0 + (h1 - h0) * k
    return (r * math.sin(a), h, cz + r * math.cos(a)), (0.0, ty, cz)
GL = 1.2   # glide length
def cam(t):
    i = 0
    for j, n in enumerate(ORDER):
        if t >= START[n] - GL + 0.35: i = j
    n = ORDER[i]; p, l = state(n, t)
    if i > 0:
        pn, ln = state(ORDER[i - 1], START[n])  # previous place frozen at the handoff... keep orbiting a bit instead
        pn, ln = state(ORDER[i - 1], min(t, END[ORDER[i - 1]]))
        g = min(1, max(0, (t - (START[n] - GL + 0.35)) / GL)); g = g * g * g * (g * (g * 6 - 15) + 10)
        p = tuple(pn[q] + (p[q] - pn[q]) * g for q in range(3)); l = tuple(ln[q] + (l[q] - ln[q]) * g for q in range(3))
    return p, l
B["cam"] = []; t = 0.0
while t <= DUR + 1e-6:
    p, l = cam(t); B["cam"].append([round(t, 3)] + [round(x, 3) for x in p + l]); t += 1 / 30
B["fov"] = 42
T["whoosh"] = s(8) - 0.55   # one single big subject change: from the legal ownership to the storage business

# ---- overlays, all exactly on the spoken word ----
T["lit_on"] = w(0, "12")
note(w(0, "12"), e(0, 0.2), "≈ 12 % DE L'ÉLECTRICITÉ", "gold", "dam_grid", 0, -60); kw(w(0, "12"), w(0, "sans"), "12 %", "gold"); kw(w(0, "combustible"), e(0, 0.3), "SANS COMBUSTIBLE", "blue")
T["state_on"] = w(1, "propriétaire"); T["key_move"] = w(2, "confie"); T["h75"] = w(2, "75")
note(w(1, "exploite"), e(2, 0.2), "EXPLOITANT", "gold", "et_oper", 0, -80); note(T["state_on"], e(1, 0.3), "PROPRIÉTAIRE ?", "white", "et_state", 0, -70); kw(T["state_on"], e(1, 0.4), "PROPRIÉTAIRE ?", "gold")
note(w(2, "État"), e(2, 0.2), "L'ÉTAT", "blue", "et_state", 0, -70); note(w(2, "concession"), e(2, 0.2), "CONCESSION", "gold", "et_dam", 0, -70); kw(T["h75"], e(2, 0.4), "75 ANS", "gold")
T["edf_on"] = w(3, "EDF"); T["engie_on"] = w(3, "Engie"); T["reste_on"] = w(3, "reste")
note(T["edf_on"], e(3, 0.2), "EDF", "blue", "sh_edf", 0, -70); note(T["engie_on"], e(3, 0.2), "ENGIE", "gold", "sh_engie", 0, -70); kw(w(3, "70"), T["engie_on"], "EDF ≈ 70 %", "blue"); kw(T["engie_on"], e(3, 0.4), "ENGIE", "gold")
T["bid_on"] = w(4, "remettre"); T["gavel"] = w(4, "concurrence")
note(w(4, "termine"), e(4, 0.2), "FIN DE CONCESSION", "red", "conc", 0, -80); kw(T["gavel"], e(4, 0.4), "CONCURRENCE", "gold")
T["ech_on"] = w(5, "38")
stamp(w(5, "Cour"), e(5, -0.1), "COUR DES COMPTES · 2022", "blue", 540, 1180); note(T["ech_on"], e(5, 0.2), "38 ÉCHUES", "red", "ech", 0, -80); kw(T["ech_on"], w(5, "sans"), "38 CONCESSIONS", "red"); kw(w(5, "renouvelées"), e(5, 0.4), "NON RENOUVELÉES", "red")
T["invest_on"] = w(6, "investit"); T["diff_on"] = w(6, "difficilement"); T["lose_on"] = w(6, "perdre")
note(w(6, "exploitant"), e(6, 0.2), "EXPLOITANT", "gold", "inv_op", 0, -70); kw(T["diff_on"], e(6, 0.4), "INVESTIR ?", "red")
T["red_on"] = w(7, "40")
stamp(w(7, "2020"), e(7, -0.1), "DEPUIS 2020", "blue", 540, 1180); note(w(7, "redevance"), e(7, 0.2), "REDEVANCE", "gold", "red_gold", 0, -70); note(T["red_on"], e(7, 0.2), "40 % VERS L'ÉTAT", "red", "red_red", 0, -70); kw(T["red_on"], e(7, 0.4), "40 %", "red")
kw(w(8, "stocker"), e(8, 0.4), "STOCKER", "blue")
T["pump_on"] = w(9, "pompent"); T["turb_on"] = w(9, "turbinent"); T["cheap_on"] = w(9, "bon"); T["dear_on"] = w(9, "chère")
note(T["pump_on"], T["turb_on"], "POMPAGE", "blue", "st_up", 0, -70); note(T["turb_on"], e(9, 0.2), "TURBINAGE", "gold", "st_low", 0, -70)
note(T["cheap_on"], T["turb_on"], "PRIX BAS", "green", "st_lo", 0, -60); note(T["dear_on"], e(9, 0.2), "PRIX ÉLEVÉ", "red", "st_hi", 0, -60)
T["gap_on"] = w(10, "écart")
note(T["gap_on"], e(10, 0.2), "ÉCART DE PRIX", "gold", "st_gap", 0, -70); kw(T["gap_on"], e(10, 0.4), "L'ÉCART", "gold")
T["soup"] = w(11, "souplesse")
note(w(11, "rente"), e(11, 0.2), "LA RENTE", "gold", "soup", 0, -60); kw(T["soup"], e(11, 0.5), "SOUPLESSE", "green")
T["cross_on"] = w(12, "pas")
note(w(12, "électricité"), e(12, 0.2), "ÉLECTRICITÉ", "gold", "dr_bolt", 0, -60); kw(T["cross_on"], e(12, 0.4), "PAS SEULEMENT", "red")
T["droit_on"] = w(13, "droit")
note(T["droit_on"], e(13, 0.2), "DROIT D'USAGE", "gold", "dr_key", 0, -70); kw(T["droit_on"], w(13, "limité"), "UN DROIT D'USAGE", "gold"); kw(w(13, "limité"), w(13, "ouvrage"), "LIMITÉ", "red"); kw(w(13, "ouvrage"), e(13, 0.4), "À L'ÉTAT", "blue")
T["bubble_on"] = w(14, "Selon"); T["button_on"] = w(15, "abonnez"); T["press"] = w(15, "Decrypt")
note(w(14, "vous"), e(14, 0.1), "VOTRE AVIS ?", "gold", "bubble", 0, -70); kw(w(14, "Dites"), e(14, 0.5), "COMMENTEZ", "gold")
note(T["button_on"], e(15, 0.1), "DECRYPT BUSINESS", "red", "button", -90, -60); kw(T["button_on"], e(15, 0.4), "ABONNEZ-VOUS", "red")
T["brand"] = e(15, -0.9)
open("video/assets/beats.js", "w").write("window.BEATS=" + json.dumps(B, ensure_ascii=False) + ";")
json.dump(B, open("video/assets/beats.json", "w"), ensure_ascii=False)
print("dur", DUR, "cam keys", len(B["cam"]), "notes", len(B["notes"]), "kws", len(B["kws"]), "whoosh", T["whoosh"])
