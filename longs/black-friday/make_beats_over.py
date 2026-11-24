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
KWt(0.1, e(0, 0.1), "EXPLOITER UN CAFÉ", "gold"); T["coin_on"] = wi(1, 0)
KCt(A(0, "deux"), A(0, "qui"), "2,50 €", "green", 2.5, "", " €", 0.5, 2); KCt(A(0, "quinze"), E(0, 0.3), "≈ 15 CT DE CAFÉ", "red", 15, "≈ ", " CT DE CAFÉ", 0.5); Nt(A(0, "tasse"), A(0, "qui"), "UNE TASSE", "white", "sh_ship")
KWt(A(1, "meilleure"), E(1, 0.3), "LA MEILLEURE MARGE", "green"); Nt(wi(1, 0), E(1, 0.3), "MARGE", "gold", "sh_coin")
STt(A(2, "GHR"), A(2, "dix"), "OBSERVATOIRE GHR", "blue"); KCt(A(2, "dix"), E(2, 0.3), "≈ + 10 % DE DÉFAILLANCES", "red", 10, "≈ + ", " % DE DÉFAILLANCES", 0.5)
KWt(A(3, "passe"), E(3, 0.4), "OÙ PASSE L'ARGENT ?", "gold"); KWt(A(4, "marge"), E(4, 0.4), "MARGE ≠ BÉNÉFICE", "red"); KWt(A(5, "simulation"), E(5, 0.4), "LA SIMULATION CHIFFRÉE", "gold")
# ---- CH2 ----
T["fleet_on"] = wi(6, 0); T["pax_on"] = A(7, "trois"); T["tower_on"] = A(9, "baisse")
STt(A(6, "INSEE"), A(6, "environ"), "INSEE · SOURCE OFFICIELLE", "blue"); KCt(A(6, "trente-cinq"), A(6, "en"), "≈ 35 000 CAFÉS ET BARS", "blue", 35000, "≈ ", " CAFÉS ET BARS", 0.7); KWt(A(6, "cinq"), E(6, 0.3), "5 POUR 10 000 HABITANTS", "gold"); Nt(A(6, "trente-cinq"), E(6, 0.3), "ÉTABLISSEMENTS", "white", "mk_fleet")
KCt(A(7, "trois"), E(7, 0.4), "> 75 % DES COMMUNES RURALES SANS CAFÉ", "red", 75, "> ", " % DES COMMUNES RURALES SANS CAFÉ", 0.7); Nt(A(7, "communes"), E(7, 0.3), "COMMUNES RURALES", "white", "mk_pax")
KWt(A(8, "lieu"), A(8, "mais"), "UN LIEU DE VIE", "green"); KWt(A(8, "fragile"), E(8, 0.4), "UNE ACTIVITÉ FRAGILE", "red")
STt(A(9, "selon"), E(9, 0.2), "OBSERVATOIRE GHR", "blue"); KCt(A(9, "six"), E(9, 0.4), "− 6 % DE CA EN 2024", "red", 6, "− ", " % DE CA EN 2024", 0.5); Nt(A(9, "baisse"), E(9, 0.3), "CHIFFRE D'AFFAIRES ↓", "red", "mk_tower")
KWt(A(10, "réduit"), E(10, 0.4), "UN SECTEUR QUI SE RÉDUIT", "gold"); KWt(A(11, "concurrents"), A(11, "mais"), "MOINS DE CONCURRENTS", "green"); KWt(A(11, "clients"), E(11, 0.4), "MOINS DE CLIENTS", "red"); KWt(A(12, "partage"), E(12, 0.4), "LE MARCHÉ SE PARTAGE", "gold")
# ---- CH3 ----
T["wish_on"] = A(14, "sept"); T["icon_on"] = A(17, "sucre"); T["msc_on"] = A(17, "vingt"); T["avg_on"] = A(18, "ordres")
KWt(A(13, "expresso"), E(13, 0.3), "L'EXPRESSO", "gold"); KCt(A(14, "sept"), E(14, 0.3), "7 G DE CAFÉ", "blue", 7, "", " G DE CAFÉ", 0.5); Nt(A(14, "sept"), E(14, 0.3), "GRAINS", "white", "ct_wish")
KWt(A(15, "douze"), E(15, 0.3), "12 À 18 € / KG EN GROS", "gold"); KCt(A(16, "huit"), E(16, 0.3), "8 À 13 CENTIMES", "green", 8, "", " À 13 CENTIMES", 0.6)
KWt(A(17, "sucre"), A(17, "on"), "SUCRE · EAU · ÉLECTRICITÉ", "blue"); Nt(A(17, "sucre"), A(17, "on"), "EXTRAS", "white", "ct_icon"); KCt(A(17, "vingt"), E(17, 0.3), "20 À 30 CENTIMES", "red", 20, "", " À 30 CENTIMES", 0.6); Nt(A(17, "vingt"), E(17, 0.3), "COÛT TOTAL", "red", "ct_msc")
STt(A(18, "guides"), E(18, 0.2), "GUIDES DE GESTION · INDICATIF", "gold"); Nt(A(18, "ordres"), E(18, 0.3), "ORDRES DE GRANDEUR", "white", "ct_avg")
KWt(A(19, "plus"), E(19, 0.4), "LE CAFÉ : LA PLUS PETITE PART", "red"); KWt(A(20, "place"), E(20, 0.4), "ON ACHÈTE UNE PLACE", "green")
# ---- CH4 ----
T["tc_on"] = A(21, "expresso"); T["bb_on"] = A(24, "TVA"); T["crew_b"] = A(25, "hors")
KCt(A(21, "deux"), A(21, "et"), "2,50 À 3 €", "green", 2.5, "", " À 3 €", 0.5, 2); Nt(A(21, "expresso"), E(21, 0.3), "PRIX AU COMPTOIR", "white", "af_tc"); STt(A(22, "Aucun"), E(22, 0.2), "PAS DE CHIFFRE OFFICIEL", "gold")
KWt(A(23, "comprises"), E(23, 0.4), "TOUTES TAXES COMPRISES", "red"); KCt(A(24, "dix"), E(24, 0.4), "TVA 10 %", "red", 10, "TVA ", " %", 0.5); Nt(A(24, "TVA"), E(24, 0.3), "TVA", "red", "af_bb"); STt(A(24, "vérifier"), E(24, 0.2), "À VÉRIFIER", "gold")
KCt(A(25, "vingt-sept"), E(25, 0.3), "2,27 € HT", "green", 2.27, "", " € HT", 0.6, 2); Nt(A(25, "hors"), E(25, 0.3), "HORS TAXES", "green", "af_crew")
KWt(A(26, "État"), E(26, 0.4), "LE RESTE PART À L'ÉTAT", "red"); KWt(A(27, "net"), E(27, 0.4), "PAS UN PRIX NET", "red"); KWt(A(28, "ticket"), E(28, 0.4), "UN PRIX DE TICKET", "gold"); KWt(A(29, "flatteuse"), E(29, 0.4), "IMAGE TROP FLATTEUSE", "red")
# ---- CH5 ----
T["cal_on"] = A(30, "Deux"); T["coin5_on"] = A(30, "vingt-cinq"); T["floor_on"] = A(30, "reste"); T["pie5_on"] = A(32, "soixante-cinq")
KCt(A(30, "Deux"), A(30, "moins"), "2,27 €", "blue", 2.27, "", " €", 0.5, 2); KCt(A(30, "vingt-cinq"), A(30, "il"), "− 25 CT", "red", 25, "− ", " CT", 0.5)
Nt(A(30, "Deux"), A(30, "moins"), "PRIX HT", "blue", "ly_cal"); Nt(A(30, "vingt-cinq"), A(30, "il"), "MATIÈRE", "red", "ly_coin"); Nt(A(30, "reste"), E(30, 0.3), "MARGE", "green", "ly_floor")
KCt(A(30, "quatre-vingt-dix"), E(30, 0.4), "≈ 90 % DE MARGE BRUTE", "green", 90, "≈ ", " % DE MARGE BRUTE", 0.6); KWt(A(31, "partout"), E(31, 0.4), "LE CHIFFRE VU PARTOUT", "gold")
KCt(A(32, "soixante-cinq"), E(32, 0.4), "65 À 75 % EN MOYENNE", "gold", 65, "", " À 75 % EN MOYENNE", 0.6); Nt(A(32, "soixante-cinq"), E(32, 0.3), "MARGE MOYENNE", "white", "ly_pie"); STt(A(32, "guides"), E(32, 0.2), "GUIDES DU SECTEUR · INDICATIF", "gold")
KWt(A(33, "surtout"), E(33, 0.4), "NI LOYER, NI SALAIRES", "red"); KWt(A(34, "bénéfice"), E(34, 0.4), "RIEN SUR LE BÉNÉFICE", "red"); KWt(A(35, "résultats"), E(35, 0.4), "MÊME MARGE, AUTRES RÉSULTATS", "gold"); KWt(A(36, "volume"), E(36, 0.4), "LE VOLUME FAIT LA DIFFÉRENCE", "green")
# ---- CH6 ----
T["sal6"] = A(38, "quatre"); T["fuel6"] = A(39, "deux"); T["food6"] = A(40, "moins"); T["pie6_on"] = A(40, "quinze")
KWt(A(37, "bruit"), E(37, 0.4), "BEAUCOUP DE BRUIT", "gold"); STt(A(38, "Organisation"), E(38, 0.2), "ORG. INTERNATIONALE DU CAFÉ", "blue"); KCt(A(38, "quatre"), E(38, 0.3), "RECORD · 442 CENTS/LB", "red", 442, "RECORD · ", " CENTS/LB", 0.7); Nt(A(38, "record"), E(38, 0.3), "FÉVRIER 2025", "white", "cs_sal")
KCt(A(39, "deux"), A(39, "presque"), "250 CENTS/LB", "blue", 250, "", " CENTS/LB", 0.7); KWt(A(39, "presque"), E(39, 0.4), "PRESQUE DEUX FOIS MOINS", "green"); Nt(A(39, "juin"), E(39, 0.3), "JUIN 2026", "white", "cs_fuel")
KWt(A(40, "limité"), A(40, "quinze"), "EFFET LIMITÉ", "gold"); KCt(A(40, "quinze"), E(40, 0.4), "< 15 CT SUR UNE TASSE", "green", 15, "< ", " CT SUR UNE TASSE", 0.6); Nt(A(40, "quinze"), E(40, 0.3), "PART DU CAFÉ", "white", "cs_pie")
KWt(A(41, "doublé"), E(41, 0.4), "PRIX DOUBLÉ = + 10 CT", "gold"); KWt(A(42, "ailleurs"), E(42, 0.4), "LE VRAI POIDS EST AILLEURS", "red"); KWt(A(43, "jamais"), E(43, 0.4), "LA TASSE NE BAISSE JAMAIS", "red"); KWt(A(44, "reconstituer"), E(44, 0.4), "MARGE RECONSTITUÉE", "gold")
# ---- CH7 ----
T["crew7_on"] = A(46, "servir"); T["fuel7_on"] = A(47, "vingt-cinq"); T["food7_on"] = A(49, "patron")
KWt(A(45, "tôt"), E(45, 0.3), "OUVERT TÔT, FERMÉ TARD", "gold"); KWt(A(46, "six"), E(46, 0.4), "6 JOURS SUR 7", "blue"); Nt(A(46, "servir"), E(46, 0.3), "ÉQUIPE", "white", "eq_crew")
KCt(A(47, "vingt-cinq"), E(47, 0.4), "25 À 40 % DU CA", "blue", 25, "", " À 40 % DU CA", 0.6); Nt(A(47, "masse"), E(47, 0.3), "MASSE SALARIALE", "blue", "eq_fuel"); STt(A(48, "américains"), E(48, 0.2), "REPÈRES AMÉRICAINS · INDICATIF", "gold")
KWt(A(49, "heures"), E(49, 0.4), "LE PATRON PAIE EN HEURES", "gold"); Nt(A(49, "patron"), E(49, 0.3), "PATRON", "white", "eq_food"); KWt(A(50, "rigide"), E(50, 0.4), "UN COÛT RIGIDE", "red"); KWt(A(51, "vide"), E(51, 0.4), "SALLE VIDE, SALAIRE PAYÉ", "red"); KWt(A(52, "horaires"), E(52, 0.4), "PAYÉ AUX HORAIRES PRÉVUS", "gold")
# ---- CH8 ----
T["tk_on"] = A(54, "loyer"); T["ob_on"] = A(56, "énergie"); T["gauge_on"] = A(54, "huit")
KWt(A(53, "local"), E(53, 0.3), "DEUXIÈME BLOC : LE LOCAL", "gold"); KCt(A(54, "huit"), E(54, 0.4), "LOYER : 8 À 15 % DU CA", "gold", 8, "LOYER : ", " À 15 % DU CA", 0.6); Nt(A(54, "loyer"), E(54, 0.3), "LOYER", "gold", "rc_tk"); Nt(A(54, "huit"), E(54, 0.3), "PART DU CA", "white", "rc_gauge")
KWt(A(55, "emplacement"), E(55, 0.4), "UN BON EMPLACEMENT COÛTE CHER", "gold"); KWt(A(56, "énergie"), E(56, 0.4), "ÉNERGIE · MACHINE · ASSURANCE...", "blue"); Nt(A(56, "énergie"), E(56, 0.3), "CHARGES", "blue", "rc_ob")
KWt(A(57, "mois"), E(57, 0.4), "CHAQUE MOIS, PLEINE OU VIDE", "red"); KWt(A(58, "bail"), E(58, 0.4), "LE DROIT AU BAIL", "gold"); Nt(A(58, "bail"), E(58, 0.3), "DROIT AU BAIL", "white", "rc_rc"); KWt(A(59, "revente"), E(59, 0.4), "DIFFICILE À REVENDRE", "red")
# ---- CH9 ----
T["rev9"] = A(61, "quatre-vingt"); T["cost9"] = A(62, "Matières"); T["res9"] = A(66, "trente-quatre"); T["sship_on"] = wi(60, 0)
KWt(A(60, "Imaginons"), A(60, "trois"), "UN CAFÉ DE QUARTIER", "gold"); Nt(wi(60, 0), E(60, 0.3), "CAFÉ DE QUARTIER", "white", "sm_ship"); KWt(A(60, "trois"), A(60, "avec"), "310 JOURS PAR AN", "blue"); KCt(A(60, "cents"), A(60, "et"), "200 CLIENTS / JOUR", "blue", 200, "", " CLIENTS / JOUR", 0.6); KCt(A(60, "cinq"), E(60, 0.3), "TICKET 5 € TTC", "gold", 5, "TICKET ", " € TTC", 0.5)
KCt(A(61, "quatre-vingt"), E(61, 0.3), "280 k€ HT / AN", "green", 280, "", " k€ HT / AN", 0.7); Nt(A(61, "quatre-vingt"), E(61, 0.3), "CHIFFRE D'AFFAIRES", "green", "sm_rev")
KCt(A(62, "vingt-huit"), E(62, 0.3), "MATIÈRES 28 %", "red", 28, "MATIÈRES ", " %", 0.5); KCt(A(63, "trente-cinq"), E(63, 0.3), "SALAIRES 35 %", "red", 35, "SALAIRES ", " %", 0.5); KCt(A(64, "dix"), E(64, 0.3), "LOYER 10 %", "red", 10, "LOYER ", " %", 0.5); KCt(A(65, "quinze"), E(65, 0.3), "AUTRES 15 %", "red", 15, "AUTRES ", " %", 0.5); Nt(A(62, "Matières"), E(65, 0.3), "COÛTS : 88 %", "red", "sm_cost")
KCt(A(66, "trente-quatre"), A(66, "soit"), "34 k€ AVANT IMPÔTS", "white", 34, "", " k€ AVANT IMPÔTS", 0.6); KCt(A(66, "douze"), E(66, 0.4), "12 % DE MARGE", "gold", 12, "", " % DE MARGE", 0.5); Nt(A(66, "reste"), E(66, 0.3), "IL RESTE", "white", "sm_res")
STt(A(67, "illustrative"), E(67, 0.2), "SIMULATION ILLUSTRATIVE", "gold"); KWt(A(67, "réel"), E(67, 0.4), "PAS LES COMPTES D'UN CAFÉ RÉEL", "red"); KCt(A(68, "soixante"), E(68, 0.4), "≈ 60 CT SUR 5 €", "gold", 60, "≈ ", " CT SUR 5 €", 0.6); KWt(A(69, "absorbé"), E(69, 0.4), "TOUT LE RESTE EST ABSORBÉ", "red")
# ---- CH10 ----
T["bef10"] = round(wi(70, 0) + 0.3, 2); T["aft10"] = A(74, "treize"); T["fix10"] = A(78, "vide")
KWt(A(70, "dix"), E(70, 0.3), "10 % DE CLIENTS EN MOINS", "red"); KCt(A(71, "vingt-huit"), E(71, 0.3), "− 28 k€ DE CA", "red", 28, "− ", " k€ DE CA", 0.6); KWt(A(72, "bougent"), E(72, 0.4), "COÛTS FIXES : IMMOBILES", "gold"); KWt(A(73, "Seules"), E(73, 0.4), "SEULES LES MATIÈRES BAISSENT", "gold")
Nt(T["bef10"], A(74, "treize"), "AVANT : 34 k€", "white", "pm_bef"); KCt(A(74, "treize"), A(74, "soit"), "13 k€", "red", 13, "", " k€", 0.6); Nt(A(74, "treize"), E(74, 0.3), "APRÈS : 13 k€", "red", "pm_aft"); KCt(A(74, "soixante"), E(74, 0.4), "− 60 % DE BÉNÉFICE", "red", 60, "− ", " % DE BÉNÉFICE", 0.6)
KCt(A(75, "quatre-vingts"), E(75, 0.4), "> 80 % DU CA POUR ÊTRE RENTABLE", "red", 80, "> ", " % DU CA POUR ÊTRE RENTABLE", 0.6); KWt(A(76, "mort"), E(76, 0.4), "LE POINT MORT", "gold")
KWt(A(77, "levier"), A(77, "quand"), "EFFET DE LEVIER DES COÛTS FIXES", "blue"); KWt(A(77, "pur"), E(77, 0.4), "PRESQUE PUR BÉNÉFICE", "green"); Nt(A(78, "vide"), E(78, 0.3), "SALLE VIDE", "red", "pm_fix"); KWt(A(78, "mal"), E(78, 0.4), "CHAQUE CLIENT COMPTE", "red"); STt(A(79, "simplification"), E(79, 0.2), "SALAIRES SUPPOSÉS FIXES", "gold")
# ---- CH11 ----
T["fship_on"] = wi(80, 0); T["loan_on"] = A(82, "cent"); T["bank_on"] = A(84, "banque"); T["rate_on"] = A(85, "mensualités")
KWt(A(80, "encaisser"), E(80, 0.4), "AVANT LE PREMIER EURO", "gold"); Nt(wi(80, 0), E(80, 0.3), "S'INSTALLER", "white", "fi_ship"); STt(A(81, "guides"), E(81, 0.2), "GUIDES · INDICATIF", "gold"); KWt(A(81, "milliers"), E(81, 0.4), "MACHINE : DES MILLIERS D'€", "blue")
KCt(A(82, "cent"), E(82, 0.3), "150 000 €", "gold", 150000, "", " € (HYPOTHÈSE)", 0.8); Nt(A(82, "cent"), E(82, 0.3), "INVESTISSEMENT", "gold", "fi_loan"); KCt(A(83, "quatre"), E(83, 0.4), "> 4 ANS POUR RÉCUPÉRER", "red", 4, "> ", " ANS POUR RÉCUPÉRER", 0.6)
KWt(A(84, "empruntent"), E(84, 0.4), "ON EMPRUNTE À LA BANQUE", "gold"); Nt(A(84, "banque"), E(84, 0.3), "BANQUE", "blue", "fi_bank"); KWt(A(85, "mensualités"), E(85, 0.4), "MENSUALITÉS EN PLUS", "red"); Nt(A(85, "mensualités"), E(85, 0.3), "MENSUALITÉS", "red", "fi_rate"); KWt(A(86, "pression"), E(86, 0.4), "UNE PRESSION SUPPLÉMENTAIRE", "red")
# ---- CH12 ----
T["delay_on"] = A(88, "soixante"); T["contract_on"] = A(88, "impôts"); T["idle_on"] = A(91, "difficiles"); T["fuel12_on"] = A(93, "variable")
KWt(A(87, "salaire"), E(87, 0.4), "PAS UN SALAIRE", "red"); KCt(A(88, "soixante"), A(88, "ces"), "60 H / SEMAINE", "gold", 60, "", " H / SEMAINE", 0.6); Nt(A(88, "soixante"), A(88, "ces"), "HEURES DU PATRON", "white", "rk_clock"); Nt(A(88, "impôts"), E(88, 0.3), "IMPÔTS · EMPRUNT", "red", "rk_contract"); KWt(A(88, "peu"), E(88, 0.4), "PARFOIS PEU DE REVENU", "red")
KCt(A(89, "deux"), E(89, 0.4), "2,5 À 15 % DE MARGE NETTE", "gold", 2.5, "", " À 15 % DE MARGE NETTE", 0.6, 1); STt(A(89, "sources"), E(89, 0.2), "SELON LES SOURCES", "gold"); KWt(A(90, "fourchette"), E(90, 0.4), "FOURCHETTE LARGE", "gold")
KWt(A(91, "difficiles"), E(91, 0.4), "LES ANNÉES DIFFICILES", "red"); Nt(A(91, "difficiles"), E(91, 0.3), "ANNÉE CREUSE", "red", "rk_idle"); KCt(A(92, "trente-quatre"), A(92, "puis"), "34 k€", "green", 34, "", " k€", 0.5); KCt(A(92, "dix"), E(92, 0.4), "PUIS 10 k€", "red", 10, "PUIS ", " k€", 0.5)
KWt(A(93, "variable"), E(93, 0.4), "LE REVENU LE PLUS VARIABLE", "red"); Nt(A(93, "variable"), E(93, 0.3), "REVENU ↕", "red", "rk_fuel"); Nt(A(93, "variable"), E(93, 0.3), "INCERTITUDE", "white", "rk_rate")
# ---- CH13 ----
T["fleet13_on"] = A(94, "causes"); T["tower13_on"] = A(99, "défaillances"); T["small_on"] = A(100, "fréquentation")
KWt(A(94, "répètent"), E(94, 0.4), "LES CAUSES SE RÉPÈTENT", "gold"); KWt(A(95, "loyer"), E(95, 0.4), "LOYER TROP ÉLEVÉ", "red"); KWt(A(96, "vide"), E(96, 0.4), "SALLE VIDE HORS POINTE", "red"); KWt(A(97, "prix"), E(97, 0.4), "PRIX EN RETARD SUR LES COÛTS", "red"); KWt(A(98, "consomment"), E(98, 0.4), "CLIENTS MOINS FRÉQUENTS", "red"); Nt(wi(94, 0), wi(99, 0), "CAFÉS", "white", "gn_fleet")
STt(A(99, "observatoires"), E(99, 0.2), "OBSERVATOIRES DU SECTEUR", "blue"); KCt(A(99, "dix"), E(99, 0.4), "≈ + 10 % DE DÉFAILLANCES", "red", 10, "≈ + ", " % DE DÉFAILLANCES", 0.6); Nt(A(99, "défaillances"), E(99, 0.3), "DÉFAILLANCES ↑", "red", "gn_tower")
KWt(A(100, "basculer"), E(100, 0.4), "LA MOINDRE BAISSE FAIT BASCULER", "red"); Nt(A(100, "fréquentation"), E(100, 0.3), "BAISSE DE FRÉQUENTATION", "red", "gn_small")
KWt(A(101, "télétravail"), A(101, "capsules"), "TÉLÉTRAVAIL", "gold"); KWt(A(101, "capsules"), A(101, "emporter"), "CAFÉ MAISON · CAPSULES", "blue"); KWt(A(101, "emporter"), E(101, 0.4), "BOISSONS À EMPORTER", "blue"); KWt(A(102, "justifier"), E(102, 0.4), "JUSTIFIER SON PRIX AUTREMENT", "gold")
# ---- CH14 ----
T["fill_on"] = A(104, "Remplir"); T["drink_on"] = A(106, "Ajouter"); T["big_on"] = A(107, "terrasse"); T["long_on"] = A(108, "Négocier"); T["life_on"] = A(111, "sept")
KWt(A(103, "tiennent-ils"), E(103, 0.4), "COMMENT TIENNENT-ILS ?", "gold"); KWt(A(104, "Remplir"), E(104, 0.4), "REMPLIR LES HEURES CREUSES", "green"); Nt(A(104, "Remplir"), E(104, 0.3), "HEURES CREUSES", "green", "lv_fill"); KWt(A(105, "emporter"), E(105, 0.4), "VENDRE À EMPORTER", "blue")
KWt(A(106, "marge"), E(106, 0.4), "PRODUITS À FORTE MARGE", "gold"); Nt(A(106, "Ajouter"), E(106, 0.3), "FORTE MARGE", "gold", "lv_drink"); KWt(A(107, "terrasse"), E(107, 0.4), "UNE TERRASSE", "green"); Nt(A(107, "terrasse"), E(107, 0.3), "TERRASSE", "blue", "lv_big")
KWt(A(108, "Négocier"), E(108, 0.4), "NÉGOCIER LOYER · FOURNISSEURS", "gold"); Nt(A(108, "Négocier"), E(108, 0.3), "NÉGOCIER", "green", "lv_long"); KWt(A(109, "diversifier"), E(109, 0.4), "TABAC · PRESSE · JEUX", "blue"); KWt(A(110, "Aucun"), E(110, 0.4), "AUCUN LEVIER NE SUFFIT SEUL", "gold")
KWt(A(111, "sept"), A(111, "vend"), "OUVERT DE 7 H À 20 H", "green"); Nt(A(111, "sept"), E(111, 0.3), "HORAIRES ÉTENDUS", "white", "lv_life"); KWt(A(112, "dilue"), E(112, 0.4), "LOYER ET PERSONNEL DILUÉS", "green")
# ---- CH15 ----
T["rc1"] = A(114, "Sur"); T["rc2"] = A(115, "Sur"); T["rc3"] = A(116, "équilibre"); T["bubble_on"] = wi(117, 0); T["button_on"] = wi(120, 0); T["press"] = round(e(120, -0.4), 2)
KWt(A(113, "rentable"), E(113, 0.3), "RENTABLE ?", "gold"); KWt(A(114, "excellente"), E(114, 0.4), "SUR LA TASSE : EXCELLENTE", "green"); Nt(A(114, "tasse"), E(114, 0.3), "LA TASSE", "green", "cta_cost")
KWt(A(115, "volume"), A(115, "résultat"), "UN MÉTIER DE VOLUME", "blue"); KWt(A(115, "résultat"), E(115, 0.4), "RÉSULTAT FRAGILE", "red"); Nt(A(115, "année"), E(115, 0.3), "L'ANNÉE", "blue", "cta_day")
KWt(A(116, "équilibre"), E(116, 0.4), "PRIX · VOLUME · CHARGE FIXE", "gold"); Nt(A(116, "équilibre"), E(116, 0.3), "ÉQUILIBRE", "white", "cta_fill")
Nt(A(117, "petit"), E(118, 0.3), "PETIT CAFÉ OU GRAND ?", "gold", "bubble"); KWt(A(118, "commentaire"), E(118, 0.5), "COMMENTEZ", "gold"); KWt(A(119, "sans"), E(119, 0.4), "LE PRODUIT ≠ LES CHIFFRES", "gold"); KWt(A(120, "simulation"), E(120, 0.4), "REFAITES LA SIMULATION", "green")
T["brand"] = e(120, -0.9); T["whoosh"] = -100
# no collisions: trim keywords / stamps to the next one, and notes sharing an anchor
def trim(lst, key=None):
    lst.sort(key=lambda d: d["t0"])
    for a, b in zip(lst, lst[1:]):
        if a["t1"] > b["t0"] - 0.03: a["t1"] = max(a["t0"] + 0.45, round(b["t0"] - 0.03, 2))
trim(B["kws"]); trim(B["stamps"])
byA = {}
for n_ in B["notes"]: byA.setdefault((n_["anchor"], n_["dx"], n_["dy"]), []).append(n_)
for v in byA.values(): trim(v)
