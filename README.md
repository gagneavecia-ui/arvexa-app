# ARVX — Application polyvalente

Nouvelle application **ARVX** (ex-ARVEXA) : **toutes les matières** (au-delà du BAC uniquement).
Base web moderne → deviendra une **application Android installable (APK)**.

## Étape actuelle — v0.6 Accueil : bloc 1 « carte objectif »

- **Carte objectif** en tête de l'accueil — héros **compact** qui résume
  l'objectif de l'élève en un coup d'œil (inspiration 30-40 % du compte à
  rebours BAC de l'original, réduite et **générique** : ARVX est polyvalent,
  pas seulement BAC) :
  - sur-titre **🎯 OBJECTIF** (petit, or, espacé) ;
  - nom de l'objectif (ex. « Baccalauréat 2027 ») ;
  - date de l'examen + statut selon le temps restant
    (🌱 Tu as le temps → ⏳ La course est lancée → 🔥 Sprint final → 🏁 Bonne chance !) ;
  - **compte à rebours** en pastille or : **J-217** (AN : **D-217**), calculé
    en direct depuis la date du jour — le bouton **rafraîchir** le recalcule ;
  - **mini barre de progression** or (temps écoulé entre le début des
    révisions et l'examen, comme la barre du compte à rebours original).
- **Valeur d'exemple affichée** tant que le flux « choisir mon objectif »
  n'existe pas : dès qu'il sera branché (profil/backend), localStorage
  `'arvexa-goal' { label, date, start }` prendra le relais automatiquement
  (testé : « Concours médecine 2027 » s'affiche instantanément).
- **Le cadre fixe est respecté** : blocs à hauteur constante, vue accueil
  centrée (`max-width 720px`), aucun défilement vertical de la page.
- **Traduit instantanément** (FR/AN) : OBJECTIF/GOAL, statuts, J-/D-, date
  formatée (`15 juin 2027` ↔ `15 June 2027`). Adaptable aux deux thèmes :
  matériaux identiques à la carte profil (radial or), or foncé lisible sur
  papier en mode clair, ombres chaudes.
- Preuves SPA re-vérifiées : marque mémoire `42` intacte après bascules
  thème + langue + navigation, `performance navigation = 1` (aucun
  rechargement du document).

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
5. ✅ Page d'accueil — bloc 1 « carte objectif » (blocs suivants : continuer, actions rapides, matières, question du jour)
6. Navigation, matières, contenus
7. Service worker : cache complet, ouverture instantanée + hors ligne
8. Backend (Firebase) + fonctionnalités
9. Packaging APK (TWA signée, build automatique)
