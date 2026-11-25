T["whoosh"] = s(3) - 0.55
# 0 tablette
T["bar_on"] = s(0, 0.1); T["tow_on"] = w(0, "milliards"); T["pod_on"] = w(0, "cultive"); T["coin_on"] = w(0, "petite")
kw(w(0, "chocolat"), w(0, "milliards"), "LE CHOCOLAT", "white"); kw(w(0, "milliards"), w(0, "celui"), "DES MILLIARDS", "gold"); kw(w(0, "celui"), e(0, 0.4), "LE PLANTEUR : UNE PETITE PART", "red")
note(T["tow_on"], e(0, 0.2), "MILLIARDS", "gold", "tb_tow", 0, -60); note(T["pod_on"], e(0, 0.2), "PLANTEUR", "green", "tb_pod", 0, -60)
# 1 part
T["pie1_on"] = w(1, "onze"); T["pie2_on"] = w(1, "sept")
stamp(w(1, "fao"), w(1, "recevait"), "FAO · BASIC", "blue", 540, 1180)
kw(w(1, "tablettes"), w(1, "onze"), "TABLETTES VENDUES EN FRANCE", "white"); kw(w(1, "onze"), w(1, "sept"), "≈ 11 % : NOIR", "gold"); kw(w(1, "sept"), e(1, 0.4), "≈ 7 % : AU LAIT", "red")
note(T["pie1_on"], e(1, 0.2), "CHOCOLAT NOIR", "gold", "pt_p1", 0, -60); note(T["pie2_on"], e(1, 0.2), "CHOCOLAT AU LAIT", "white", "pt_p2", 0, -60)
# 2 kilo
T["kg_on"] = s(2, 0.1); T["cu_on"] = w(2, "culture"); T["fa_on"] = w(2, "fabrication"); T["di_on"] = w(2, "distribution")
kw(w(2, "kilo"), w(2, "culture"), "1 KILO : 9,32 €", "white"); kw(w(2, "culture"), w(2, "fabrication"), "CULTURE : 1,05 €", "gold"); kw(w(2, "fabrication"), w(2, "distribution"), "FABRICATION : 37 %", "white"); kw(w(2, "distribution"), e(2, 0.4), "DISTRIBUTION : 37 %", "red")
note(T["cu_on"], e(2, 0.2), "CULTURE", "gold", "sg_cu", 0, -60); note(T["fa_on"], e(2, 0.2), "FABRICATION", "white", "sg_fa", 0, -60); note(T["di_on"], e(2, 0.2), "DISTRIBUTION", "red", "sg_di", 0, -60)
# 3 marques
T["mq_on"] = s(3, 0.1); T["va_on"] = w(3, "soixantedix"); T["ma_on"] = w(3, "quatrevingtdix")
kw(w(3, "marques"), w(3, "soixantedix"), "MARQUES + DISTRIBUTEURS", "red"); kw(w(3, "soixantedix"), w(3, "près"), "≈ 70 % DE LA VALEUR", "gold"); kw(w(3, "près"), e(3, 0.4), "≈ 90 % DES MARGES", "red")
note(T["va_on"], e(3, 0.2), "VALEUR", "gold", "mq_val", 0, -60); note(T["ma_on"], e(3, 0.2), "MARGES", "red", "mq_mar", 0, -60)
# 4 pays
T["pa_on"] = s(4, 0.1); T["pi_on"] = s(4, 0.3)
kw(w(4, "pays"), w(4, "moins"), "PAYS PRODUCTEURS", "white"); kw(w(4, "moins"), e(4, 0.4), "MOINS DE 19 % DE LA VALEUR", "gold")
note(T["pi_on"], e(4, 0.2), "PAYS PRODUCTEURS", "gold", "py_pie", 0, -60)
# 5 twist
T["tw_on"] = s(5, 0.1); T["drop_on"] = w(5, "chuté"); T["up2_on"] = w(5, "continué")
kw(w(5, "voici"), w(5, "quand"), "LE PLUS FRAPPANT", "gold"); kw(w(5, "quand"), w(5, "chuté"), "COURS MONDIAL", "white"); kw(w(5, "chuté"), w(5, "valeur"), "− 35 %", "red"); kw(w(5, "valeur"), w(5, "continué"), "VALEUR EN FRANCE", "white"); kw(w(5, "continué"), e(5, 0.4), "ELLE CONTINUE DE CROÎTRE", "green")
note(T["drop_on"], T["up2_on"], "COURS − 35 %", "red", "tw_l", 0, -60); note(T["up2_on"], e(5, 0.2), "MARQUES + DISTRIBUTEURS", "green", "tw_r", 0, -60)
# 6 cours
T["cr_on"] = s(6, 0.1); T["c12_on"] = w(6, "douze"); T["c5_on"] = w(6, "cinq"); T["civ_on"] = w(6, "côte")
stamp(w(6, "coface"), w(6, "douze"), "COFACE", "blue", 540, 1180)
kw(w(6, "douze"), w(6, "environ"), "≈ 12 000 $ / TONNE", "gold"); kw(w(6, "environ"), w(6, "côte"), "≈ 5 000 $ EN DÉC. 2025", "red"); kw(w(6, "côte"), w(6, "deux"), "CÔTE D'IVOIRE : RECORD", "white"); kw(w(6, "deux"), e(6, 0.4), "2 800 FCFA / KG", "gold")
note(T["c12_on"], e(6, 0.2), "12 000 $/t", "gold", "cr_b1", 0, -60); note(T["c5_on"], e(6, 0.2), "5 000 $/t", "red", "cr_b2", 0, -60); note(T["civ_on"], e(6, 0.2), "PRIX BORD CHAMP", "green", "cr_sk", 0, -60)
# 7 revenu
T["rv_on"] = s(7, 0.1); T["gh2_on"] = w(7, "chiffre")
kw(w(7, "prix"), w(7, "planteur"), "UN PRIX PLUS ÉLEVÉ", "white"); kw(w(7, "planteur"), w(7, "chiffre"), "REVENU DU PLANTEUR ?", "gold"); kw(w(7, "chiffre"), e(7, 0.4), "PAS DE CHIFFRE FIABLE", "red")
note(T["gh2_on"], e(7, 0.2), "REVENU ?", "red", "rv_gh", 0, -60); note(w(7, "planteur"), T["gh2_on"], "PLANTEUR", "green", "rv_fr", 0, -60)
# 8 retenez
T["sc_on"] = s(8, 0.1)
kw(w(8, "cacao"), w(8, "bien"), "LE CACAO", "gold"); kw(w(8, "bien"), w(8, "fabrication"), "PÈSE BIEN MOINS", "red"); kw(w(8, "fabrication"), e(8, 0.4), "QUE FABRICATION, MARQUE, DISTRIBUTION", "white")
note(s(8, 0.5), e(8, 0.2), "CACAO", "green", "sc_l", 0, -60); note(w(8, "fabrication"), e(8, 0.2), "FABRICATION + MARQUE + DISTRIBUTION", "red", "sc_r", 0, -60)
# cta
T["bubble_on"] = s(9, 0.2); T["button_on"] = w(10, "abonnez"); T["press"] = w(10, "decrypt")
note(w(9, "planteur"), e(9, 0.1), "ET VOUS ?", "gold", "bubble", 0, -70); kw(w(9, "dites"), e(9, 0.5), "COMMENTEZ", "gold")
kw(T["button_on"], e(10, 0.4), "ABONNEZ-VOUS", "red")
T["brand"] = e(10, -0.9)
