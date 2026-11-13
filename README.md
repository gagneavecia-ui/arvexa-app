# ARVX — application web (branche web-v1)

Modèle « apporte ton cours » : le cours collé → détection de matière → résumé → pas à pas →
banque de questions → examens ciblés/globaux → progression agrégée.

- Next.js 16 + TypeScript + Tailwind 4 + shadcn/ui
- Design system « Encre claire » (référence produit AXIA)
- Données 100 % locales (localStorage `arvx.web.v1.*`) — aucun serveur, aucune donnée envoyée
- Moteur d'analyse embarqué (`src/lib/arvx/analyseur.ts`), porté à l'identique de la version mobile
- Branche `main` = code mobile Expo (APK via pipeline CI) ; cette branche = itération rapide web
