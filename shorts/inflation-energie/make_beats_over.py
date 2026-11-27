T["whoosh"] = s(3) - 0.55
# 0 thermo
T["th_on"] = s(0, 0.1); T["fl_on"] = w(0, "énergie")
kw(w(0, "inflation"), w(0, "montée"), "L'INFLATION", "white"); kw(w(0, "montée"), w(0, "plus"), "+ 3,4 % EN OCTOBRE", "red"); kw(w(0, "plus"), w(0, "vient"), "PLUS DE LA MOITIÉ", "white"); kw(w(0, "vient"), e(0, 0.4), "VIENT DE L'ÉNERGIE", "gold")
note(s(0, 0.8), e(0, 0.2), "3,4 %", "red", "th_t", 0, -60); note(T["fl_on"], e(0, 0.2), "ÉNERGIE", "gold", "th_f", 0, -60)
# 1 mois
T["b_oct"] = w(1, "prix"); T["b_sep"] = w(1, "septembre")
stamp(w(1, "insee"), w(1, "augmenté"), "INSEE", "blue", 540, 1180)
kw(w(1, "octobre"), w(1, "après"), "OCTOBRE : + 3,4 %", "red"); kw(w(1, "après"), e(1, 0.4), "SEPTEMBRE : + 3,1 %", "white")
note(T["b_oct"], e(1, 0.2), "OCT. 3,4 %", "red", "mo_b", 0, -60); note(T["b_sep"], e(1, 0.2), "SEPT. 3,1 %", "gold", "mo_a", 0, -60)
# 2 energie
T["e_oct"] = w(2, "vingtquatre"); T["e_sep"] = w(2, "vingt", 1)
kw(w(2, "énergie"), w(2, "bondi"), "L'ÉNERGIE", "gold"); kw(w(2, "bondi"), w(2, "après"), "+ 24,1 %", "red"); kw(w(2, "après"), e(2, 0.4), "SEPTEMBRE : + 21,3 %", "white")
note(T["e_oct"], e(2, 0.2), "OCT. 24,1 %", "red", "en_b", 0, -60); note(T["e_sep"], e(2, 0.2), "SEPT. 21,3 %", "gold", "en_a", 0, -60)
# 3 detail
T["pe_on"] = w(3, "pétroliers"); T["ga_on"] = w(3, "gaz"); T["el_on"] = w(3, "électricité")
kw(w(3, "pétroliers"), w(3, "gaz"), "PÉTROLE : + 38,5 %", "red"); kw(w(3, "gaz"), w(3, "électricité"), "GAZ : + 27,1 %", "gold"); kw(w(3, "électricité"), e(3, 0.4), "ÉLECTRICITÉ : + 2,7 %", "green")
note(T["pe_on"], e(3, 0.2), "PÉTROLE", "red", "de_p", 0, -60); note(T["ga_on"], e(3, 0.2), "GAZ", "gold", "de_g", 0, -60); note(T["el_on"], e(3, 0.2), "ÉLECTRICITÉ", "green", "de_e", 0, -60)
# 4 poids
T["po_on"] = w(4, "pèse"); T["col_on"] = w(4, "représente")
stamp(w(4, "jechange"), w(4, "cela"), "JECHANGE (CALCUL)", "blue", 540, 1180)
kw(w(4, "pèse"), w(4, "selon"), "7,6 % DU PANIER", "gold"); kw(w(4, "représente"), e(4, 0.4), "≈ 1,8 POINT SUR 3,4", "red")
note(T["po_on"], e(4, 0.2), "ÉNERGIE", "gold", "po_pie", 0, -60); note(T["col_on"], e(4, 0.2), "≈ 1,8 POINT", "red", "po_col", 0, -60)
# 5 calme
T["fo_on"] = w(5, "alimentation"); T["sv_on"] = w(5, "services"); T["mf_on"] = w(5, "manufacturés")
kw(w(5, "alimentation"), w(5, "services"), "ALIMENTATION : + 1,2 %", "green"); kw(w(5, "services"), w(5, "manufacturés"), "SERVICES : + 2,6 %", "white"); kw(w(5, "manufacturés"), e(5, 0.4), "MANUFACTURÉS : − 0,2 %", "red")
note(T["fo_on"], e(5, 0.2), "ALIMENTATION", "green", "ca_f", 0, -60); note(T["sv_on"], e(5, 0.2), "SERVICES", "white", "ca_s", 0, -60); note(T["mf_on"], e(5, 0.2), "MANUFACTURÉS", "red", "ca_m", 0, -60)
# 6 sousjacente
T["so_on"] = s(6, 0.1); T["sj_on"] = w(6, "sousjacente")
kw(w(6, "sousjacente"), w(6, "volatils"), "SOUS-JACENTE", "white"); kw(w(6, "volatils"), w(6, "est"), "SANS LES PRIX VOLATILS", "gold"); kw(w(6, "est"), e(6, 0.4), "+ 1,7 %", "green")
note(T["so_on"], e(6, 0.2), "ENSEMBLE 3,4 %", "red", "so_h", 0, -60); note(T["sj_on"], e(6, 0.2), "SOUS-JACENTE 1,7 %", "green", "so_c", 0, -60)
# 7 vous
T["pu_on"] = w(7, "carburant"); T["gz_on"] = w(7, "gaz"); T["fa_on"] = w(7, "facture")
kw(w(7, "carburant"), w(7, "gaz"), "CARBURANT", "gold"); kw(w(7, "gaz"), w(7, "facture"), "GAZ", "gold"); kw(w(7, "facture"), w(7, "pas"), "FACTURE D'ÉNERGIE", "red"); kw(w(7, "pas"), e(7, 0.4), "PAS TOUS LES PRIX", "white")
note(T["pu_on"], e(7, 0.2), "CARBURANT", "gold", "vo_pump", 0, -60); note(T["fa_on"], e(7, 0.2), "FACTURE", "red", "vo_bill", 0, -60)
# 8 calendrier
T["cl_on"] = s(8, 0.1); T["ck_on"] = w(8, "bougé")
kw(w(8, "attention"), w(8, "estimation"), "ATTENTION", "red"); kw(w(8, "estimation"), w(8, "publiée"), "ESTIMATION DE NOVEMBRE", "white"); kw(w(8, "publiée"), w(8, "donc"), "PUBLIÉE LE 27 NOV.", "gold"); kw(w(8, "donc"), e(8, 0.4), "LES CHIFFRES PEUVENT BOUGER", "red")
note(w(8, "publiée"), e(8, 0.2), "27 NOVEMBRE", "gold", "cl_cal", 0, -60); note(T["ck_on"], e(8, 0.2), "DÉJÀ PÉRIMÉ ?", "red", "cl_ck", 0, -60)
# 9 retenez
T["re_on"] = s(9, 0.1)
kw(w(9, "retenez"), w(9, "cacher"), "3,4 % EN MOYENNE", "white"); kw(w(9, "cacher"), e(9, 0.4), "DES ÉCARTS ÉNORMES", "red")
note(w(9, "écarts"), e(9, 0.2), "ÉCARTS", "red", "re_all", 0, -60)
# cta
T["bubble_on"] = s(10, 0.2); T["button_on"] = w(11, "abonnez"); T["press"] = w(11, "decrypt")
note(w(10, "surpris"), e(10, 0.1), "ET VOUS ?", "gold", "bubble", 0, -70); kw(w(10, "dites"), e(10, 0.5), "COMMENTEZ", "gold")
kw(T["button_on"], e(11, 0.4), "ABONNEZ-VOUS", "red")
T["brand"] = e(11, -0.9)
