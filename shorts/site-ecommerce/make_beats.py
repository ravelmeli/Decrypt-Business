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
ORDER = ["marche", "panier", "partage", "visiteurs", "pub", "meta70", "retours", "marketplace", "relation", "achete", "cta"]
FIRST = dict(marche=0, panier=1, partage=2, visiteurs=3, pub=4, meta70=6, retours=7, marketplace=9, relation=11, achete=12, cta=14)
LAST = dict(marche=0, panier=1, partage=2, visiteurs=3, pub=5, meta70=6, retours=8, marketplace=10, relation=11, achete=13, cta=15)
B = {"dur": DUR, "times": {}, "heroes": {}, "notes": [], "kws": [], "panels": [], "stamps": [], "cuts": [], "order": ORDER, "spacing": SPACING}
T = B["times"]
def hero(name, a, b): B["heroes"].setdefault(name, []).append([a, b])
def note(t0, t1, text, kind, anchor, dx=0, dy=-95): B["notes"].append(dict(t0=t0, t1=t1, text=text, kind=kind, anchor=anchor, dx=dx, dy=dy))
def kw(t0, t1, text, color="gold", rot=-2): B["kws"].append(dict(t0=t0, t1=t1, text=text, color=color, rot=rot))
def panel(t0, t1, pid, y=760, o=None): B["panels"].append(dict(t0=t0, t1=t1, id=pid, y=y, o=o))
def stamp(t0, t1, text, kind, x=540, y=470, rot=-3): B["stamps"].append(dict(t0=t0, t1=t1, text=text, kind=kind, x=x, y=y, rot=rot))

# ---- heroes (one per place) ----
for n in ORDER: hero(n, 0.0 if n == "marche" else s(FIRST[n]), e(LAST[n], 0.1) if n != "cta" else DUR + 2)
ORB = dict(marche=(0.5, -0.4, 24, 19, 8, 8, 5.0), panier=(0.5, -0.4, 22, 17, 7.5, 7.5, 2.8), partage=(0.4, -0.4, 22, 17, 9, 9, 2.2), visiteurs=(0.4, -0.3, 22, 17, 10, 10, 2.0),
           pub=(0.5, -0.4, 24, 19, 8, 8, 4.0), meta70=(0.5, -0.4, 22, 17, 8, 8, 2.6), retours=(0.4, -0.4, 22, 17, 10, 10, 2.0), marketplace=(0.5, -0.4, 24, 19, 8.5, 8.5, 2.6),
           relation=(0.4, -0.4, 22, 17, 8, 8, 3.0), achete=(0.4, -0.4, 22, 17, 8, 8, 3.6), cta=(0.3, -0.3, 22, 16, 7, 7, 5.5))
START = {n: (0.0 if n == "marche" else s(FIRST[n])) for n in ORDER}
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
T["whoosh"] = s(7) - 0.55   # one single big subject change: from the acquisition of customers to the after-sale (returns)

# ---- overlays, all exactly on the spoken word ----
T["tower_on"] = s(0, 0.35)
note(w(0, "ligne"), e(0, 0.2), "VENTES EN LIGNE", "blue", "mk_top", 0, -70); kw(w(0, "196"), e(0, 0.4), "196 Md€", "gold")
T["basket_on"] = s(1, 1.0); T["tag62"] = w(1, "62")
note(w(1, "milliards"), e(1, 0.1), "3 MILLIARDS DE COMMANDES", "blue", "pn_belt", 0, -70); note(T["basket_on"], e(1, 0.2), "PANIER MOYEN", "white", "pn_tag", 0, -60); kw(T["tag62"], e(1, 0.4), "62 €", "gold")
T["sl_marge"] = w(2, "peu"); T["sl_site"] = w(2, "site"); T["sl_colis"] = w(2, "colis"); T["sl_pub"] = w(2, "publicité")
note(T["sl_marge"], e(2, 0.1), "MARGE", "green", "pa_marge", 0, -60); note(T["sl_site"], e(2, 0.1), "SITE", "blue", "pa_site", 0, -60); note(T["sl_colis"], e(2, 0.1), "COLIS", "gold", "pa_colis", 0, -60); note(T["sl_pub"], e(2, 0.1), "PUBLICITÉ", "red", "pa_pub", 0, -60); kw(T["sl_marge"], T["sl_site"], "PEU DE PLACE", "gold")
T["buy_on"] = w(3, "1,5")
stamp(w(3, "benchmarks"), e(3, -0.1), "BENCHMARKS · AGENCES", "blue", 540, 1180); note(w(3, "visiteurs"), e(3, 0.2), "100 VISITEURS", "white", "vi_crowd", 0, -60); note(w(3, "achètent"), e(3, 0.3), "ACHÈTENT", "green", "vi_door", 0, -60); kw(T["buy_on"], e(3, 0.4), "1,5 À 3 %", "gold")
T["mega_on"] = s(4, 0.2); T["google_on"] = w(4, "Google"); T["meta_on"] = w(4, "Meta"); T["six_on"] = w(5, "six")
kw(w(4, "publicité"), T["google_on"], "PUBLICITÉ", "red"); note(T["google_on"], e(5, 0.1), "GOOGLE", "blue", "pub_g", 0, -60); note(T["meta_on"], e(5, 0.1), "META", "white", "pub_m", 0, -60); kw(T["google_on"], e(4, 0.4), "GOOGLE · META", "gold")
stamp(w(5, "consultant"), e(5, -0.1), "UN CONSULTANT CITÉ PAR LSA", "blue", 540, 1180); kw(T["six_on"], e(5, 0.4), "×6", "red"); note(w(5, "2010"), e(5, 0.2), "2010", "white", "pub_small", 0, -60); note(T["six_on"], e(5, 0.2), "AUJOURD'HUI", "red", "pub_big", 0, -60)
T["pie70_on"] = w(6, "70"); T["bag_on"] = w(6, "Cabaïa")
note(T["bag_on"], e(6, 0.2), "CABAÏA", "gold", "mt_bag", 0, -70); note(T["pie70_on"], e(6, 0.2), "FACEBOOK + INSTAGRAM", "red", "mt_pie", 0, -60); kw(T["pie70_on"], e(6, 0.4), "70 %", "red")
T["ret_on"] = w(7, "24"); T["leg_on"] = w(8, "colis"); T["twice_on"] = w(8, "deux")
stamp(w(7, "Fevad"), e(7, -0.1), "FEVAD", "blue", 540, 1180); note(w(7, "retournés"), e(8, 0.1), "RETOURS", "red", "re_shelf", 0, -70); kw(T["ret_on"], e(7, 0.4), "24 %", "red")
note(T["leg_on"], T["twice_on"], "ALLER", "gold", "re_legs", -150, -60); note(T["twice_on"], e(8, 0.2), "RETOUR", "gold", "re_legs", 150, -60); kw(w(8, "payé"), e(8, 0.4), "PAYÉ 2 FOIS", "red")
T["mall_on"] = w(9, "marketplace"); T["pie32"] = w(9, "32"); T["skim_on"] = w(10, "commission"); T["cat_on"] = w(10, "catégorie")
note(T["mall_on"], e(9, 0.2), "MARKETPLACE", "white", "mp_mall", 0, -70); note(T["pie32"], e(10, 0.0), "32 % DES VENTES", "gold", "mp_pie", 0, -60); kw(T["mall_on"], T["pie32"], "MARKETPLACE", "blue"); kw(T["pie32"], e(9, 0.4), "32 %", "gold")
kw(T["skim_on"], e(10, 0.4), "COMMISSION", "red"); note(T["cat_on"], e(10, 0.3), "SELON LA CATÉGORIE", "gold", "mp_skim", 0, -60)
T["line_on"] = w(11, "garde")
note(w(11, "vendeur"), e(11, 0.2), "VENDEUR", "red", "rl_seller", 0, -70); note(w(11, "elle"), e(11, 0.2), "MARKETPLACE", "white", "rl_mall", 0, -70); note(w(11, "acheteur"), e(11, 0.3), "ACHETEUR", "gold", "rl_buyer", 0, -70); kw(w(11, "relation"), e(11, 0.4), "LA RELATION", "gold")
T["cross_on"] = w(12, "pas"); T["buy_on2"] = w(13, "achète"); T["back_on"] = w(13, "revenir")
kw(T["cross_on"], e(12, 0.4), "PAS SEULEMENT", "red"); note(w(12, "produits"), e(12, 0.3), "PRODUITS", "gold", "ac_box", 0, -70); kw(T["buy_on2"], T["back_on"], "ACHÈTE", "red"); kw(T["back_on"], e(13, 0.4), "REVENIR", "green"); note(w(13, "clients"), e(13, 0.3), "CLIENTS", "gold", "ac_cust", 0, -70)
T["bubble_on"] = w(14, "Selon"); T["button_on"] = w(15, "abonnez"); T["press"] = w(15, "Decrypt")
note(w(14, "vous"), e(14, 0.1), "VOTRE AVIS ?", "gold", "bubble", 0, -70); kw(w(14, "Dites"), e(14, 0.5), "COMMENTEZ", "gold")
kw(T["button_on"], e(15, 0.4), "ABONNEZ-VOUS", "red")
T["brand"] = e(15, -0.9)
open("video/assets/beats.js", "w").write("window.BEATS=" + json.dumps(B, ensure_ascii=False) + ";")
json.dump(B, open("video/assets/beats.json", "w"), ensure_ascii=False)
print("dur", DUR, "cam keys", len(B["cam"]), "notes", len(B["notes"]), "kws", len(B["kws"]), "whoosh", T["whoosh"])
