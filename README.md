# ARVX — mobile

**Ton cours entre, ARVX s'occupe du reste.** ARVX est l'application de révision de l'écosystème ARVEXA : l'utilisateur fournit son propre cours — n'importe quel niveau, n'importe quelle matière — et l'application détecte la matière, rédige le résumé, construit l'explication pas à pas, fabrique les examens et mesure la progression.

Blueprint de référence : `ARVX-Blueprint-UX-UI-v3` (13 écrans, design system « Encre claire », référence produit AXIA).

## Le modèle en une phrase

> L'utilisateur ajoute un cours avec son titre — ARVX détecte la matière, résume, explique pas à pas, fabrique les questions. Aucune matière n'est préchargée : les cartes naissent des cours fournis.

- **Réviser** est la source de vérité (cours, matière détectée, résumé, étapes, banque de questions).
- **Examens** est la page la plus intelligente : branchée sur tout l'écosystème des cours, elle n'évalue que ce qui a été fourni.
- **Progression** connaît les deux : elle lit, recalcule, n'enregistre rien d'original.
- **Accueil** est directe : reprendre, trois chiffres, deux actions.
- **Profil** : identité, réglages, déconnexion confirmée.
- Navigation : **menu latéral unique** (hamburger), deux emplacements « Plus tard » réservés.

## Démarrage

```bash
npm install
npx expo start          # développe sur Expo Go ou émulateur
npm run typecheck       # vérification TypeScript stricte
```

## Construire l'APK

La pipeline GitHub Actions fait tout : `expo prebuild -p android --clean` puis `./gradlew assembleRelease`.

- Chaque poussée sur `main` → artefact `ARVX-APK` téléchargeable dans l'onglet Actions.
- Chaque tag `v*` (ex. `v1.0.0`) → **Release publique** avec l'APK joint, pointée par la page vitrine.

```bash
git tag v1.0.0
git push origin main v1.0.0
```

## Structure

```
app/                  # écrans (expo-router) — un fichier par écran wireframé
  _layout.tsx         # pile + polices Inter + splash
  bienvenue.tsx       # écran 1 — hors navigation
  index.tsx           # écran 2 — Accueil
  reviser.tsx         # écrans 4/5 — état vide, grille des matières
  matiere/[id].tsx    # écran 7 — liste des cours d'une matière
  cours/nouveau.tsx   # écran 6 — ajout + pipeline d'analyse
  cours/[id].tsx      # écran 8 — résumé, pas à pas, lien examen
  examens.tsx         # écran 9 — hub ciblé/global + historique
  examen/[id].tsx     # écrans 10/11 — passage immersif, résultats
  progression.tsx     # écran 12 — agrégat des deux pages sources
  profil.tsx          # écran 13 — identité, réglages, déconnexion
src/
  theme/tokens.ts     # design system « Encre claire » — jetons normatifs
  lib/analyseur.ts    # pipeline : détection, résumé, pas à pas, banque ≥ 20 questions
  lib/store.tsx       # store local (AsyncStorage) — producteurs uniques par donnée
  lib/aggregates.ts   # chiffres d'Accueil, états par matière, série, à renforcer
  components/         # boutons, champs, badges, cartes, anneau de score, menu latéral
landing/index.html    # page vitrine (Vercel) avec lien de téléchargement
```

## Le contrat d'interaction (respecté dans le code)

1. Le menu latéral est la seule navigation de premier niveau.
2. Un tap sur une carte matière ouvre la liste de ses cours — jamais directement une question.
3. La matière est déduite du contenu, présentée pour confirmation, corrigeable avant enregistrement.
4. Rien n'est enregistré sans validation ; abandonner l'ajout ne laisse aucune trace.
5. Une donnée n'est écrite que par sa page productrice.
6. Les deux seuls liens croisés : « Lancer un examen sur ce cours » et « Revoir le cours ».
7. Le retour revient toujours à l'écran précédent de la même page.
8. Quitter un examen en cours demande confirmation — les réponses validées sont conservées.
9. Toute suppression passe par une modale de confirmation rouge.
10. Un chiffre n'est jamais affiché sans donnée réelle derrière (« pas encore »).

## Design system « Encre claire »

Fond `#F6F7FB` · surfaces blanches · boutons principaux encre `#1F2A44` · couleurs vives réservées aux matières (7 pastilles attribuées à la détection) · Inter embarquée (400/500/700/800) · rayons 8/12/16/999 · gouttière 20 px.

## Hors ligne

L'analyse tourne entièrement sur l'appareil (aucun réseau requis). Une fois un cours enregistré, tout fonctionne sans connexion : résumé, pas à pas, examens dont les questions sont déjà fabriquées, progression.

## Feuille de route (phases 2 et 3)

Photo (reconnaissance de caractères) · PDF intégré · connexion Google · rappels de révision · flashcards et répétition espacée (inspiration AXIA) · thème sombre · Premium (paliers FCFA) · correction IA de réponses manuscrites · tuteur IA conversationnel · partage de cours · synchronisation cloud Firebase.

---

ARVX — écosystème ARVEXA. Version 1.0.0.
