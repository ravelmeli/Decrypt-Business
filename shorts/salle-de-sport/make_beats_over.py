T["whoosh"] = s(3) - 0.55
# 0 salle
T["sl_on"] = s(0, 0.1); T["cr_on"] = w(0, "abonnés")
kw(w(0, "salle"), w(0, "accueillir"), "UNE SALLE DE SPORT", "white"); kw(w(0, "accueillir"), w(0, "modèle"), "PAS DE PLACE POUR TOUS", "red"); kw(w(0, "modèle"), e(0, 0.4), "LE MODÈLE REPOSE LÀ-DESSUS", "gold")
note(s(0, 0.4), e(0, 0.2), "LA SALLE", "gold", "sa_b", 0, -60); note(T["cr_on"], e(0, 0.2), "LES ABONNÉS", "white", "sa_c", 0, -60)
# 1 prix
T["pr_on"] = w(1, "quarante"); T["b29_on"] = w(1, "vingtneuf")
stamp(w(1, "choisir"), w(1, "quarante"), "QUE CHOISIR", "blue", 540, 1180)
kw(w(1, "quarante"), w(1, "vingtneuf"), "40 € / MOIS", "gold"); kw(w(1, "vingtneuf"), w(1, "réseau"), "29 € / MOIS", "green"); kw(w(1, "réseau"), w(1, "basicfit"), "RÉSEAU LE MOINS CHER", "white"); kw(w(1, "basicfit"), e(1, 0.4), "BASIC-FIT", "green")
note(T["pr_on"], e(1, 0.2), "MOYENNE", "gold", "pr_a", 0, -60); note(T["b29_on"], e(1, 0.2), "BASIC-FIT", "green", "pr_b", 0, -60)
# 2 club
T["cl_on"] = s(2, 0.1); T["cw_on"] = w(2, "deux")
kw(w(2, "basicfit"), w(2, "environ"), "BASIC-FIT : FIN 2025", "white"); kw(w(2, "environ"), w(2, "par"), "≈ 2 900 ABONNEMENTS", "gold"); kw(w(2, "par"), e(2, 0.4), "PAR CLUB", "white")
note(T["cw_on"], e(2, 0.2), "≈ 2 900", "gold", "cl_c", 0, -60)
# 3 calcul
T["ca_on"] = s(3, 0.1); T["ml_on"] = w(3, "million")
kw(w(3, "vingtneuf"), w(3, "calcul"), "29 € PAR MOIS", "white"); kw(w(3, "calcul"), w(3, "million"), "ORDRE DE GRANDEUR", "white"); kw(w(3, "million"), w(3, "avant"), "≈ 1 M€ PAR AN", "gold"); kw(w(3, "avant"), e(3, 0.4), "AVANT FRAIS ET OFFRES", "red")
note(T["ml_on"], e(3, 0.2), "≈ 1 M€ / AN / CLUB", "gold", "ca_t", 0, -60)
# 4 plateau
T["pl_on"] = s(4, 0.1); T["gh_on"] = w(4, "petite")
kw(w(4, "personne"), w(4, "modèle"), "2 900 SUR LE MÊME PLATEAU ?", "red"); kw(w(4, "modèle"), w(4, "seule"), "LE MODÈLE SUPPOSE", "white"); kw(w(4, "seule"), e(4, 0.4), "SEULE UNE PETITE PARTIE EST PRÉSENTE", "gold")
note(T["gh_on"], e(4, 0.2), "PRÉSENTS", "gold", "pl_m", 0, -60); note(T["gh_on"] + 0.3, e(4, 0.2), "ABSENTS", "white", "pl_g", 0, -60)
# 5-6 fantomes
T["fa_on"] = s(5, 0.1); T["ghost_on"] = w(5, "fantômes"); T["cb_on"] = w(6, "échantillon")
stamp(w(5, "choisir"), w(5, "mille"), "QUE CHOISIR", "blue", 540, 1180)
kw(w(5, "mille"), w(5, "seuls"), "1 352 ABONNÉS", "white"); kw(w(5, "seuls"), w(5, "fantômes"), "SEULS 5 %", "gold"); kw(w(5, "fantômes"), e(5, 0.4), "ABONNÉS FANTÔMES", "red")
note(T["ghost_on"], e(5, 0.2), "5 %", "gold", "fa_g", 0, -60)
kw(w(6, "échantillon"), w(6, "âge"), "NON REPRÉSENTATIF", "red"); kw(w(6, "âge"), w(6, "beaucoup"), "ÂGE MÉDIAN : 66 ANS", "white"); kw(w(6, "beaucoup"), e(6, 0.4), "BEAUCOUP DE RETRAITÉS", "gold")
note(T["cb_on"], e(6, 0.2), "ENQUÊTE", "red", "fa_cb", 0, -60)
# 7 sanschiffre
T["ns_on"] = s(7, 0.1); T["x_on"] = w(7, "fiable")
kw(w(7, "chiffre"), w(7, "part"), "PAS DE CHIFFRE FIABLE", "red"); kw(w(7, "part"), w(7, "alors"), "LA PART QUI NE VIENT JAMAIS", "white"); kw(w(7, "alors"), e(7, 0.4), "MÉFIEZ-VOUS DES % SANS SOURCE", "gold")
note(T["x_on"], e(7, 0.2), "SANS SOURCE", "red", "ns_b", 0, -60)
# 8-9 dgccrf
T["dg_on"] = s(8, 0.1); T["flag_on"] = w(8, "soixantedix"); T["pie_on"] = w(9, "quarantesix")
stamp(w(8, "dgccrf"), w(8, "établissements"), "DGCCRF", "blue", 540, 1180)
kw(w(8, "établissements"), w(8, "plus"), "571 CONTRÔLÉS · 2022-2023", "white"); kw(w(8, "plus"), w(8, "moins"), "PLUS DE 70 %", "red"); kw(w(8, "moins"), e(8, 0.4), "AU MOINS UNE ANOMALIE", "white")
note(T["flag_on"], e(8, 0.2), "ANOMALIE", "red", "dg_s", 0, -60)
kw(w(9, "quarantesix"), w(9, "clauses"), "46 % DES CONTRATS", "red"); kw(w(9, "clauses"), w(9, "résiliation"), "CLAUSES ILLICITES OU ABUSIVES", "white"); kw(w(9, "résiliation"), e(9, 0.4), "RÉSILIATION PLUS DURE POUR VOUS", "gold")
note(T["pie_on"], e(9, 0.2), "46 %", "red", "dg_p", 0, -60)
# 10 contrat
T["ct_on"] = s(10, 0.1); T["clk_on"] = w(10, "durée")
kw(w(10, "retenez"), w(10, "durée"), "AVANT DE SIGNER", "white"); kw(w(10, "durée"), w(10, "reconduction"), "LA DURÉE", "gold"); kw(w(10, "reconduction"), w(10, "résiliation"), "LA RECONDUCTION", "white"); kw(w(10, "résiliation"), w(10, "comptez"), "LA RÉSILIATION", "red"); kw(w(10, "comptez"), e(10, 0.4), "COMPTEZ VOS VISITES", "green")
note(s(10, 0.4), e(10, 0.2), "CONTRAT", "white", "ct_d", 0, -60); note(T["clk_on"], e(10, 0.2), "DURÉE", "gold", "ct_k", 0, -60)
# cta
T["bubble_on"] = s(11, 0.2); T["button_on"] = w(12, "abonnez"); T["press"] = w(12, "decrypt")
note(w(11, "semaine"), e(11, 0.1), "ET VOUS ?", "gold", "bubble", 0, -70); kw(w(11, "dites"), e(11, 0.5), "COMMENTEZ", "gold")
kw(T["button_on"], e(12, 0.4), "ABONNEZ-VOUS", "red")
T["brand"] = e(12, -0.9)
