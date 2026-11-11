# ARVX — Application polyvalente

Nouvelle application **ARVX** (ex-ARVEXA) : **toutes les matières** (au-delà du BAC uniquement).
Base web moderne → deviendra une **application Android installable (APK)**.

## Étape actuelle — v0.6.3 Accueil : cadre verrouillé, espace net, remplissage

- **ZÉRO défilement, nulle part, jamais** (v0.6.3) : `html`, `body` et `.page`
  ont la hauteur **exacte** de l'écran (`100dvh`) + `overflow: hidden` +
  `overscroll-behavior: none` — défiler vers le bas est **impossible** sur
  toutes les pages, y compris le rebond Android. Chaque vue remplit
  **exactement** l'espace entre la barre du haut et la barre du bas
  (`flex: 1`, sans jamais passer sous la barre du bas).
- **Espace net sous la carte principale** : les deux mini-cartes n'étaient
  plus collées — `margin-top: 16px` (13px sur petits écrans) les détache
  proprement de la carte statistiques.
- **L'espace restant est REMPLI, tout reste calé** : la carte statistiques
  s'étend pour occuper tout l'espace libre au-dessus des mini-cartes
  (chiffres + anneau centrés verticalement, citation toujours calée en bas),
  les mini-cartes restent compactes juste au-dessus de la barre du bas.
  Vérifié au compteur : écart carte→mini-cartes 16px, mini-cartes→barre 12px,
  `scrollHeight = clientHeight` (360×780 et 360×640).
- **AUCUNE navigation sur les mini-cartes** : ce sont de simples `<div>` —
  plus de `<button>`, plus de `cursor: pointer`, plus d'effet d'appui, plus
  de contour de focus, et **aucun handler JS**. Chaque mode sera branché à
  son étape, sur demande explicite.
- Preuves SPA re-vérifiées : tentative de défilement 500px → `scrollY = 0`,
  marque mémoire 42 intacte après navigation, `navigation = 1`.

## v0.6.2 — Accueil : bloc 1bis « les deux modes »

- **Deux mini-cartes côte à côte JUSTE AU-DESSOUS de la carte statistiques** —
  position fidèle à l'app de référence (AXIA) : pas trop grandes mais bien
  espacées (grille 2 colonnes, écart 12px), même structure qu'elle :
  **icône en haut, titre au milieu, sous-titre en bas**.
- **Mode rapide** (⚡ badge or) — « Révision éclair · 5 min »
  et **Mode focus** (⏱ badge vert) — « Cycles 25 / 5 ».
  On reprend la POSITION de la référence, **pas ses couleurs** (pas de
  jaune/bleu) : matériaux ARVX — surface, bordure or subtile, badges
  or / vert de la palette, titres en **Playfair Display**.
- Traduits instantanément (FR/AN : Quick mode / Focus mode, Flash review ·
  5 min, 25 / 5 cycles), deux thèmes (papier & encre en clair : badges or
  foncé / vert foncé lisible). Les deux modes seront **branchés à leur
  étape** — pour l'instant, la carte.
- Preuves SPA re-vérifiées : marque mémoire 42 intacte, `navigation = 1`,
  pages fixes entre les barres (aucun défilement de la page).

## v0.6.1 — Accueil : bloc 1 « carte statistiques »

- **La carte prend UN QUART du cadre** entre la barre du haut et la barre du bas
  (`min-height : (100dvh − header − barre du bas) / 4`), centrée, jamais de
  défilement vertical de la page.
- **100 % polyvalente** (toutes matières — plus aucune mention BAC) :
  - **à gauche** : sur-titre **MES COURS**, le **nombre de cours** de l'élève
    en gros chiffre **Playfair Display** (or dégradé, façon le X du wordmark),
    le mot « cours » en italique serif, puis « **7 lus et complétés** » ;
  - **à droite** : un **anneau de progression** (SVG, trait or arrondi) avec
    le **pourcentage au centre** en Playfair — la part de cours lus et
    complétés (statistique visuelle, comme demandé) ;
  - **en bas** : la **citation façon site original** — Playfair italique +
    auteur « — ARVX » en petites capitales. **2 citations pour débuter**,
    tirée au hasard au démarrage ; le bouton **rafraîchir en propose une
    autre** ; la langue bascule (FR/AN) **sans changer de citation**.
- **Typographie expressive** (fini les écritures simples) : chiffre, label
  « cours » et citation en **Playfair Display** (serif de la marque) ;
  petits libellés UI en Inter — propre et cohérent.
- **Valeurs d'exemple** tant que les cours réels n'existent pas : dès que les
  cours existeront, localStorage `'arvexa-stats' { courses, done }` prendra le
  relais automatiquement (testé : { courses: 25, done: 10 } s'affiche
  instantanément avec l'anneau à 40 %).
- Traduit instantanément (FR/AN) : MES COURS / MY COURSes, « cours /
  courses », « lus et complétés / read & completed », citation. Adaptable aux
  deux thèmes : or foncé lisible sur papier en mode clair, ombres chaudes.
- Preuves SPA re-vérifiées : marque mémoire 42 intacte, `navigation = 1`.

## v0.5.1 — Bouton thème (clair/sombre) + menu v2

- **Bouton thème dans la barre du haut** (à la place du raccourci profil,
  doublon du menu et de la barre du bas) : mode clair / mode sombre **en un
  clic**, icône soleil ↔ lune, fondu doux à la bascule. Instantané, sans
  rechargement (principe AXIA), mémorisé (`localStorage 'arvexa-theme'`),
  synchronisé entre onglets, meta theme-color suivie.
- **Mode clair « papier & encre » aligné sur le site original** et assoupli
  pour le confort des yeux : fond `#F5F1E8`, surfaces blanches, encre
  `#262019`, **or foncé `#9A7209`** pour tous les textes dorés (lisible,
  jamais criard), encre chaude pour les voiles subtils (`rgb(32,27,18)`),
  bordures de cartes `rgba(184,134,11,.22)` comme l'original, ombres chaudes
  (jamais de gris froid), barres de défilement assorties au papier,
  badge Premium et avatar adaptés en or pâle + or foncé.

- **Langue dans le menu** : deux mini boutons **FR / AN** sur la ligne du logo ARVX
  (à droite), actif en or. La langue change **instantanément** — menu, salutation,
  onglets du bas, popup de déconnexion, titres d'onglet — **sans aucun rechargement**
  (principe AXIA). Choix mémorisé (`localStorage 'arvexa-lang'`), synchronisé entre
  onglets ouverts.
- **Carte profil** en tête du menu, avant MON COMPTE : photo de profil à gauche
  (avatar doré à l'initiale du nom), nom à droite et, au-dessous, le type de compte
  en badge — **Gratuit** (discret) ou **Premium** (or dégradé). Le compte connecté
  (photo, prénom, plan) prendra le relais à l'étape backend.
- **« Parrainage » devient « Ambassadeur ARVX »** (icône médaille), dans INVITER DES GENS.
- **Menu tiroir** :
  - **MON COMPTE** — Profil (→ `#/profil`), Ma classe, Mon abonnement
  - **INVITER DES GENS** — Inviter des camarades, Ambassadeur ARVX
  - **AIDE ET SUPPORT** — Rappels et notifications, Compte et suppression, Contacter le support
  - **Bas du menu** — « Rejoindre la communauté » (vert WhatsApp `#25D366`, logo WhatsApp,
    volontairement différent des autres items) puis Déconnexion.
- **Déconnexion identique au site actuel** : même popup de confirmation copié à l'identique
  (« Se déconnecter ? » / ⚠️ / « Tu devras te reconnecter… » / Annuler · Se déconnecter,
  traduit en AN), mêmes fermetures (croix, Annuler, extérieur, Échap). La confirmation
  branchera Firebase Auth à l'étape backend.
- Modale de confirmation réutilisable pour toutes les futures confirmations
  (`window.arvexaConfirm()`).
- **Principe AXIA appliqué** : une seule page qui **ne se recharge jamais** — aucune
  barre de chargement du navigateur, navigation synchrone entre les écrans.
- **5 vues SPA** (Accueil, Réviser, Examen, Progression, Profil) échangées par le
  routeur JS ; les vues sont vides, leur contenu arrive étape par étape.
- URL synchronisée (`#/accueil`, `#/reviser`…), titre d'onglet mis à jour,
  bouton retour du navigateur géré, retour en haut à chaque vue.
- Barre du haut : menu (tiroir), salutation dynamique
  (Bonjour 🌅 / Bon après-midi ☀️ / Bonsoir 🌙) + nom, notifications, profil,
  rafraîchissement.
- **Marque ARVX** : X en or dégradé (même traitement que le span doré du logo
  original) — dans la salutation et en haut du menu (Playfair Display, italique).
- **Barre de tâches fixe en bas « luxe »** : verre dépoli saturé, filet supérieur
  or qui s'estompe vers les bords, lueur d'ambiance, capsule or sur l'onglet
  actif, icône active en or dégradé + halo.
- Couleurs **fidèles** au site actuel (ARVEXA School v8.30) :
  - Thème sombre (défaut) : fond `#0A0A0A`, surface `#141414`, primaire `#1A3A2A`, or `#B8860B`, texte `#F5F0E8`.
  - Thème clair « papier & encre » prêt (`html[data-theme="light"]`, fond `#F5F1E8`, encre `#262019`).
- Même moteur de thème que le site actuel (localStorage `arvexa-theme`, anti-flash, meta theme-color).
- Typographie identique : **Playfair Display** (marque) + **Inter** (interface).
- PWA prête : `manifest.json`, icônes, thème système.

## Stack

HTML5 · CSS3 (custom properties) · JavaScript ES modules — aucune dépendance, aucun build.

## Feuille de route

1. ✅ Fondation design (page vide, couleurs fidèles)
2. ✅ Barre de tâches fixe en bas (5 onglets)
3. ✅ Barre du haut (menu, salutation + nom, notifications, profil, rafraîchir)
4. ✅ SPA : navigation instantanée entre les 5 vues (principe AXIA, zéro rechargement)
5. ✅ Page d'accueil — bloc 1 « carte statistiques » (1/4 du cadre : cours + anneau + citation ; blocs suivants : continuer, actions rapides, matières, question du jour)
6. Navigation, matières, contenus
7. Service worker : cache complet, ouverture instantanée + hors ligne
8. Backend (Firebase) + fonctionnalités
9. Packaging APK (TWA signée, build automatique)
