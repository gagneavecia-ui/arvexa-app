# AXIA — miroir 1:1 (branche de travail)

Copie complète, fichier par fichier, du site **https://axia-chi.vercel.app** — capturée le 2026-11-13.

## Contenu
- 102 fichiers, 14,3 Mo : bundles Expo (`_expo/static/`), chunks Mermaid (cartes mentales),
  sons, animations Rive, opérateurs mobile money, police MaterialCommunityIcons,
  WASM (rive, wa-sqlite), icônes PWA, `manifest.webmanifest`, `sw.js`, `precache.json`.
- Intégrité vérifiée : les 98 références uniques extraites des bundles existent toutes ici ;
  les 3 icônes manquantes côté local le sont aussi côté site d'origine (404 identique).

## Déploiement
`vercel.json` réécrit toutes les routes applicatives vers `/index.html` (SPA),
exactement comme l'original — `/accueil`, `/reviser`, `/examens`, `/progression`…
tout le reste (bundles, assets, service worker) est servi tel quel.

## Prochaine étape
Rebranding **étape par étape** vers l'identité ARVX (textes, couleurs, marque, icônes),
en gardant chaque fonctionnalité intacte.
