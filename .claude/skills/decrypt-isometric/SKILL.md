---
name: decrypt-isometric
description: Build Decrypt Business YouTube videos (French, business/finance explainers on the economics of industries such as airports, casinos, cinemas, banks, gas stations) in the Isometric 2.5D motion style. Use when the user asks to make, script, storyboard or render a Decrypt Business video, intro, short or scene.
---

# Decrypt Business — Isometric 2.5D videos

Channel: **Decrypt Business** (youtube.com/@DecryptBusiness), French-language. Each video dissects the real economic
model of an industry: revenue sources, hidden costs, margins, pitfalls. Audience: entrepreneurs, investors, curious people.

## Préparation du sujet
Pour tout nouveau sujet, suivre d'abord `script-process.md` (sujet, durée, recherche sourcée, script Short).

## Workflow
1. Start with `/hyperframes` (mandatory entry point), then follow the owning workflow (`/faceless-explainer` for a
   narrated topic explainer, `/general-video` for custom scenes, `/motion-graphics` for short units).
2. Apply the style spec in `reference/mg-styles-15/prompts/03-isometric.md` — keep its **Signature features**:
   true isometric (orthographic, 35.264° elevation, 45° azimuth), no perspective, miniature world, buildings that
   *grow* (base lands, walls scaleY from 0 with overshoot, roof 2–3 frames later), parallel camera slides with
   1 : 0.8 : 0.6 parallax, z-order by screen y, deterministic render (every frame a pure function of t).
   Reference code/tools for rendering are in `reference/mg-styles-15/harness/` and audio in `reference/mg-styles-15/lib/audio/`.
3. Every video = one isometric miniature of the studied industry (e.g. cinema, airport, bank) where each revenue
   stream and cost is a building/vehicle/flow that appears on the island, with data overlays on the iso plane.

## Brand look
- Palette from the logo/thumbnails: near-black ground (#0B0B0F), gold (#D4A537 / #F2C94C), white, accent red (#E03A2F)
  for costs/losses, green (#2FBF71) for profit. Replaces the original pastel palette; keep soft shadows + AO.
- Typography: heavy condensed sans for headlines (thumbnail-style), clean sans for figures. French text only,
  correct accents and typographic spaces (e.g. « 12 % », « 3 500 € »).
- Recurring motifs: coins, rising gold arrow, vault, shopping cart, skyline from the logo.

## Content rules
- Figures must be sourced; list sources in `CREDITS.md`. Never invent statistics; mark estimates as « estimation ».
- Invented names only for brands in generic scenes; no real trademarks/logos.
- Structure: hook (the surprising number) → autopsy of revenues → hidden costs → margin → verdict.
- Current phase: Shorts first, 9:16 1080×1920, 15 to 60 s (see script-process.md). Long 16:9 videos come later.

## Nouvelle direction (série de 5, durée 80 à 90 s)
Passer de « un diorama par idée » à un **moteur d'explication** réutilisable, inspiré (technique et rythme, jamais le contenu) de références TikTok analysées : voir `references-style.md`.
Briques à construire : annotations (pastilles, flèches, lignes pointillées, badges numérotés, coches), mots-clés géants en haut d'écran, sous-titres à pastille sur le mot prononcé, tampons, frises chronologiques, documents, barres animées, coupes de terrain, barre de progression.
Palette : **varie selon le sujet** (bleu nuit avec or, rouge et bleu pour les sujets graves ou techniques ; pastel pour les sujets légers ; or sur noir pour l'identité Decrypt Business).
Garde-fous : aucune personne réelle reconnaissable, aucun vrai logo ni marque (archétypes stylisés seulement) ; chiffres sourcés, jamais inventés.
Voix : Gemini TTS, voix `en-us-koda`, style « Promote » (voir `script-process.md`).
