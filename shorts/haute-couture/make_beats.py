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
ORDER = ["robe", "clientes", "label", "criteres", "treize", "cout", "produits", "ferme", "defile", "reve", "cta"]
FIRST = dict(robe=0, clientes=1, label=2, criteres=4, treize=5, cout=6, produits=8, ferme=9, defile=10, reve=11, cta=13)
LAST = dict(robe=0, clientes=1, label=3, criteres=4, treize=5, cout=7, produits=8, ferme=9, defile=10, reve=12, cta=14)
B = {"dur": DUR, "times": {}, "heroes": {}, "notes": [], "kws": [], "panels": [], "stamps": [], "cuts": [], "order": ORDER, "spacing": SPACING}
T = B["times"]
def hero(name, a, b): B["heroes"].setdefault(name, []).append([a, b])
def note(t0, t1, text, kind, anchor, dx=0, dy=-95): B["notes"].append(dict(t0=t0, t1=t1, text=text, kind=kind, anchor=anchor, dx=dx, dy=dy))
def kw(t0, t1, text, color="gold", rot=-2): B["kws"].append(dict(t0=t0, t1=t1, text=text, color=color, rot=rot))
def panel(t0, t1, pid, y=760, o=None): B["panels"].append(dict(t0=t0, t1=t1, id=pid, y=y, o=o))
def stamp(t0, t1, text, kind, x=540, y=470, rot=-3): B["stamps"].append(dict(t0=t0, t1=t1, text=text, kind=kind, x=x, y=y, rot=rot))

# ---- heroes (one per place) ----
for n in ORDER: hero(n, 0.0 if n == "robe" else s(FIRST[n]), e(LAST[n], 0.1) if n != "cta" else DUR + 2)
ORB = dict(robe=(0.5, -0.4, 24, 19, 8, 8, 4.5), clientes=(0.4, -0.4, 24, 19, 8, 8, 5.0), label=(0.5, -0.4, 24, 19, 8, 8, 4.0), criteres=(0.4, -0.3, 24, 19, 10, 10, 2.2),
           treize=(0.4, -0.4, 22, 17, 8, 8, 3.0), cout=(0.5, -0.4, 24, 19, 8, 8, 3.6), produits=(0.4, -0.4, 22, 17, 8, 8, 3.0), ferme=(0.5, -0.4, 24, 19, 8, 8, 3.4),
           defile=(0.5, -0.3, 24, 19, 9, 9, 3.0), reve=(0.4, -0.4, 24, 19, 8, 8, 4.4), cta=(0.3, -0.3, 22, 16, 7, 7, 5.5))
START = {n: (0.0 if n == "robe" else s(FIRST[n])) for n in ORDER}
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
        p = (p[0], p[1] + 9.0 * math.sin(math.pi * g), p[2])   # aerial hump: the camera rises while it glides, never skimming the stage props
    return p, l
B["cam"] = []; t = 0.0
while t <= DUR + 1e-6:
    p, l = cam(t); B["cam"].append([round(t, 3)] + [round(x, 3) for x in p + l]); t += 1 / 30
B["fov"] = 42
T["whoosh"] = s(6) - 0.55   # one single big subject change: from what haute couture is (label, criteria) to its economics (cost vs perfumes)

# ---- overlays, all exactly on the spoken word ----
T["dots_on"] = s(0, 0.3); T["dots_end"] = w(0, "main")
stamp(w(0, "presse"), e(0, -0.1), "SELON LA PRESSE", "blue", 540, 1180); note(w(0, "haute"), e(0, 0.2), "HAUTE COUTURE", "white", "rb_dress", 0, -60); kw(w(0, "700"), e(0, 0.4), "700 H", "gold"); note(w(0, "main"), e(0, 0.3), "À LA MAIN", "gold", "rb_clock", 0, -60)
T["cl_on"] = w(1, "5")
stamp(w(1, "estimations"), e(1, -0.1), "ESTIMATIONS", "blue", 540, 1180); note(w(1, "clientes"), e(1, 0.2), "CLIENTES", "gold", "cl_globe", 0, -60); kw(T["cl_on"], e(1, 0.4), "≈ 5 000", "gold")
T["seal_on"] = w(2, "label"); T["state_on"] = w(3, "ministère"); T["year_on"] = w(3, "accordé"); T["year_end"] = w(3, "seulement")
kw(w(2, "pourquoi"), w(2, "Parce"), "POURQUOI ?", "gold"); note(T["seal_on"], e(2, 0.2), "UN LABEL", "gold", "lb_seal", 0, -70); kw(T["seal_on"], e(2, 0.4), "LABEL", "gold")
note(w(3, "1945"), e(3, 0.2), "PROTÉGÉ", "white", "lb_state", 0, -70); note(T["state_on"], e(3, 0.2), "MINISTÈRE DE L'INDUSTRIE", "blue", "lb_state", 0, -110); kw(w(3, "1945"), T["state_on"], "DEPUIS 1945", "gold"); kw(T["year_on"], e(3, 0.4), "1 AN", "red"); note(T["year_on"], e(3, 0.2), "ACCORDÉ 1 AN", "red", "lb_ring", 0, -60)
T["staff_on"] = w(4, "vingt"); T["atel_on"] = w(4, "ateliers"); T["look_on"] = w(4, "25")
note(T["staff_on"], e(4, 0.2), "20 SALARIÉS", "gold", "cr_staff", 0, -60); note(T["atel_on"], e(4, 0.2), "2 ATELIERS", "blue", "cr_atel", 0, -60); note(T["look_on"], e(4, 0.2), "25 PASSAGES", "red", "cr_look", 0, -60)
kw(T["staff_on"], T["atel_on"], "20 SALARIÉS", "gold"); kw(T["atel_on"], T["look_on"], "2 ATELIERS", "blue"); kw(T["look_on"], e(4, 0.4), "25 PASSAGES", "red")
T["h13_on"] = w(5, "13")
note(w(5, "appellation"), e(5, 0.2), "APPELLATION · 2026", "white", "tz_row", 0, -60); kw(T["h13_on"], e(5, 0.4), "13 MAISONS", "gold")
T["cost_on"] = w(6, "cher"); T["nonrent_on"] = w(6, "rentable"); T["vitr_on"] = w(7, "vitrine")
note(w(6, "coûte"), e(6, 0.2), "COÛTS", "red", "ct_cost", 0, -60); note(T["nonrent_on"], e(7, 0.0), "RECETTES", "green", "ct_rev", 0, -60); kw(T["cost_on"], T["nonrent_on"], "COÛTE CHER", "red"); kw(T["nonrent_on"], e(6, 0.4), "PAS RENTABLE", "red")
note(T["vitr_on"], e(7, 0.3), "VITRINE", "white", "ct_win", 0, -70); kw(T["vitr_on"], e(7, 0.4), "VITRINE", "gold")
T["pv0"] = s(8, 0.3); T["pv1"] = s(8, 1.6); T["pv2"] = s(8, 2.9); T["perf_on"] = w(8, "parfums"); T["cosm_on"] = w(8, "cosmétiques"); T["acc_on"] = w(8, "accessoires")
note(T["perf_on"], e(8, 0.2), "PARFUMS", "gold", "pr_perf", 0, -70); note(T["cosm_on"], e(8, 0.2), "COSMÉTIQUES", "red", "pr_cos", 0, -70); note(T["acc_on"], e(8, 0.2), "ACCESSOIRES", "blue", "pr_acc", 0, -70)
kw(T["perf_on"], T["cosm_on"], "PARFUMS", "gold"); kw(T["cosm_on"], T["acc_on"], "COSMÉTIQUES", "red"); kw(T["acc_on"], e(8, 0.4), "ACCESSOIRES", "blue")
T["shut_on"] = w(9, "fermé"); T["ruin_on"] = w(9, "ruineux")
note(w(9, "département"), e(9, 0.2), "DÉPARTEMENT COUTURE", "white", "fm_house", 0, -70); note(T["ruin_on"], e(9, 0.3), "RUINEUX", "red", "fm_lock", 0, -60); kw(T["shut_on"], T["ruin_on"], "FERMÉ", "red"); kw(T["ruin_on"], e(9, 0.4), "RUINEUX", "red")
T["flash_on"] = w(10, "défilé")
note(T["flash_on"], e(10, 0.2), "LE DÉFILÉ", "white", "df_run", 0, -70); kw(w(10, "campagne"), e(10, 0.4), "COMMUNICATION", "gold"); note(w(10, "reste"), e(10, 0.2), "RESTE DE LA MARQUE", "gold", "df_spot", 0, -60)
T["cross_on"] = w(11, "pas"); T["dream_on"] = w(12, "rêve"); T["perfume_on"] = w(12, "parfum")
kw(T["cross_on"], e(11, 0.4), "PAS SEULEMENT", "red"); note(w(11, "robes"), e(11, 0.3), "ROBES", "gold", "rv_dress", 0, -60)
kw(T["dream_on"], T["perfume_on"], "UN RÊVE", "gold"); kw(T["perfume_on"], e(12, 0.4), "DU PARFUM", "blue"); note(T["perfume_on"], e(12, 0.3), "PARFUM", "gold", "rv_perf", 0, -60); note(T["dream_on"], e(12, 0.2), "LE RÊVE", "white", "rv_dream", 0, -60)
T["bubble_on"] = w(13, "Selon"); T["button_on"] = w(14, "abonnez"); T["press"] = w(14, "Decrypt")
note(w(13, "art"), e(13, 0.1), "ART OU PUBLICITÉ ?", "gold", "bubble", 0, -70); kw(w(13, "Dites"), e(13, 0.5), "COMMENTEZ", "gold")
kw(T["button_on"], e(14, 0.4), "ABONNEZ-VOUS", "red")
T["brand"] = e(14, -0.9)
open("video/assets/beats.js", "w").write("window.BEATS=" + json.dumps(B, ensure_ascii=False) + ";")
json.dump(B, open("video/assets/beats.json", "w"), ensure_ascii=False)
print("dur", DUR, "cam keys", len(B["cam"]), "notes", len(B["notes"]), "kws", len(B["kws"]), "whoosh", T["whoosh"])
