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
ORDER = ["prix", "staff", "facture", "murs", "groupes", "renta", "deficit", "levier", "lit", "temps", "cta"]
FIRST = dict(prix=0, staff=2, facture=4, murs=6, groupes=8, renta=9, deficit=10, levier=11, lit=12, temps=13, cta=14)
LAST = dict(prix=1, staff=3, facture=5, murs=7, groupes=8, renta=9, deficit=10, levier=11, lit=12, temps=13, cta=15)
B = {"dur": DUR, "times": {}, "heroes": {}, "notes": [], "kws": [], "panels": [], "stamps": [], "cuts": [], "order": ORDER, "spacing": SPACING}
T = B["times"]
def hero(name, a, b): B["heroes"].setdefault(name, []).append([a, b])
def note(t0, t1, text, kind, anchor, dx=0, dy=-95): B["notes"].append(dict(t0=t0, t1=t1, text=text, kind=kind, anchor=anchor, dx=dx, dy=dy))
def kw(t0, t1, text, color="gold", rot=-2): B["kws"].append(dict(t0=t0, t1=t1, text=text, color=color, rot=rot))
def panel(t0, t1, pid, y=760, o=None): B["panels"].append(dict(t0=t0, t1=t1, id=pid, y=y, o=o))
def stamp(t0, t1, text, kind, x=540, y=470, rot=-3): B["stamps"].append(dict(t0=t0, t1=t1, text=text, kind=kind, x=x, y=y, rot=rot))

# ---- heroes (one per place) ----
for n in ORDER: hero(n, 0.0 if n == "prix" else s(FIRST[n]), e(LAST[n], 0.1) if n != "cta" else DUR + 2)
ORB = dict(prix=(0.5, -0.4, 22, 17, 6, 6, 5), staff=(0.4, -0.4, 21, 17, 6.5, 6.5, 2.6), facture=(0.6, -0.5, 22, 17, 7, 7, 6.0), murs=(0.7, -0.2, 22, 17, 7, 7, 3.5),
           groupes=(0.5, -0.5, 24, 19, 7.5, 7.5, 3.5), renta=(0.6, -0.4, 24, 18, 7, 7, 4.5), deficit=(0.5, -0.4, 22, 17, 8, 8, 3.0), levier=(0.4, -0.6, 20, 15, 6.5, 6.5, 3.2),
           lit=(0.5, -0.4, 21, 16, 6, 6, 2.8), temps=(0.4, -0.4, 24, 19, 8, 8, 6.5), cta=(0.3, -0.3, 22, 16, 7, 7, 5.5))
START = {n: (0.0 if n == "prix" else s(FIRST[n])) for n in ORDER}
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
T["whoosh"] = s(10) - 0.55   # one single big subject change: from the economics of the visit to the calendar weakness

# ---- overlays, all exactly on the spoken word ----
# L0-1 price
T["bar_priv"] = s(0, 0.3); T["bar_pub"] = w(1, "1"); T["gap_on"] = w(1, "40")
note(w(0, "privée"), e(0, 0.2), "PRIVÉ COMMERCIAL", "red", "col_priv", 0, -90); kw(w(0, "2"), e(0, 0.3), "≈ 2 700 €", "red")
note(w(1, "public"), e(1, 0.1), "PUBLIC", "blue", "col_pub", 0, -90); stamp(w(1, "environ"), e(1, 0.0), "PAR MOIS", "gold", 540, 1180)
note(w(1, "40"), e(1, 0.3), "ÉCART ≈ 40 %", "green", "gap", 0, -60); kw(w(1, "40"), e(1, 0.4), "−40 %", "green")
# L2-3 staff
T["staff_pub"] = w(2, "Pourtant"); T["staff_priv"] = w(2, "privé"); T["staff_ghost"] = w(2, "40")
stamp(w(2, "mission"), e(2, -0.1), "MISSION PARLEMENTAIRE · 2022", "blue", 540, 1180)
note(w(2, "selon"), e(3, 0.0), "PUBLIC", "blue", "staff_pub", 0, -80); note(w(2, "privé"), e(3, 0.0), "PRIVÉ", "red", "staff_priv", 0, -80)
kw(w(2, "40"), e(2, 0.3), "−40 % DE PERSONNEL", "red"); kw(w(3, "où"), e(3, 0.4), "OÙ ?", "gold")
# L4-5 bill
T["heb"] = w(4, "hébergement"); T["dep"] = w(4, "dépendance"); T["soin"] = w(4, "soins"); T["am"] = w(5, "Assurance"); T["famille"] = w(5, "famille")
kw(w(4, "trois"), T["heb"], "3 POSTES", "gold")
note(T["heb"], e(5, 0.2), "HÉBERGEMENT", "gold", "fac_heb", 0, -50); note(T["dep"], e(5, 0.2), "DÉPENDANCE", "blue", "fac_dep", 0, -50); note(T["soin"], e(5, 0.2), "SOINS", "green", "fac_soin", 0, -50)
kw(T["am"], T["famille"], "SOINS PAYÉS", "green"); kw(T["famille"], e(5, 0.3), "LA FAMILLE", "gold")
# L6-7 the walls
T["owner"] = w(6, "propriétaire"); T["rent_on"] = w(7, "loyer"); T["price_on"] = w(7, "prix")
note(w(6, "murs"), e(7, 0.2), "LES MURS", "white", "mur_house", 0, -80); note(T["owner"], e(7, 0.2), "PROPRIÉTAIRE", "gold", "mur_owner", 0, -80); kw(T["owner"], e(6, 0.4), "PROPRIÉTAIRE", "gold")
note(T["rent_on"], e(7, 0.2), "LOYER", "red", "mur_rent", 0, -80); note(T["price_on"], e(7, 0.2), "PRIX DE LA JOURNÉE", "red", "mur_price", 0, -80); kw(T["rent_on"], e(7, 0.4), "LOYER ↑", "red")
# L8 concentration
T["cinq"] = w(8, "cinq"); T["dix"] = w(8, "dix")
note(T["cinq"], e(8, 0.2), "5 GROUPES", "gold", "grp_big", 0, -80); note(T["dix"], e(8, 0.2), "10 EN 2011", "blue", "grp_small", 0, -80)
kw(T["cinq"], T["dix"], "5 GROUPES", "gold"); kw(T["dix"], e(8, 0.4), "10 EN 2011", "blue")
# L9 profitability
T["g5"] = w(9, "5"); T["g7"] = w(9, "7")
note(w(9, "Orpea"), e(9, 0.2), "ORPEA · 2022", "white", "podium", 0, -80); note(w(9, "rentabilité"), e(9, 0.2), "RENTABILITÉ", "gold", "gauge", 0, -60); kw(T["g5"], e(9, 0.4), "5 À 7 %", "gold")
# L10 public deficit (single big subject change : whoosh)
T["def_on"] = w(10, "60")
stamp(w(10, "CNSA"), e(10, 0.0), "CNSA · 2022", "blue", 540, 1180); note(w(10, "établissements"), e(10, 0.1), "PUBLICS ET NON LUCRATIFS", "blue", "def_row", 0, -60)
kw(T["def_on"], w(10, "déficit"), "60 %", "red"); kw(w(10, "déficit"), e(10, 0.4), "DÉFICIT", "red")
# L11 lever
T["lever"] = w(11, "levier"); T["crew_off"] = w(11, "ajuster")
note(w(11, "personnel"), e(11, 0.1), "LE PERSONNEL", "blue", "lever", 0, -70); kw(T["lever"], T["crew_off"], "LE LEVIER", "gold"); kw(T["crew_off"], e(11, 0.4), "AJUSTER", "red")
# L12 bed
T["cross_on"] = w(12, "pas")
note(w(12, "lit"), e(12, 0.2), "UN LIT", "white", "bed", 0, -70); kw(T["cross_on"], e(12, 0.4), "PAS UN LIT", "red")
# L13 time
T["bilan"] = w(13, "bilan")
note(w(13, "présence"), e(13, 0.1), "TEMPS DE PRÉSENCE", "gold", "clock", 0, -70); kw(w(13, "temps"), T["bilan"], "DU TEMPS", "gold"); kw(T["bilan"], e(13, 0.4), "LE BILAN", "green")
note(T["bilan"], e(13, 0.1), "LE BILAN", "green", "ledger", 0, -70)
# L14-15 call to action
T["bubble_on"] = w(14, "Selon"); T["button_on"] = w(15, "abonnez"); T["press"] = w(15, "Decrypt")
note(w(14, "justifié"), e(14, 0.1), "VOTRE AVIS ?", "gold", "bubble", 0, -70); kw(w(14, "Dites"), e(14, 0.5), "COMMENTEZ", "gold")
note(T["button_on"], e(15, 0.1), "DECRYPT BUSINESS", "red", "button", -90, -60); kw(T["button_on"], e(15, 0.4), "ABONNEZ-VOUS", "red")
T["brand"] = e(15, -0.9)
open("video/assets/beats.js", "w").write("window.BEATS=" + json.dumps(B, ensure_ascii=False) + ";")
json.dump(B, open("video/assets/beats.json", "w"), ensure_ascii=False)
print("dur", DUR, "cam keys", len(B["cam"]), "notes", len(B["notes"]), "kws", len(B["kws"]), "whoosh", T["whoosh"])
