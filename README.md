# ARVX — Application polyvalente

Nouvelle application **ARVX** (ex-ARVEXA) : **toutes les matières** (au-delà du BAC uniquement).
Base web moderne → deviendra une **application Android installable (APK)**.

## Étape actuelle — v0.4.2 Menu complet + déconnexion identique

- **Menu tiroir** :
  - **MON COMPTE** — Profil (→ `#/profil`), Ma classe, Mon abonnement
  - **INVITER DES GENS** — Inviter des camarades, Parrainage
  - **AIDE ET SUPPORT** — Rappels et notifications, Compte et suppression, Contacter le support
  - **Bas du menu** — « Rejoindre la communauté » (vert WhatsApp `#25D366`, logo WhatsApp,
    volontairement différent des autres items) puis Déconnexion.
- **Déconnexion identique au site actuel** : même popup de confirmation copié à l'identique
  (« Se déconnecter ? » / ⚠️ / « Tu devras te reconnecter… » / Annuler · Se déconnecter),
  mêmes fermetures (croix, Annuler, extérieur, Échap). La confirmation branchera Firebase
  Auth à l'étape backend.
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
5. Page d'accueil complète (toutes matières)
6. Navigation, matières, contenus
7. Service worker : cache complet, ouverture instantanée + hors ligne
8. Backend (Firebase) + fonctionnalités
9. Packaging APK (TWA signée, build automatique)
