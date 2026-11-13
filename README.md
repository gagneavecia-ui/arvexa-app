# AXIA — miroir 1:1 (branche de travail)

Copie complète, fichier par fichier, du site **https://axia-chi.vercel.app** — capturée le 2026-11-13.
Vérification en direct : **102/102 fichiers byte-identiques** entre l'original et la copie
(https://axia-clone.vercel.app), empreintes SHA-256 comparées.

## Contenu
- Bundles Expo (`_expo/static/`), chunks Mermaid (cartes mentales), sons, animations Rive
  du tuteur, opérateurs mobile money, polices, WASM (rive, wa-sqlite), icônes PWA,
  `manifest.webmanifest`, `sw.js`, `precache.json`.
- Intégrité : les 98 références uniques extraites des bundles existent toutes ici ;
  les 3 icônes manquantes côté local le sont aussi côté site d'origine (404 identique).

## Particularité de déploiement (Vercel)
Vercel exclut tout dossier nommé `node_modules` du contenu statique téléversé.
Le miroir stocke donc ces 8 fichiers (police MaterialCommunityIcons, WASM rive et
wa-sqlite, icônes @react-navigation) sous **`assets/nm_modules/`**, et l'étape de
build (`package.json` + `vercel.json` → `@vercel/static-build`) les re-place en
**`dist/assets/node_modules/`** : les URLs servies restent strictement identiques à
l'original, sans toucher au moindre bundle. Les routes applicatives retombent sur
`/index.html` (SPA), comme l'original.

## Prochaine étape
Rebranding **étape par étape** vers l'identité ARVX (textes, couleurs, marque,
icônes), en gardant chaque fonctionnalité intacte.
