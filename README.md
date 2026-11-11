# ARVX — Application polyvalente

Nouvelle application **ARVX** (ex-ARVEXA) : **toutes les matières** (au-delà du BAC uniquement).
Base web moderne → deviendra une **application Android installable (APK)**.

## Étape actuelle — v0.8 Signature ARVX + rafraîchissement rétabli

### v0.8 — Retouches anti-copie (« on s'inspire, on ne copie pas ») + RAFRAÎCHIR

**Objectif** (demande explicite) : quelqu'un qui connaît AXIA ne doit plus
pouvoir dire que les cartes d'ARVX sont une copie — mêmes rôles visuels,
mais des matériaux, une géométrie et des interactions désormais propres à
ARVX, plus abouties que la référence.

**1. Les cartes (mini-modes, Continuer, tuiles Actions rapides, matières
de Réviser) passent au matériau « CARTES SIGNATURE ARVX »** :

- **Éclat or DIAGONAL** `linear-gradient(150deg, …)` — là où la référence
  pose un radial dans le coin haut-gauche, ARVX balaie la carte en
  diagonale (plus lumineux, moins reconnaissable) ;
- **« Soleil ARVX »** : deux **anneaux or concentriques** au coin
  haut-droit (empreinte de marque que la référence n'a pas) ;
- **Liseré or flottant à gauche** (`::before`, 3 px, arrondi, dégradé
  `--accent-bright` → translucide) — une « épingle de blason » sur chaque
  carte ;
- **Radius « feuille »** `18px 18px 18px 6px` — le coin bas-gauche
  adouci casse la géométrie uniforme de la référence ;
- **Ombre or portée vers le bas** + **appui réactif** (le filet d'or
  s'allume à l'appui) + **survol soulevé** sur souris — la référence est
  statique ;
- Bordure or assise `rgba(184,134,11,.34)` ;
- **Thème clair** : fond blanc plein + anneaux et éclat en **or profond**
  (`rgba(184,134,11,…)`) lisibles sur papier.

**2. La carte principale (accueil) et la carte héros (Réviser) passent au
matériau « HÉROS SIGNATURE ARVX »** (identique sur les deux vues) :

- Vert de marque `--primary` conservé ;
- **Anneaux or haut-droit** (rayons 140 / 176 px, arcs fins 2 px) ;
- **Éclat or bas-droit** — le radial or quitte le coin haut-gauche de la
  référence pour éclairer le bas de la carte (miroir) ;
- **Filet or INTÉRIEUR** (`inset 0 0 0 1px rgba(224,184,74,.10)`) —
  double encadrement « luxe » que la référence n'a pas ;
- **Rayons « aurora » RECADRÉS** : déplacés de (-131/-193, 590 px) à
  **(-148/-206, 640 px)**, opacité 0.5 et **pivot 6°** — la disposition
  des rais n'est plus superposable à celle d'AXIA ;
- La carte reste verte dans les deux thèmes (marque), textes crème
  littéraux, jauge or.

**3. RAFRAÎCHISSEMENT rétabli** (demande explicite : « j'essaie de
rafraîchir la page, ça refuse, c'est bloqué ») :

- `overscroll-behavior:none` **retiré** de `html`/`body` (et `contain`
  de la liste de Réviser) : le geste **« tirer pour rafraîchir »** du
  navigateur fonctionne à nouveau — le document, lui, ne défile toujours
  pas (cadre fixe intact) ;
- Le bouton **⟳ Rafraîchir** de la barre du haut **recharge vraiment la
  page** (rotation de l'icône puis `location.reload()`) — la route est
  restaurée au boot depuis le hash `#/…` : l'app se rouvre exactement où
  elle était ;
- **SPA intacte** : aucune navigation interne ne recharge jamais la page
  (marque 42, `performance.getEntriesByType('navigation')` reste à 1
  entre deux onglets).

### v0.7.2 — Cartes de l'accueil au style de Réviser (demande explicite)

- **Carte principale (stats)** : **arrière-plan EXACT de la carte héros de
  Réviser** — vert de marque `--primary` + radial or + **rayons « aurora »**
  (`#statsRays`, peint par le même générateur SVG que `#libRays`) + filet
  or 0.22 + radius 26. Textes en **crème littéral** `#F5F0E8` (Playfair
  pour le chiffre et la citation), jauge or, filet de citation or — la
  carte reste **verte dans les deux thèmes**, comme le héros ;
- **Mini-cartes de mode · Continuer · tuiles Actions rapides** : matériau
  **EXACT de la carte matière « Sciences de la vie et de la Terre »**
  (Réviser v0.7.1) — radial or `rgba(184,134,11,.08)`, **filet or .38**,
  glow or `.12`, radius 18 ;
- **Pastilles icônes or** (Mode rapide, Continuer, tuiles Réviser /
  Examen) : **dégradé or signature + encre `#141210`** — la pastille
  exacte de la carte matière ; Mode focus et Progression gardent leur
  voile vert (distinction deux tons ARVX) ;
- **Thème clair** : cartes secondaires = matériau SVT clair (fond blanc
  plein, même filet or .38 et glow or) ; la carte principale reste verte
  (marque) ;
- SPA, cadre verrouillé, navigation : inchangés et re-vérifiés.

### v0.7.1 — La vue Réviser passe aux couleurs ARVX (structure AXIA conservée)

Le squelette de la page « cours » d'AXIA reste identique (mesuré au
computed style sur https://axia-chi.vercel.app/cours), mais **toutes les
teintes sont désormais celles du site** — aucun héritage de couleur
AXIA ne subsiste :

- **Fond de page** : `var(--bg)` — sombre `#0A0A0A` / papier `#F5F1E8`
  (thème clair suit automatiquement les tokens du site) ;
- **Carte héros « À rouvrir en premier »** : **vert de marque**
  `var(--primary)` `#1A3A2A` + **radial or** dans le coin haut-gauche
  (le matériau exact des cartes accueil) + filet or 0.22 ; **rayons
  aurora** recalibrés sur le vert de marque (deux rampes : émeraude
  bleutée / vert-or sombre), anneau de progression **or**
  (`--accent-bright`), textes crème `#F5F0E8` ;
- **Bouton Réviser ce cours →** : **dégradé or signature du site**
  `linear-gradient(135deg, var(--accent), var(--accent-bright))`,
  encre `#141210`, glow or `rgba(184,134,11,.45)` — le même matériau
  que les pastilles Premium / avatar du menu ;
- **Pastilles matières** : dégradé or signature + encre `#141210` ;
  **bordures or** `rgba(184,134,11,.38)` + glow `rgba(184,134,11,.12)`
  (le rôle visuel des bordures ambre d'AXIA, teinte ARVX exacte) ;
- **Badges « À jour »** : **vert exact du site** `--success-light`
  `#3AB67E` sur voile `rgba(45,125,90,.16)` ;
- **Encres et textes** : tokens du site partout (`--text-light`,
  `--text-dim`, `--text-muted`), filet or de la recherche
  `rgba(184,134,11,.22)` ;
- **Thème clair** : papier + encre chaude automatiques via les tokens,
  la carte héros reste verte (marque) comme l'ardoise restait sombre
  chez AXIA.

### v0.7 — La vue Réviser est la page Cours d'AXIA, à l'identique (structure)

Copie mesurée **au computed style** sur https://axia-chi.vercel.app/cours
(compte de test créé pour inspecter la page remplie, thèmes clair/sombre
et libellés français exacts) :

- **En-tête bibliothèque** : eyebrow `BIBLIOTHÈQUE` (11px/600, +1.32px),
  titre **Mes cours** (26px/800), avatar doré ARVX, bouton **+ Ajouter**
  (pill 40px, radius 999 — crème sur sombre, encre sur papier) ;
- **Recherche** h42 radius 14 — **filtre réellement** cours et matières
  (instantané, SPA), état vide « Aucun résultat. » ;
- **Carte héros « À rouvrir en premier »** : voir v0.7.1 ci-dessus —
  **rayons aurora** (SVG 47 segments, deux rampes recalibrées, position
  exacte −131px/−193px, opacité 0.55), anneau de progression 66px,
  sous-titre matière · chapitre · fiches dues, **≈ 7 min** et bouton
  pill **Réviser ce cours →** ;
- **Mes matières** + compteur (« 1 matière · 1 cours »), cartes 2
  colonnes radius 18 (voir v0.7.1) ;
- **Libellés FR/AN exacts** (Bibliothèque/Library, Mes cours/My courses,
  À rouvrir en premier/Reopen first, Réviser ce cours/Revise this
  course, Mes matières/My subjects, À jour/Up to date…) ;
- **Cadre respecté** : les deux barres restent fixées, la liste défile
  **à l'intérieur** du cadre exactement comme AXIA — le document, lui,
  ne défile jamais (`scrollY = 0` vérifié après tentative à 800px) ;
- Valeurs d'exemple tant qu'aucun vrai cours n'existe (l'import de
  cours et le lecteur de révision viendront à leurs étapes).

### v0.6.4 — Navigation remise + espace vide rempli (demandes explicites)

- **Mini-cartes qui naviguent** : Mode rapide → **Réviser**, Mode focus →
  **Examen** — SPA pure (`location.hash`, même source de vérité que la
  barre du bas ; marque mémoire 42 intacte, `navigation = 1`) ;
- **L'espace vide sous les mini-cartes est rempli** :
  - carte **« Continuer »** (→ Réviser), façon AXIA, avec chevron ;
  - rangée **« Actions rapides » 2×2** (Réviser · Examen · Progression ·
    Profil) — chaque tuile navigue en SPA ;
  - la grille s'étire (`flex:1`, min 132 / max 244px) pour remplir
    **exactement** l'espace jusqu'à la barre du bas : plus aucun vide,
    rien ne déborde (vérifié à 360×780, ×740 et ×640) ;
  - sur les écrans courts (≤ 720px de hauteur) la carte Continuer
    s'efface et tout reste calé ;
- Filet ajouté : `.view[hidden]` et `.view-reviser [hidden]` ne peuvent
  plus être écrasés par `display:flex` ;
- 2 thèmes + FR/AN instantané re-vérifiés sur tous les nouveaux blocs.

## v0.6.3 — (remplacée par v0.6.4)

- Tentative « la carte remplit l'espace restant » : correcte en
  émulateur, **mais débordait sur vrai téléphone** (carte géante,
  mini-cartes coupées sous la barre). Annulée par v0.6.4 ; seuls le
  verrouillage du cadre et l'espace de 16px sont conservés.

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
