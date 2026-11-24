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
ORDER = ["vitrine", "origine", "usa", "france", "reference", "gonfle", "finance", "appel", "calendrier", "gagnants", "methode", "cta"]
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
ORB["cta"] = (0.3, -0.3, 22, 18, 7.5, 6.5, 4.2)
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
def Li(prefix):
    h = [i for i, l in enumerate(SL) if " ".join(l).startswith(prefix)]
    if len(h) != 1: raise SystemExit(f"line prefix {prefix!r}: {len(h)} hits")
    return h[0]
def cn(to, pre="", suf="", t0=0.0, d=0.7, dec=0): return dict(to=to, pre=pre, suf=suf, t0=t0, d=d, dec=dec)
def KWt(t0, t1, text, color="gold", rot=-2): kw(t0, t1, text, color, rot)
def KCt(t0, t1, text, color, to, pre="", suf="", d=0.7, dec=0): kw(t0, t1, text, color, cnt=cn(to, pre, suf, t0, d, dec))
def Nt(t0, t1, text, kind, anchor, dx=0, dy=-70): note(t0, t1, text, kind, anchor, dx, dy)
def STt(t0, t1, text, kind): stamp(t0, t1, text, kind, 960, 770)
E = lambda i, o=0.3: e(i, o)
def KWl(i, text, color="gold", word=None, o=0.0):   # keyword over a whole line (from `word` if given)
    KWt(A(i, word, 0, o) if word else s(i, 0.05), E(i, 0.3), text, color)
# ---- CH1 : vitrine ----
l = Li("Le vendredi 27"); T["tag_on"] = A(l, "affiche"); KWt(A(l, "vendredi"), A(l, "des"), "VENDREDI 27 NOVEMBRE", "gold"); KCt(A(l, "quarante"), E(l, 0.3), "− 40 %", "red", 40, "− ", " %", 0.5); Nt(A(l, "affiche"), E(l, 0.3), "L'AFFICHE", "white", "vi_sign")
l = Li("Mais moins quarante"); T["q_on"] = A(l, "rapport"); KWt(A(l, "rapport"), E(l, 0.4), "PAR RAPPORT À QUOI ?", "gold"); Nt(A(l, "quoi"), E(l, 0.3), "?", "gold", "vi_q")
l = Li("Selon une étude"); T["pie_on"] = A(l, "trente"); STt(A(l, "Commission"), A(l, "trente"), "COMMISSION EUROPÉENNE", "blue"); KCt(A(l, "trente"), E(l, 0.3), "≈ 30 % DE PROMOS FAUSSES", "red", 30, "≈ ", " % DE PROMOS FAUSSES", 0.6); Nt(A(l, "trente"), E(l, 0.3), "30 %", "red", "vi_pie")
l = Li("Et l'association"); KWl(l, "EN DESSOUS DE LA RÉALITÉ", "red", "dessous")
l = Li("Alors qui gagne"); T["three_on"] = A(l, "vous"); KWt(s(l, 0.05), A(l, "vous"), "QUI GAGNE VRAIMENT ?", "gold"); Nt(A(l, "vous"), E(l, 0.3), "VOUS", "blue", "vi_you"); Nt(A(l, "enseignes"), E(l, 0.3), "ENSEIGNES", "gold", "vi_store"); Nt(A(l, "marques"), E(l, 0.3), "MARQUES", "white", "vi_brand")
l = Li("Dans cette vidéo"); KWl(l, "LES COULISSES ÉCONOMIQUES", "gold", "coulisses")
l = Li("Restez jusqu'à"); KWl(l, "UNE MÉTHODE SIMPLE", "green", "méthode")
# ---- CH2 : origine ----
l = Li("Commençons par"); T["myth_on"] = A(l, "surprise"); KWl(l, "UNE HISTOIRE FAUSSE ?", "gold", "surprise")
l = Li("On entend souvent"); T["led_on"] = A(l, "rouge"); Nt(A(l, "rouge"), A(l, "noir"), "PERTES", "red", "or_red"); Nt(A(l, "noir"), E(l, 0.3), "BÉNÉFICES", "white", "or_blk"); KWt(A(l, "rouge"), E(l, 0.3), "DU ROUGE AU NOIR", "gold")
l = Li("Selon History.com"); STt(A(l, "History.com"), E(l, 0.2), "HISTORY.COM · BRITANNICA", "blue"); KWl(l, "UNE RELECTURE COMMERCIALE", "gold", "relecture")
l = Li("L'expression viendrait"); T["car_on"] = A(l, "police"); KWt(A(l, "police"), E(l, 0.3), "PHILADELPHIE · 1961", "blue"); Nt(A(l, "police"), E(l, 0.3), "POLICE", "blue", "or_car")
l = Li("Un usage encore"); T["mag_on"] = A(l, "1951"); KWt(A(l, "1951"), E(l, 0.3), "DÉJÀ EN 1951", "gold"); Nt(A(l, "revue"), E(l, 0.3), "REVUE INDUSTRIELLE", "white", "or_mag")
l = Li("Autrement dit"); KWl(l, "UN NOM NÉGATIF", "red", "négatif")
l = Li("Les enseignes ont"); T["flip_on"] = A(l, "positif"); KWl(l, "UN SENS POSITIF", "green", "positif")
l = Li("C'est déjà une leçon"); KWt(s(l, 0.05), E(l, 0.3), "LE RÉCIT COMPTE AUTANT QUE LE PRIX", "gold")
# ---- CH3 : usa ----
l = Li("Passons aux chiffres"); KWt(s(l, 0.0), E(l, 0.3), "LES CHIFFRES", "gold")
l = Li("Aux États-Unis"); T["us_on"] = A(l, "onze"); STt(A(l, "Adobe"), A(l, "onze"), "ADOBE ANALYTICS", "blue"); KCt(A(l, "onze"), E(l, 0.3), "11,8 MD $ EN LIGNE", "green", 11.8, "", " MD $ EN LIGNE", 0.7, 1); Nt(A(l, "onze"), E(l, 0.3), "ÉTATS-UNIS", "blue", "us_a")
l = Li("C'est un record"); T["rec_on"] = A(l, "record"); KWt(A(l, "record"), E(l, 0.3), "RECORD · 4E ANNÉE", "gold"); Nt(A(l, "record"), E(l, 0.3), "RECORD", "gold", "us_rec")
l = Li("Salesforce estime"); T["sf_on"] = A(l, "soixante-dix-neuf"); STt(A(l, "Salesforce"), A(l, "soixante-dix-neuf"), "SALESFORCE", "blue"); KCt(A(l, "soixante-dix-neuf"), E(l, 0.3), "≈ 79 MD $ DANS LE MONDE", "green", 79, "≈ ", " MD $ DANS LE MONDE", 0.8); Nt(A(l, "soixante-dix-neuf"), E(l, 0.3), "MONDE", "blue", "us_s")
l = Li("Les périmètres"); T["no_on"] = A(l, "périmètres"); KWt(A(l, "périmètres"), E(l, 0.4), "PÉRIMÈTRES DIFFÉRENTS", "red"); Nt(A(l, "additionner"), E(l, 0.3), "NE PAS ADDITIONNER", "red", "us_eq")
# ---- CH4 : france ----
l = Li("Et en France"); T["fr_on"] = A(l, "Fevad"); STt(A(l, "Fevad"), A(l, "cent"), "FEVAD", "blue"); KCt(A(l, "cent"), E(l, 0.3), "≈ 196 MD € EN LIGNE", "green", 196, "≈ ", " MD € EN LIGNE", 0.8); Nt(A(l, "cent"), E(l, 0.3), "+ 7 %", "green", "fr_fe")
l = Li("Le nombre de transactions"); T["tr_on"] = A(l, "transactions"); T["bk_on"] = A(l, "panier"); KWt(A(l, "transactions"), A(l, "mais"), "TRANSACTIONS + 10 %", "green"); KCt(A(l, "reculé"), E(l, 0.3), "PANIER − 3 % : 62 €", "red", 62, "PANIER − 3 % : ", " €", 0.5); Nt(A(l, "panier"), E(l, 0.3), "PANIER MOYEN", "white", "fr_bas")
l = Li("Plus d'achats"); KWt(s(l, 0.0), E(l, 0.3), "PLUS D'ACHATS, PLUS PETITS", "gold")
l = Li("Selon l'étude Joko"); T["joko_on"] = A(l, "quatre"); STt(A(l, "Joko"), A(l, "plus"), "ÉTUDE JOKO", "blue"); KWt(A(l, "plus"), E(l, 0.3), "1 ACHAT SUR 4 LE VENDREDI", "gold"); Nt(A(l, "quatre"), E(l, 0.3), "25 %", "gold", "fr_pie")
l = Li("Pour 2026"); T["bud_on"] = A(l, "cent"); KCt(A(l, "cent"), E(l, 0.3), "≈ 151 € DE BUDGET", "gold", 151, "≈ ", " € DE BUDGET", 0.6); Nt(A(l, "cent"), E(l, 0.3), "BUDGET MOYEN", "gold", "fr_bud")
l = Li("Et plus de la moitié"); T["half_on"] = A(l, "moitié"); KWt(A(l, "moitié"), E(l, 0.3), "PLUS DE LA MOITIÉ AFFECTÉS", "red"); Nt(A(l, "moitié"), E(l, 0.3), "SONDAGE", "red", "fr_pie")
l = Li("Dans un contexte"); T["inf_on"] = A(l, "inflation"); KWt(A(l, "inflation"), E(l, 0.3), "INFLATION", "red"); Nt(A(l, "inflation"), E(l, 0.3), "PRIX ↑", "red", "fr_inf")
l = Li("Voilà pourquoi"); KWt(s(l, 0.05), E(l, 0.3), "UN SUJET ÉCONOMIQUE", "gold")
# ---- CH5 : reference ----
l = Li("Regardons maintenant"); KWl(l, "COMMENT ON FABRIQUE UNE PROMO", "gold", "fabriquée")
l = Li("Première étape"); T["rule_on"] = A(l, "Première"); KWt(A(l, "Première"), E(l, 0.3), "1 · LE PRIX DE RÉFÉRENCE", "gold")
l = Li("Une réduction ne veut"); KWt(s(l, 0.05), E(l, 0.3), "SANS PRIX DE DÉPART : RIEN", "gold")
l = Li("En France, la règle"); T["cal_on"] = A(l, "trente"); T["low_on"] = A(l, "bas"); KCt(A(l, "trente"), E(l, 0.3), "30 JOURS", "gold", 30, "", " JOURS", 0.5); Nt(A(l, "bas"), E(l, 0.3), "LE PLUS BAS", "green", "rf_low")
l = Li("C'est la DGCCRF"); T["gov_on"] = A(l, "DGCCRF"); STt(A(l, "DGCCRF"), E(l, 0.2), "DGCCRF · CONTRÔLE", "blue"); Nt(A(l, "DGCCRF"), E(l, 0.3), "DGCCRF", "blue", "rf_gov")
l = Li("Sur le papier"); KWt(s(l, 0.05), E(l, 0.3), "SUR LE PAPIER : PROTECTEUR", "green")
l = Li("Mais cette règle"); KWt(A(l, "Mais"), E(l, 0.3), "SEULEMENT 30 JOURS", "red"); Nt(A(l, "trente"), E(l, 0.3), "30 DERNIERS JOURS", "red", "rf_board")
l = Li("Et c'est là"); T["game_on"] = A(l, "jeu"); KWt(A(l, "jeu") - 0.8, E(l, 0.3), "LE JEU COMMENCE", "red"); Nt(A(l, "jeu"), E(l, 0.3), "LE JEU", "gold", "rf_game")
# ---- CH6 : gonfle ----
l = Li("Selon l'UFC-Que Choisir, certaines"); T["inflate_on"] = A(l, "augmentent"); STt(A(l, "UFC-Que"), A(l, "augmentent"), "UFC-QUE CHOISIR", "blue"); KWt(A(l, "augmentent"), E(l, 0.3), "PRIX GONFLÉ AVANT", "red")
l = Li("L'association cite"); T["t1_on"] = A(l, "trois"); T["ar_on"] = A(l, "puis"); T["t2_on"] = A(l, "puis", 0, 0.9); KCt(A(l, "trois"), A(l, "puis"), "379,99 €", "gold", 379.99, "", " €", 0.6, 2); KCt(A(l, "quarante-huit"), E(l, 0.3), "− 48 % AFFICHÉ", "green", 48, "− ", " % AFFICHÉ", 0.5); Nt(A(l, "trois"), A(l, "puis"), "J − 30", "gold", "gn6_a"); Nt(A(l, "quarante-huit"), E(l, 0.3), "RÉDUCTION AFFICHÉE", "green", "gn6_b")
l = Li("Attention : ces pratiques"); KWl(l, "PAS TOUJOURS ILLÉGAL", "gold", "illégales")
l = Li("L'enjeu"); KWl(l, "COMPRENDRE LE MÉCANISME", "green", "comprendre")
l = Li("Pour la DGCCRF"); T["grid_on"] = A(l, "DGCCRF"); T["red_on"] = A(l, "tiers"); STt(A(l, "DGCCRF"), A(l, "tiers"), "DGCCRF · 2023", "blue"); KCt(A(l, "tiers"), E(l, 0.3), "≈ 1 / 3 DES 1 000 CONTRÔLÉS", "red", 1000, "≈ 1 / 3 DES ", " CONTRÔLÉS", 0.6); Nt(A(l, "anomalies"), E(l, 0.3), "ANOMALIES", "red", "gn6_g")
l = Li("Cela ne veut pas"); KWt(s(l, 0.05), E(l, 0.3), "≠ UN TIERS DE FAUSSES PROMOS", "red")
l = Li("Cela veut dire"); T["clar_on"] = A(l, "corriger"); KWt(A(l, "point"), E(l, 0.3), "UN POINT À CORRIGER", "gold"); Nt(A(l, "corriger"), E(l, 0.3), "AU MOINS 1 POINT", "green", "gn6_t")
# ---- CH7 : finance ----
l = Li("Deuxième étape"); T["tag7_on"] = A(l, "finance"); KWt(A(l, "Deuxième"), E(l, 0.3), "2 · QUI FINANCE LA REMISE ?", "gold"); Nt(A(l, "remise"), E(l, 0.3), "LE RABAIS", "red", "fi_tag")
l = Li("Ici, il faut"); T["q7_on"] = A(l, "honnête"); STt(A(l, "chiffres"), E(l, 0.2), "CHIFFRES NON PUBLICS", "gold"); Nt(A(l, "honnête"), E(l, 0.3), "?", "gold", "fi_q")
l = Li("Selon la presse"); T["sto_on"] = A(l, "enseignes"); KWt(A(l, "marge"), E(l, 0.3), "MARGE SACRIFIÉE", "red"); Nt(A(l, "enseignes"), E(l, 0.3), "ENSEIGNE", "gold", "fi_shop")
l = Li("Et selon un distributeur"); T["fac_on"] = A(l, "fabricants"); T["pc_on"] = A(l, "dix"); STt(A(l, "Galaxus"), A(l, "fabricants"), "GALAXUS · DISTRIBUTEUR SUISSE", "blue"); KCt(A(l, "dix"), E(l, 0.3), "10 À 20 % PAR LA MARQUE", "gold", 10, "", " À 20 % PAR LA MARQUE", 0.5); Nt(A(l, "fabricants"), E(l, 0.3), "MARQUE", "white", "fi_fac")
l = Li("Le principe est"); T["flow_on"] = A(l, "partie"); KWt(A(l, "fournisseur"), E(l, 0.3), "FOURNISSEUR + DISTRIBUTEUR", "gold")
l = Li("Mais je n'ai pas trouvé de données"); KWl(l, "RÉPARTITION INCONNUE", "red", "fiables")
l = Li("Retenez simplement"); T["you_on"] = A(l, "vous"); T["arb_on"] = A(l, "arbitrage"); KWt(A(l, "cadeau"), E(l, 0.3), "UN ARBITRAGE, PAS UN CADEAU", "gold"); Nt(A(l, "vous"), E(l, 0.3), "VOUS", "blue", "fi_you")
# ---- CH8 : appel ----
l = Li("Troisième étape"); T["tv_on"] = A(l, "produit"); KWt(A(l, "Troisième"), E(l, 0.3), "3 · LE PRODUIT D'APPEL", "gold")
l = Li("Pour attirer"); T["crowd_on"] = A(l, "attirer"); Nt(A(l, "prix"), E(l, 0.3), "PRIX TRÈS BAS", "red", "ap_tv"); KWt(A(l, "attirer"), E(l, 0.3), "ATTIRER LE MONDE", "gold")
l = Li("Le but n'est pas"); KWt(A(l, "gagner"), E(l, 0.3), "PAS DE MARGE SUR CET ARTICLE", "red")
l = Li("Et une fois"); T["buy_on"] = A(l, "acheter"); KWt(A(l, "acheter"), E(l, 0.3), "ON ACHÈTE AUSSI LE RESTE", "green"); Nt(A(l, "acheter"), E(l, 0.3), "PANIER", "green", "ap_cart")
l = Li("Même logique"); T["clk_on"] = A(l, "rareté"); T["lim_on"] = A(l, "stock"); KWt(A(l, "rareté"), E(l, 0.3), "RARETÉ · COMPTE À REBOURS", "red"); Nt(A(l, "rebours"), E(l, 0.3), "COMPTE À REBOURS", "red", "ap_clk")
l = Li("Ces signaux"); KWl(l, "UNE DÉCISION MOINS COMPARÉE", "gold", "rapide")
l = Li("C'est de la psychologie"); KWt(s(l, 0.05), E(l, 0.3), "PSYCHOLOGIE DU COMMERCE", "blue")
l = Li("Mais je n'ai pas de chiffre"); STt(A(l, "chiffre"), E(l, 0.2), "PAS DE CHIFFRE SOURCÉ", "gold")
# ---- CH9 : calendrier ----
l = Li("Quatrième étape"); T["grid9_on"] = A(l, "Quatrième"); KWt(A(l, "Quatrième"), E(l, 0.3), "4 · LE CALENDRIER", "gold")
l = Li("Le Black Friday ne dure"); T["day_on"] = A(l, "Black"); KWt(A(l, "journée") - 0.6, E(l, 0.3), "PLUS UNE SEULE JOURNÉE", "red"); Nt(A(l, "Black"), E(l, 0.3), "VENDREDI", "red", "ca_fri")
l = Li("Selon l'AARP"); T["early_on"] = A(l, "AARP"); T["thx_on"] = A(l, "Thanksgiving"); STt(A(l, "AARP"), A(l, "dès"), "AARP", "blue"); Nt(A(l, "soir"), E(l, 0.3), "OUVERTURE TÔT", "gold", "ca_shop")
l = Li("Aujourd'hui, c'est presque"); T["month_on"] = A(l, "mois"); KWt(A(l, "campagne"), E(l, 0.3), "PRESQUE UN MOIS", "gold"); Nt(A(l, "mois"), E(l, 0.3), "CAMPAGNE", "gold", "ca_grid")
l = Li("En France, selon Economie"); T["week_on"] = A(l, "Week"); T["mon_on"] = A(l, "Cyber"); STt(A(l, "Economie"), A(l, "séquence"), "ECONOMIE MATIN", "blue"); KWt(A(l, "Week"), A(l, "lundi"), "BLACK WEEK", "red"); KWt(A(l, "Cyber"), E(l, 0.3), "CYBER MONDAY", "blue")
l = Li("Pour l'enseigne"); T["xmas_on"] = A(l, "cadeaux"); KWt(A(l, "étale"), A(l, "pic"), "ON ÉTALE LA DEMANDE", "gold"); Nt(A(l, "cadeaux"), E(l, 0.3), "CADEAUX DE NOËL", "green", "ca_gift")
l = Li("Pour vous, cela"); KWt(A(l, "normale"), E(l, 0.3), "LA PROMO DEVIENT NORMALE", "red")
# ---- CH10 : gagnants ----
l = Li("Alors, qui gagne"); KWt(s(l, 0.0), E(l, 0.3), "QUI GAGNE VRAIMENT ?", "gold")
l = Li("Le consommateur peut"); T["cons_on"] = A(l, "consommateur"); Nt(A(l, "consommateur"), E(l, 0.3), "SI VOUS COMPAREZ", "green", "ga_you")
l = Li("L'enseigne gagne"); T["ens_on"] = A(l, "enseigne"); KWt(A(l, "volume"), E(l, 0.3), "VOLUME · TRAFIC · TRÉSORERIE", "gold"); Nt(A(l, "enseigne"), E(l, 0.3), "ENSEIGNE", "gold", "ga_shop")
l = Li("La marque gagne"); T["mar_on"] = A(l, "marque"); Nt(A(l, "marque"), E(l, 0.3), "VISIBILITÉ · STOCK", "white", "ga_fac")
l = Li("Les plateformes"); T["plat_on"] = A(l, "plateformes"); Nt(A(l, "plateformes"), E(l, 0.3), "PAIEMENT · LIVRAISON", "blue", "ga_van")
l = Li("Et quand les prix"); T["ill_on"] = A(l, "illusion"); KWt(A(l, "illusion"), E(l, 0.3), "UNE ILLUSION DE GAIN", "red"); Nt(A(l, "illusion"), E(l, 0.3), "REMISE GONFLÉE", "red", "ga_ill")
l = Li("Salesforce note"); T["sf2_on"] = A(l, "hausses"); STt(A(l, "Salesforce"), A(l, "cette"), "SALESFORCE", "blue"); KWt(A(l, "hausses"), E(l, 0.3), "LES PRIX FREINENT LA DEMANDE", "red"); Nt(A(l, "moins"), E(l, 0.3), "MOINS D'ARTICLES", "red", "ga_dem")
l = Li("Ce détail dit"); KWt(A(l, "arbitre"), E(l, 0.3), "LE CONSOMMATEUR ARBITRE", "green")
# ---- CH11 : methode ----
l = Li("Une dernière limite"); T["lim11_on"] = A(l, "limite"); KWt(A(l, "limite"), E(l, 0.3), "UNE DERNIÈRE LIMITE", "red")
l = Li("Je n'ai pas trouvé de chiffre fiable"); STt(A(l, "fiable"), E(l, 0.2), "PAS DE DONNÉE FIABLE", "gold"); Nt(A(l, "marge"), E(l, 0.3), "MARGES RÉELLES", "red", "me_lim")
l = Li("Si quelqu'un"); KWt(A(l, "source"), E(l, 0.3), "SANS SOURCE : MÉFIANCE", "red")
l = Li("Voici maintenant"); KWt(A(l, "méthode"), E(l, 0.3), "LA MÉTHODE EN 4 RÉFLEXES", "green")
l = Li("Un : notez"); T["r1_on"] = A(l, "Un"); KWt(A(l, "notez"), E(l, 0.3), "1 · NOTEZ LE PRIX AVANT", "gold"); Nt(A(l, "comparateur"), E(l, 0.3), "HISTORIQUE DES PRIX", "blue", "me_1")
l = Li("Deux : comparez"); T["r2_on"] = A(l, "Deux"); KWt(A(l, "comparez"), E(l, 0.3), "2 · LE PRIX FINAL", "gold"); Nt(A(l, "final"), E(l, 0.3), "PAS LE POURCENTAGE", "red", "me_2")
l = Li("Trois : demandez"); T["r3_on"] = A(l, "Trois"); KWt(A(l, "demandez-vous"), E(l, 0.3), "3 · EN AVIEZ-VOUS BESOIN ?", "gold"); Nt(A(l, "promotion"), E(l, 0.3), "SANS LA PROMO ?", "gold", "me_3")
l = Li("Quatre : fixez"); T["r4_on"] = A(l, "Quatre"); KWt(A(l, "fixez"), E(l, 0.3), "4 · FIXEZ VOTRE BUDGET", "gold"); Nt(A(l, "budget"), E(l, 0.3), "AVANT D'OUVRIR LE SITE", "green", "me_4")
l = Li("La DGCCRF et l'UFC"); STt(A(l, "DGCCRF"), E(l, 0.2), "DGCCRF · UFC-QUE CHOISIR", "blue")
# ---- CH12 : cta ----
l = Li("En résumé"); T["sum_on"] = A(l, "résumé"); KWt(A(l, "arnaque"), E(l, 0.3), "NI ARNAQUE, NI CADEAU", "gold"); Nt(A(l, "résumé"), E(l, 0.3), "BILAN", "gold", "ct_coin")
l = Li("C'est une opération"); KWt(A(l, "connaître"), E(l, 0.3), "CONNAÎTRE LE MÉCANISME", "green")
l = Li("Et vous, avez-vous"); T["bubble_on"] = A(l, "vous"); KWt(A(l, "vérifié"), E(l, 0.3), "ET VOUS ?", "gold"); Nt(A(l, "vous"), E(l, 0.3), "COMMENTAIRE", "white", "bubble")
l = Li("Dites-le-moi"); KWt(s(l, 0.0), E(l, 0.3), "EN COMMENTAIRE", "gold")
l = Li("Abonnez-vous"); T["button_on"] = A(l, "Abonnez"); T["press"] = A(l, "Abonnez", 0, 0.6); T["brand"] = A(l, "Decrypt"); Nt(A(l, "Abonnez"), E(l, 0.3), "S'ABONNER", "red", "button")
B["cam"] = []; t = 0.0
while t <= DUR + 1e-6:
    p, l = cam(t); B["cam"].append([round(t, 3)] + [round(x, 3) for x in p + l]); t += 1 / 30
B["fov"] = 40
open("video/assets/beats.js", "w").write("window.BEATS=" + json.dumps(B, ensure_ascii=False) + ";")
json.dump(B, open("video/assets/beats.json", "w"), ensure_ascii=False)
print("dur", DUR, "cam keys", len(B["cam"]), "notes", len(B["notes"]), "kws", len(B["kws"]), "stamps", len(B["stamps"]))
