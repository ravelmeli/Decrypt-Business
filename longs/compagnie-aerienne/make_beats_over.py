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
T["hplane_on"] = wi(0, 0, 0.1); T["hcrowd_on"] = A(0, "centaines"); T["hcoin_on"] = A(1, "neuf"); T["hhalf_on"] = A(1, "quatre")
KWt(wi(0, 0), A(0, "Et"), "UNE COMPAGNIE AÉRIENNE", "gold"); KWt(A(0, "quelques"), E(0, 0.4), "QUELQUES DOLLARS", "red")
STt(A(1, "IATA"), A(1, "neuf"), "IATA · ASSOCIATION PRO", "blue"); KCt(A(1, "neuf"), A(1, "Pour"), "≈ 9 $ / PASSAGER", "green", 9, "≈ ", " $ / PASSAGER", 0.5); KCt(A(1, "quatre"), E(1, 0.3), "4,50 $ EN 2026", "red", 4.5, "", " $ EN 2026", 0.6, 1)
Nt(A(1, "neuf"), A(1, "quatre"), "2025", "blue", "hk_coin"); Nt(A(1, "quatre"), E(1, 0.3), "2026", "red", "hk_coin"); Nt(wi(2, 0), E(2, 0.3), "UN BILLET", "white", "hk_plane"); KWt(A(2, "centaines"), E(2, 0.4), "DES CENTAINES DE $", "gold")
KWt(A(3, "Où"), A(3, "Dans"), "OÙ PASSE LE RESTE ?", "gold"); KWt(A(3, "coûts"), E(3, 0.4), "COÛTS CACHÉS", "red")
# ---- CH2 ----
T["mb23_on"] = A(4, "vingt-trois"); T["mb41_on"] = A(5, "quarante"); T["mgrid_on"] = A(6, "cent", 1); T["mtwo_on"] = A(6, "reste")
STt(A(4, "juin"), A(4, "vingt-trois"), "IATA · JUIN 2026", "blue"); KCt(A(4, "vingt-trois"), A(4, "soit"), "≈ 23 MD $", "red", 23, "≈ ", " MD $", 0.6); KCt(A(4, "deux", 1), E(4, 0.4), "≈ 2 %", "gold", 2, "≈ ", " %", 0.5)
Nt(A(4, "vingt-trois"), E(4, 0.3), "JUIN 2026", "red", "mg_23"); KWt(A(5, "divisée"), A(5, "quelques"), "DIVISÉE PAR 2", "red"); KCt(A(5, "quarante"), E(5, 0.4), "41 MD $ AVANT", "blue", 41, "", " MD $ AVANT", 0.6); Nt(A(5, "quarante"), E(5, 0.3), "DÉC. 2025", "blue", "mg_41")
KWt(A(6, "marge"), A(6, "cela"), "2 % DE MARGE", "gold"); KWt(A(6, "reste"), E(6, 0.4), "IL EN RESTE 2", "red"); Nt(A(6, "reste"), E(6, 0.3), "2 SUR 100", "gold", "mg_two"); Nt(A(6, "cent", 1), A(6, "reste"), "100 € ENCAISSÉS", "white", "mg_grid")
KWt(A(7, "moyennes"), E(7, 0.4), "MOYENNES MONDIALES", "blue"); KWt(A(8, "où"), E(8, 0.4), "OÙ PART L'ARGENT ?", "gold")
# ---- CH3 ----
T["cfa_on"] = A(9, "vingt-cinq"); T["cfb_on"] = A(9, "trente"); T["cpump_on"] = A(9, "carburant"); T["chedge_on"] = A(12, "protègent")
KWt(A(9, "carburant"), A(9, "Selon"), "LE CARBURANT", "red"); STt(A(9, "IATA"), A(9, "vingt-cinq"), "IATA · COÛTS", "blue"); KCt(A(9, "vingt-cinq"), A(9, "Pour"), "25,4 %", "gold", 25.4, "", " %", 0.6, 1); KCt(A(9, "trente"), E(9, 0.4), "31,4 % EN 2026", "red", 31.4, "", " % EN 2026", 0.6, 1)
Nt(A(9, "vingt-cinq"), A(9, "Pour"), "2025", "blue", "fu_a"); Nt(A(9, "trente"), E(9, 0.3), "2026", "red", "fu_b")
KCt(A(10, "trois"), A(10, "soit"), "≈ 350 MD $", "red", 350, "≈ ", " MD $", 0.8); KCt(A(10, "quarante"), E(10, 0.4), "+ 40 %", "red", 40, "+ ", " %", 0.6); Nt(A(10, "facture"), E(10, 0.3), "FACTURE MONDIALE", "red", "fu_pump")
KWt(A(11, "pétrole"), A(11, "près"), "LE PÉTROLE BOUGE", "gold"); KWt(A(11, "tiers"), E(11, 0.4), "UN TIERS DES COÛTS", "red")
KWt(A(12, "protègent"), A(12, "achetant"), "SE PROTÉGER", "blue"); KWt(A(12, "couverture"), A(12, "Mais"), "LA COUVERTURE", "gold"); KWt(A(12, "jamais"), E(12, 0.4), "JAMAIS TOUT", "red"); Nt(A(12, "protègent"), E(12, 0.3), "COUVERTURE", "blue", "fu_hedge")
# ---- CH4 ----
T["ecrew_on"] = A(13, "équipes"); T["epie_on"] = A(14, "vingt-quatre"); T["eplane_on"] = A(15, "mécaniciens"); T["erest_on"] = A(16, "repos")
KWt(A(13, "équipes"), A(13, "Dans"), "LES ÉQUIPES", "gold"); STt(A(13, "IATA"), A(13, "sept"), "IATA · PRÉVISIONS", "blue"); KCt(A(13, "sept"), A(13, "dont"), "≈ 767 MD $", "blue", 767, "≈ ", " MD $", 0.8); KCt(A(13, "deux"), E(13, 0.4), "271 MD $ PERSONNEL", "gold", 271, "", " MD $ PERSONNEL", 0.8); Nt(A(13, "équipes"), E(13, 0.3), "ÉQUIPES", "gold", "eq_crew")
KCt(A(14, "vingt-quatre"), A(14, "d'après"), "≈ 24 %", "gold", 24, "≈ ", " %", 0.6); STt(A(14, "d'après"), E(14, 0.1), "NOS CALCULS", "gold"); Nt(A(14, "vingt-quatre"), E(14, 0.3), "≈ 24 % DES COÛTS", "gold", "eq_pie")
KWt(A(15, "pilotes"), A(15, "cabine"), "PILOTES ET CABINE", "blue"); KWt(A(15, "mécaniciens"), A(15, "formation"), "MÉCANICIENS ET SOL", "green"); KWt(A(15, "formation"), E(15, 0.4), "FORMATION", "gold"); Nt(A(15, "mécaniciens"), E(15, 0.3), "MAINTENANCE", "green", "eq_plane")
KWt(A(16, "repos"), A(16, "réglementés"), "TEMPS DE REPOS", "blue"); KWt(A(16, "réglementés"), A(16, "équipage"), "RÉGLEMENTÉS", "gold"); KWt(A(16, "sol"), E(16, 0.4), "AVION AU SOL", "red"); Nt(A(16, "repos"), E(16, 0.3), "REPOS OBLIGATOIRE", "blue", "eq_clock")
# ---- CH5 ----
T["aplane_on"] = A(17, "avion"); T["atag_on"] = A(17, "prix"); T["adisc_on"] = A(18, "quarante"); T["asecret_on"] = A(20, "confidentielles")
KWt(A(17, "avion"), A(17, "Un"), "L'AVION", "gold"); KCt(A(17, "cent"), A(17, "selon"), "≈ 107 M$", "gold", 107, "≈ ", " M$", 0.8); STt(A(17, "selon"), E(17, 0.1), "AIRBUS · MOYENNE 2016", "blue"); Nt(A(17, "prix"), E(17, 0.3), "PRIX CATALOGUE", "gold", "av_tag")
KWt(A(18, "publie"), A(18, "Mais"), "PRIX NON PUBLIÉS", "red"); STt(A(18, "estimations"), A(18, "quarante"), "ESTIMATIONS D'INDUSTRIE", "gold"); KWt(A(18, "quarante"), E(18, 0.4), "- 40 À 50 % DE REMISE", "red"); Nt(A(18, "quarante"), E(18, 0.3), "REMISE", "red", "av_disc")
KCt(A(19, "quarante"), A(19, "une"), "≈ 40 M$", "gold", 40, "≈ ", " M$", 0.6); STt(A(19, "analystes"), A(19, "American"), "ESTIMATION D'ANALYSTES", "gold"); KWt(A(19, "confirmée"), E(19, 0.4), "NON CONFIRMÉ", "red")
KWt(A(20, "confidentielles"), A(20, "le"), "REMISES CONFIDENTIELLES", "red"); KWt(A(20, "secrets"), E(20, 0.4), "UN SECRET BIEN GARDÉ", "gold"); Nt(A(20, "confidentielles"), E(20, 0.3), "CONFIDENTIEL", "red", "av_case")
# ---- CH6 ----
T["lfleet_on"] = wi(21, 0); T["llease_on"] = A(21, "louée"); T["lrent_on"] = A(22, "loyer"); T["lslb_on"] = A(23, "vend")
KWt(A(21, "achète-t-elle"), A(21, "Pas"), "ACHETER ?", "gold"); STt(A(21, "sources"), A(21, "entre"), "IATA · CIRIUM · CAPA", "blue"); KWt(A(21, "entre"), A(21, "flotte"), "50 À 58 %", "gold"); KWt(A(21, "louée"), E(21, 0.4), "FLOTTE LOUÉE", "blue"); Nt(A(21, "achète-t-elle"), A(21, "Pas"), "POSSÉDÉS", "gold", "lo_own"); Nt(A(21, "louée"), E(21, 0.3), "LOUÉS", "blue", "lo_lease")
KWt(A(22, "Louer"), A(22, "Mais"), "PAS D'UN COUP", "green"); KWt(A(22, "fixe"), A(22, "tombe"), "COÛT FIXE", "red"); KWt(A(22, "cloué"), E(22, 0.4), "CLOUÉ AU SOL", "red"); Nt(A(22, "loyer"), E(22, 0.3), "LOYER MENSUEL", "gold", "lo_rent")
KWt(A(23, "cession-bail"), A(23, "vend"), "CESSION-BAIL", "gold"); KWt(A(23, "trésorerie"), A(23, "mais"), "CASH IMMÉDIAT", "green"); KWt(A(23, "payer"), E(23, 0.4), "PAYER DES ANNÉES", "red"); Nt(A(23, "vend"), E(23, 0.3), "BAILLEUR", "gold", "lo_lessor")
KWt(A(24, "coût"), A(24, "l'avion"), "PREMIER COÛT CACHÉ", "red"); KWt(A(24, "charge"), E(24, 0.4), "UNE CHARGE PERMANENTE", "red")
# ---- CH7 ----
T["thangar_on"] = wi(25, 0); T["teng_on"] = A(25, "maintenance"); T["t11_on"] = A(25, "onze"); T["t14_on"] = A(25, "quatorze"); T["tground_on"] = A(27, "immobilisé")
KWt(A(25, "entretenir"), A(25, "Selon"), "IL FAUT ENTRETENIR", "gold"); KWt(A(25, "entre"), A(25, "coûts"), "10 À 15 %", "gold"); STt(A(25, "présentation"), A(25, "parle"), "IATA · 2024", "blue"); KWt(A(25, "onze"), A(25, "quatorze"), "11 %", "blue"); KWt(A(25, "quatorze"), E(25, 0.4), "14 % EN 2023", "red")
Nt(A(25, "onze"), A(25, "quatorze"), "2019", "blue", "mt_11"); Nt(A(25, "quatorze"), E(25, 0.3), "2023", "red", "mt_14")
KWt(A(26, "vieillissante"), A(26, "des"), "FLOTTE VIEILLISSANTE", "red"); KWt(A(26, "pièces"), A(26, "et"), "PIÈCES RARES", "gold"); KWt(A(26, "moteurs"), E(26, 0.4), "MOTEURS EN ATELIER", "red"); Nt(A(26, "moteurs"), E(26, 0.3), "MOTEUR", "white", "mt_eng")
KWt(A(27, "immobilisé"), A(27, "pour"), "IMMOBILISÉ", "red"); KWt(A(27, "rapporte"), A(27, "Mais"), "ZÉRO RECETTE", "red"); KWt(A(27, "coûte"), E(27, 0.4), "MAIS ÇA COÛTE", "red"); Nt(A(27, "immobilisé"), E(27, 0.3), "AU SOL", "red", "mt_plane")
KWt(A(28, "coûts"), A(28, "un"), "COÛTS FIXES", "gold"); KWt(A(28, "perd"), E(28, 0.4), "PERD DE L'ARGENT", "red")
# ---- CH8 ----
T["pterm_on"] = A(29, "infrastructure"); T["ptower_on"] = A(29, "navigation"); T["pfees_on"] = A(29, "Redevances"); T["ptax_on"] = A(31, "taxes")
KWt(A(29, "chaque"), A(29, "aussi"), "À CHAQUE VOL", "gold"); KWt(A(29, "Redevances"), A(29, "d'atterrissage"), "REDEVANCES", "red"); KWt(A(29, "d'atterrissage"), A(29, "navigation"), "ATTERRISSAGE", "blue"); KWt(A(29, "navigation"), A(29, "traitement"), "NAVIGATION AÉRIENNE", "blue"); KWt(A(29, "traitement"), E(29, 0.4), "TRAITEMENT PASSAGERS", "blue"); Nt(A(29, "aéroport"), E(29, 0.3), "CHAQUE AÉROPORT FACTURE", "gold", "ap_term")
KWt(A(30, "chiffre"), A(30, "sur"), "AUCUN CHIFFRE FIABLE", "red"); KWt(A(30, "varient"), A(30, "d'un"), "VARIE SELON LES PAYS", "gold"); KWt(A(30, "rotation"), E(30, 0.4), "À CHAQUE ROTATION", "gold"); Nt(A(30, "redevances"), E(30, 0.3), "REDEVANCES", "gold", "ap_fee")
KWt(A(31, "taxes"), A(31, "une"), "LES TAXES", "red"); KWt(A(31, "collectée"), A(31, "par"), "COLLECTÉES", "gold"); KWt(A(31, "appartient"), E(31, 0.4), "NE LUI APPARTIENT PAS", "red"); Nt(A(31, "États"), E(31, 0.3), "POUR L'ÉTAT", "red", "ap_state")
KWt(A(32, "bas"), A(32, "peut"), "BILLET À BAS PRIX", "gold"); KWt(A(32, "rigide"), A(32, "une", 1), "COÛTS RIGIDES", "red"); KWt(A(32, "aussitôt"), E(32, 0.4), "ÇA REPART AUSSITÔT", "red")
# ---- CH9 ----
T["rboard_on"] = wi(33, 0); T["rcomp_on"] = A(33, "indemnisation"); T["rhotel_on"] = A(34, "repas"); T["rdom_on"] = A(35, "perturbation"); T["rdom_fall"] = A(35, "équipage")
KWt(A(33, "Autre"), A(33, "quand"), "AUTRE COÛT CACHÉ", "red"); STt(A(33, "règlement"), A(33, "prévoit"), "RÈGLEMENT EUROPÉEN", "blue"); KWt(A(33, "deux"), A(33, "selon"), "250 À 600 €", "gold"); KWt(A(33, "annulation"), A(33, "sauf"), "ANNULATION OU RETARD", "red"); Nt(A(33, "indemnisation"), E(33, 0.3), "INDEMNISATION", "gold", "rt_eu")
KWt(A(34, "repas"), A(34, "hôtels"), "REPAS", "gold"); KWt(A(34, "hôtels"), A(34, "réacheminement"), "HÔTELS", "gold"); KWt(A(34, "réacheminement"), E(34, 0.4), "RÉACHEMINEMENT", "blue"); Nt(A(34, "repas"), E(34, 0.3), "REPAS ET HÔTELS", "gold", "rt_bag")
KWt(A(35, "perturbation"), A(35, "un"), "LA PERTURBATION", "red"); KWt(A(35, "équipage"), A(35, "un", 1), "ÉQUIPAGE MAL PLACÉ", "gold"); KWt(A(35, "saute"), E(35, 0.4), "LA ROTATION SAUTE", "red"); Nt(A(35, "perturbation"), E(35, 0.3), "EFFET DOMINO", "red", "rt_dom")
KWt(A(36, "jamais"), A(36, "c'est"), "JAMAIS ISOLÉ", "red"); KWt(A(36, "chaîne"), A(36, "qui"), "CHAÎNE DE COÛTS", "red"); KWt(A(36, "journée"), E(36, 0.4), "TOUTE LA JOURNÉE", "gold")
# ---- CH10 ----
T["sdrum_on"] = s(37, 0.4); T["s1_on"] = A(38, "kérosène"); T["s31_on"] = A(38, "trois"); T["s42_on"] = A(38, "quatre")
KWt(A(37, "transition"), A(37, "En"), "LA TRANSITION", "green"); STt(A(37, "ReFuelEU"), A(37, "impose"), "RÈGLEMENT REFUELEU", "blue"); KWt(A(37, "SAF"), A(37, "dans"), "SAF", "green"); KWt(A(37, "deux"), A(37, "dès"), "2 % EN 2025", "gold"); Nt(A(37, "SAF"), E(37, 0.3), "CARBURANT DURABLE", "green", "sf_drum")
KWt(A(38, "problème"), A(38, "Selon"), "LE PRIX", "red"); STt(A(38, "IATA"), A(38, "trois"), "IATA · SAF", "blue"); KCt(A(38, "trois"), A(38, "plus"), "3,1 ×", "gold", 3.1, "", " ×", 0.6, 1); KCt(A(38, "quatre"), E(38, 0.4), "4,2 × EN 2025", "red", 4.2, "", " × EN 2025", 0.6, 1)
Nt(A(38, "kérosène"), A(38, "trois"), "KÉROSÈNE ×1", "white", "sf_1"); Nt(A(38, "trois"), E(38, 0.3), "2024 : ×3,1", "gold", "sf_31"); Nt(A(38, "quatre"), E(38, 0.3), "2025 : ×4,2", "red", "sf_42")
KCt(A(39, "zéro"), A(39, "mais"), "0,6 % DU CARBURANT", "green", 0.6, "", " % DU CARBURANT", 0.6, 1); KCt(A(39, "trois"), A(39, "facture"), "≈ 3,6 MD $", "red", 3.6, "≈ ", " MD $", 0.7, 1); STt(A(39, "toujours"), E(39, 0.1), "IATA", "blue")
KWt(A(40, "début"), E(40, 0.4), "CE N'EST QU'UN DÉBUT", "gold")
# ---- CH11 ----
T["fseats_on"] = wi(41, 0); T["fempty_on"] = A(43, "six")
KWt(A(41, "fixes"), A(41, "L'avion"), "COÛTS FIXES", "red"); KWt(A(41, "occupé"), E(41, 0.4), "OCCUPÉ OU NON", "gold")
KWt(A(42, "remplissage"), A(42, "est"), "TAUX DE REMPLISSAGE", "gold"); KWt(A(42, "record"), A(42, "quatre-vingt-trois"), "RECORD", "gold"); KCt(A(42, "quatre-vingt-trois"), A(42, "selon"), "83,6 %", "green", 83.6, "", " %", 0.7, 1); STt(A(42, "selon"), A(42, "qui"), "IATA", "blue"); KCt(A(42, "quatre-vingt-quatre"), E(42, 0.4), "84 % EN 2026", "blue", 84, "", " % EN 2026", 0.6); Nt(A(42, "quatre-vingt-trois"), A(42, "selon"), "83,6 % REMPLIS", "green", "rp_full")
KWt(A(43, "siège"), A(43, "sur"), "UN SIÈGE", "white"); KWt(A(43, "six"), A(43, "Et"), "SUR SIX VIDE", "red"); KWt(A(43, "rapporte"), A(43, "alors"), "ZÉRO RECETTE", "red"); KWt(A(43, "presque"), E(43, 0.4), "MÊME COÛT", "gold"); Nt(A(43, "six"), E(43, 0.3), "SIÈGE VIDE", "red", "rp_empty")
KWt(A(44, "point"), A(44, "c'est"), "LE POINT MORT", "gold"); KWt(A(44, "chiffre"), A(44, "mais"), "PAS DE CHIFFRE FIABLE", "red"); KWt(A(44, "proche"), E(44, 0.4), "POINT MORT PROCHE", "red")
# ---- CH12 ----
T["nbag_on"] = A(45, "vendant"); T["ntower_on"] = A(45, "cent"); T["nseat_on"] = A(47, "siège"); T["nmeal_on"] = A(47, "repas"); T["nfr_on"] = A(48, "Frontier")
KWt(A(45, "compensent-elles"), A(45, "En"), "COMMENT COMPENSER ?", "gold"); KWt(A(45, "vendant"), A(45, "Selon"), "VENDRE AUTRE CHOSE", "gold"); STt(A(45, "IdeaWorksCompany"), A(45, "cent"), "IDEAWORKSCOMPANY", "blue"); KCt(A(45, "cent"), E(45, 0.4), "≈ 148 MD $", "green", 148, "≈ ", " MD $", 0.8); Nt(A(45, "cent"), E(45, 0.3), "REVENUS ANNEXES", "green", "an_tower"); Nt(A(45, "vendant"), A(45, "Selon"), "BAGAGES", "gold", "an_bag")
KCt(A(46, "trente-cinq"), A(46, "et"), "≈ 35 $ / PASSAGER", "gold", 35, "≈ ", " $ / PASSAGER", 0.6); KCt(A(46, "quinze"), A(46, "d'après"), "≈ 15 % DU CA", "green", 15, "≈ ", " % DU CA", 0.6); STt(A(46, "source"), E(46, 0.1), "SOURCE SECONDAIRE", "gold")
KWt(A(47, "Bagages"), A(47, "choix"), "BAGAGES", "gold"); KWt(A(47, "siège"), A(47, "repas"), "SIÈGE", "blue"); KWt(A(47, "repas"), A(47, "embarquement"), "REPAS", "green"); KWt(A(47, "appel"), A(47, "et"), "PRIX D'APPEL", "gold"); KWt(A(47, "options"), E(47, 0.4), "LES OPTIONS FONT LA MARGE", "green")
KWt(A(48, "Frontier"), A(48, "une"), "FRONTIER", "gold"); KCt(A(48, "soixante"), E(48, 0.4), "> 60 % DU CA", "green", 60, "> ", " % DU CA", 0.7); Nt(A(48, "Frontier"), E(48, 0.3), "FRONTIER", "gold", "an_fr")
# ---- CH13 ----
T["dcard_on"] = A(49, "fidélité"); T["dbank_on"] = A(50, "banque"); T["dmiles_on"] = A(50, "achète"); T["dplane_on"] = A(50, "compagnie")
KWt(A(49, "fidélité"), A(49, "Les"), "LA FIDÉLITÉ", "gold"); STt(A(49, "cinq"), A(49, "vingt-huit"), "5 GRANDES COMPAGNIES US", "blue"); KCt(A(49, "vingt-huit"), A(49, "principalement"), "≈ 28 MD $", "green", 28, "≈ ", " MD $", 0.7); KWt(A(49, "cartes"), E(49, 0.4), "CARTES CO-MARQUÉES", "gold"); Nt(A(49, "cartes"), E(49, 0.3), "CARTE BANCAIRE", "gold", "fd_card")
KWt(A(50, "banque"), A(50, "achète"), "UNE BANQUE", "blue"); KWt(A(50, "achète"), A(50, "des"), "ACHÈTE", "gold"); KWt(A(50, "distribue"), E(50, 0.4), "LES DISTRIBUE", "green"); Nt(A(50, "banque"), A(50, "achète"), "BANQUE", "blue", "fd_bank"); Nt(A(50, "milles"), E(50, 0.3), "MILLES", "gold", "fd_miles")
KWt(A(51, "récurrent"), A(51, "qui"), "REVENU RÉCURRENT", "green"); KWt(A(51, "taux"), E(51, 0.4), "NI LE REMPLISSAGE", "blue"); Nt(A(51, "récurrent"), E(51, 0.3), "REVENU STABLE", "green", "fd_plane")
KWt(A(52, "raisons"), A(52, "ces"), "UNE RAISON", "gold"); KWt(A(52, "stratégiques"), E(52, 0.4), "PROGRAMMES STRATÉGIQUES", "gold")
# ---- CH14 ----
T["kassets_on"] = A(53, "immobilise"); T["kroic_on"] = A(54, "quatre"); T["kwacc_on"] = A(54, "huit"); T["kgap_on"] = A(54, "nettement")
KWt(A(53, "capital"), A(53, "Une"), "LE CAPITAL", "gold"); KWt(A(53, "immobilise"), A(53, "énormément"), "IMMOBILISE", "red"); KWt(A(53, "rendement"), E(53, 0.4), "LE RENDEMENT DU CAPITAL", "blue"); Nt(A(53, "immobilise"), E(53, 0.3), "ACTIFS", "white", "ck_assets")
STt(A(54, "décembre"), A(54, "IATA"), "IATA · DÉC. 2025", "blue"); KCt(A(54, "quatre"), A(54, "nettement"), "4,3 %", "green", 4.3, "", " %", 0.6, 1); KWt(A(54, "nettement"), A(54, "estimé"), "NETTEMENT SOUS", "red"); KCt(A(54, "huit"), A(54, "Ces"), "8,5 %", "red", 8.5, "", " %", 0.6, 1); KWt(A(54, "revues"), E(54, 0.4), "REVUES À LA BAISSE", "gold")
Nt(A(54, "quatre"), A(54, "nettement"), "RENDEMENT", "green", "ck_roic"); Nt(A(54, "huit"), A(54, "Ces"), "COÛT DU CAPITAL", "red", "ck_wacc")
KWt(A(55, "gagne"), A(55, "que"), "GAGNE MOINS", "red"); KWt(A(55, "coûte"), E(55, 0.4), "COÛT DE L'ARGENT", "red"); Nt(A(55, "gagne"), E(55, 0.3), "ÉCART", "red", "ck_gap")
KWt(A(56, "pleine"), A(56, "ponctuelle"), "PLEINE", "green"); KWt(A(56, "ponctuelle"), A(56, "bénéficiaire"), "PONCTUELLE", "green"); KWt(A(56, "bénéficiaire"), A(56, "malgré"), "BÉNÉFICIAIRE", "green"); KWt(A(56, "décevoir"), E(56, 0.4), "DÉCEVOIR LES INVESTISSEURS", "red")
# ---- CH15 ----
T["vwave_on"] = wi(57, 0); T["vfix_on"] = A(57, "coûts"); T["vlev1_on"] = A(59, "remplir"); T["vlev2_on"] = A(59, "vendre"); T["vlev3_on"] = A(59, "fidéliser"); T["bubble_on"] = A(61, "quel"); T["button_on"] = A(61, "abonnez-vous"); T["press"] = A(61, "Decrypt")
KWt(A(57, "point"), A(57, "Une"), "FAISONS LE POINT", "gold"); KWt(A(57, "coûts"), A(57, "un"), "COÛTS FIXES", "red"); KWt(A(57, "avant"), E(57, 0.4), "AVANT LE 1ER SIÈGE", "red"); Nt(A(57, "coûts"), E(57, 0.3), "COÛTS FIXES", "red", "vd_weight")
KWt(A(58, "dépendent"), A(58, "Une"), "REVENUS FRAGILES", "gold"); KWt(A(58, "marge"), A(58, "laisse"), "MARGE DE 2 %", "red"); KWt(A(58, "erreurs"), E(58, 0.4), "PEU DE PLACE AUX ERREURS", "red"); Nt(A(58, "remplissage"), E(58, 0.3), "REMPLISSAGE", "blue", "vd_wave")
KWt(A(59, "trois"), A(59, "remplir"), "3 LEVIERS", "gold"); KWt(A(59, "remplir"), A(59, "vendre"), "REMPLIR", "green"); KWt(A(59, "vendre"), A(59, "fidéliser"), "VENDRE DES OPTIONS", "green"); KWt(A(59, "fidéliser"), E(59, 0.4), "FIDÉLISER", "green")
Nt(T["vlev1_on"], T["vlev2_on"], "REMPLIR", "green", "vd_l1"); Nt(T["vlev2_on"], T["vlev3_on"], "OPTIONS", "gold", "vd_l2"); Nt(T["vlev3_on"], E(59, 0.3), "FIDÉLITÉ", "blue", "vd_l3")
KWt(A(60, "billet"), A(60, "n'est"), "LE BILLET", "gold"); KWt(A(60, "partie"), A(60, "d'un"), "LA PARTIE VISIBLE", "gold"); KWt(A(60, "équilibre"), E(60, 0.4), "ÉQUILIBRE FRAGILE", "red")
Nt(A(61, "quel"), A(61, "Et"), "QUEL COÛT ?", "gold", "bubble"); KWt(wi(61, 0), A(61, "Et"), "COMMENTEZ", "gold"); KWt(A(61, "abonnez-vous"), E(61, 0.4), "ABONNEZ-VOUS", "red")
T["brand"] = e(61, -0.9); T["whoosh"] = -100
# no collisions: trim keywords / stamps to the next one, and notes sharing an anchor
def trim(lst, key=None):
    lst.sort(key=lambda d: d["t0"])
    for a, b in zip(lst, lst[1:]):
        if a["t1"] > b["t0"] - 0.03: a["t1"] = max(a["t0"] + 0.45, round(b["t0"] - 0.03, 2))
trim(B["kws"]); trim(B["stamps"])
byA = {}
for n_ in B["notes"]: byA.setdefault((n_["anchor"], n_["dx"], n_["dy"]), []).append(n_)
for v in byA.values(): trim(v)
