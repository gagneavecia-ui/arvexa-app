# ARVX (clone AXIA) — branche de travail

Miroir 1:1 du site https://axia-chi.vercel.app capturé le 2026-11-13, puis
**rebranding ARVX étape par étape** (site en ligne : https://axia-clone.vercel.app).

## Étape 1 — Couleurs ARVX (fait)
- Palettes claire et sombre re-thémées : base #0A0A0A, or #E0B84A / #B8860B,
  crèmes #F5F0E8 / #F5F1E6 / #EFE9D9, textes chauds #262019,
  succès #2D7D5A, danger terracotta #B85C3A.
- Dégradés SVG, lettres du mot héros et logotype passés à l'or.
- Logo, icônes PWA et favicon recolorés en pixel (teintes or, transparence gardée).
- Les couleurs d'état gardent leur rôle (succès vert, erreur terracotta) ;
  les drapeaux des opérateurs mobile money sont inchangés.
- Le bouton « Continuer avec Google » et les fonctions ne sont pas touchés.

## Particularité de déploiement (Vercel)
Vercel exclut tout dossier nommé `node_modules` du statique : les 8 fichiers
(police MaterialCommunityIcons, WASM rive/wa-sqlite, icônes @react-navigation)
vivent sous `assets/nm_modules/` et l'étape de build (`@vercel/static-build`)
les re-place en `dist/assets/node_modules/`. Les URLs servies restent identiques.

## Historique
- Miroir initial : 102 fichiers byte-identiques (98/98 références de bundles vérifiées).
- Étape 1 : couleurs ARVX. Prochaines étapes : textes, logo/nom, notifications.
