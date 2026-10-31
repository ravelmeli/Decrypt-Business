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
- Aucun appel à l'abonnement, sponsor, ni intro ou conclusion d'animateur.

### Longueur
Environ 150 à 170 mots par minute : 15 s ≈ 40 mots, 30 s ≈ 80, 45 s ≈ 120, 60 s ≈ 160. Phrases courtes, rythme rapide.

### Sortie
- Le script commence DIRECTEMENT par la première ligne de narration, sans commentaire hors script.

### Arc narratif condensé
1. HOOK (1 à 2 lignes, dans les 2 premières secondes) : chiffre absurde ou anomalie (seulement s'il est fourni ou notoire). Ne jamais commencer de la même façon d'un Short à l'autre.
2. MÉCANISME (le corps) : comment le business fonctionne vraiment, l'asymétrie entre ce que voit le client et ce que subit le bilan, appuyé sur le fait réel retenu.
3. CHUTE (dernière ligne) : une phrase froide, mémorable, philosophique, qui peut boucler sur le hook.

## 5. Voix off (Gemini TTS)
Générer la voix avec `shorts/tools_tts_gemini.py` : voix `en-us-koda`, style « Promote » (`High energy, elongated vowels`), clé lue dans la variable d'environnement `GEMINI_API_KEY` (jamais dans un fichier ni collée dans le chat).
Écrire les chiffres pour la voix (« 5 pour cent », pas « 5 % »). Vérifier la voix en la retranscrivant (Whisper large-v3 local : `npx hyperframes transcribe --engine whisper --model large-v3 --language fr`) et en comparant au script. L'utilisateur peut aussi fournir sa propre voix.

## Contraintes visuelles propres au Short (pour la mise en scène isométrique)
- Zones de sécurité : texte et chiffres au centre du cadre, loin des bords et du bas (interface YouTube).
- Cadrage serré sur un seul bâtiment ou flux de l'île miniature, texte gros et court, lisible sur mobile.
