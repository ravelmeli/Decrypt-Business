# Processus de préparation d'un Short (Decrypt Business)

Format par défaut : Short vertical 9:16 (1080×1920), durée visée 80 à 90 secondes. Les vidéos longues (16:9) viendront plus tard.
Étapes séquentielles. Une entrée à la fois : s'arrêter après chaque étape et attendre la réponse de l'utilisateur.
Réponses concises, sans préambule. Jamais de tiret cadratin (—) : virgules, deux-points, parenthèses ou traits d'union simples.

## 1. Sujet
Demander uniquement : « Quel est le sujet de ton Short ? »
Garde-fou factuel : uniquement des entreprises, cas ou événements RÉELS et documentables. Jamais de scénario fictif présenté comme réel.

## 2. Durée
Dire : « Quelle durée pour ce Short ? Cible par défaut : 80 à 90 secondes (environ 215 à 245 mots). Réponds avec une durée, ou 'ok' pour garder la cible. »

## 3. Étude de cas et données sources
Recherche web sur le sujet, puis exactement 3 pistes factuelles distinctes et vérifiables (un Short ne porte qu'une idée forte). Pour chacune : le fait ou chiffre précis, sa source (média, rapport, document officiel), une note de fiabilité si la source est incertaine ou contestée.
Ne PAS demander de choix : retenir automatiquement toutes les pistes fiables (ou, à défaut, la plus solide) et passer directement à l'étape 4. Signaler dans le script les réserves de fiabilité.
Ensuite le sujet et les pistes retenues (avec sources) deviennent les [ÉTUDES DE CAS]. Passer directement à l'étape 4.

## 4. Script du Short (style Fern, version courte)

### Garde-fou factuel (priorité absolue)
- N'inventer AUCUN chiffre financier précis (CA, marge, dette, valorisation) absent des études de cas ou non largement établi. Sinon, formulation qualitative.
- Aucune citation ou pensée attribuée à une personne réelle nommée, sauf citation publique vérifiable.
- Ne jamais présenter une interprétation comme un fait : nuancer (« tout porte à croire que... »).
- Rester sur le mécanisme économique, pas de jugement moral direct sur les personnes.
- Doute sur un fait fourni par l'utilisateur : le signaler avant de l'intégrer.

### Style
- Ton : documentariste financier (Arte, Bloomberg Original, Magellan). Calme, grave, analytique, chirurgical. Déconstruit une illusion économique.
- Français fluide, percutant, métaphorique, axé sur UN chiffre ou UNE vérité dérangeante.
- Anti-répétition : vocabulaire, rythme et métaphores adaptés au SECTEUR du sujet, pas de formules génériques d'un Short à l'autre.
- Pas de sensationnalisme ni moquerie envers les victimes.
- Pas de sponsor ni d'intro d'animateur. Exception voulue : l'appel à l'action final (voir « Appel à l'action » ci-dessous).

### Longueur
Environ 150 à 170 mots par minute : 15 s ≈ 40 mots, 30 s ≈ 80, 45 s ≈ 120, 60 s ≈ 160. Phrases courtes, rythme rapide.

### Sortie
- Le script commence DIRECTEMENT par la première ligne de narration, sans commentaire hors script.

### Arc narratif condensé
1. HOOK (1 à 2 lignes, dans les 2 premières secondes) : chiffre absurde ou anomalie (seulement s'il est fourni ou notoire). Ne jamais commencer de la même façon d'un Short à l'autre.
2. MÉCANISME (le corps) : comment le business fonctionne vraiment, l'asymétrie entre ce que voit le client et ce que subit le bilan, appuyé sur le fait réel retenu.
3. CHUTE (dernière ligne) : une phrase froide, mémorable, philosophique, qui peut boucler sur le hook.

### Appel à l'action (obligatoire à la fin de chaque vidéo, règle de l'utilisateur)
- Après la CHUTE, ajouter 1 à 2 courtes phrases parlées (environ 10 à 18 mots) qui poussent à commenter ET à s'abonner à la chaîne. Elles font partie du script et de la voix.
- La phrase d'invitation à commenter pose une question précise liée au sujet (ex. « Qu'est-ce qui vous fait dépenser le plus dans un parc ? »), puis l'abonnement (« Abonnez-vous à Decrypt Business pour comprendre l'économie en quelques minutes »). Varier la formulation d'une vidéo à l'autre.
- À l'image : fin de vidéo avec une carte finale lisible (verbe d'action « COMMENTEZ » + « ABONNEZ-VOUS »), sans coupure, dans la même caméra continue, zone de sécurité respectée.
- Le total reste dans la durée visée (80 à 90 s) : compter ces mots dans le budget.
- La description et la question de commentaire des métadonnées reprennent la même question.

## 5. Voix off (Gemini TTS)
Générer la voix avec `shorts/tools_tts_gemini.py` : voix `en-us-koda`, style « Promote » (`High energy, elongated vowels`), clé lue dans la variable d'environnement `GEMINI_API_KEY` (jamais dans un fichier ni collée dans le chat).
Accent : la voix Koda est à l'origine anglophone et peut prendre un accent anglais sur certaines phrases françaises (ex. « Et c'est là que se cache la marge »). Règles : (1) ajouter au style « native French speaker, Parisian accent, no English accent » ; (2) générer phrase par phrase (`shorts/tools_tts_lines.py`) pour pouvoir refaire UNE seule phrase sans toucher aux autres ; (3) éviter les tournures à sons difficiles (enchaînements « c'est là que… », « th/h » proches de l'anglais, mots anglais) en préférant des phrases simples, courtes et des mots français courants ; (4) refaire jusqu'à 3 prises d'une phrase suspecte, et signaler à l'utilisateur les phrases dont l'accent reste douteux (Whisper ne détecte pas l'accent, seule une écoute humaine le fait) ;
(5) l'utilisateur confirme à l'écoute avant le rendu final.
Écrire les chiffres pour la voix (« 5 pour cent », pas « 5 % »). Vérifier la voix en la retranscrivant (Whisper large-v3 local : `npx hyperframes transcribe --engine whisper --model large-v3 --language fr`) et en comparant au script. L'utilisateur peut aussi fournir sa propre voix.

## Contraintes visuelles propres au Short (pour la mise en scène isométrique)
- Zones de sécurité : texte et chiffres au centre du cadre, loin des bords et du bas (interface YouTube).
- Cadrage serré sur un seul bâtiment ou flux de l'île miniature, texte gros et court, lisible sur mobile.
