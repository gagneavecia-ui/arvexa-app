# ARVX — Application polyvalente

Nouvelle application **ARVX** (ex-ARVEXA) : **toutes les matières** (au-delà du BAC uniquement).
Base web moderne → deviendra une **application Android installable (APK)**.

## Étape actuelle — v0.3.1 Barre du haut + marque ARVX + barre du bas « luxe »

- **Barre du haut** fidèle au header d'accueil du site original : menu (ouvre un tiroir vide,
  à compléter), salutation dynamique (Bonjour 🌅 / Bon après-midi ☀️ / Bonsoir 🌙) + nom,
  notifications, profil, rafraîchissement.
- **Marque ARVX** : X en or dégradé (même traitement que le span doré du logo original) —
  dans la salutation et en haut du menu (Playfair Display, italique).
- **Barre de tâches fixe en bas « luxe »** : verre dépoli saturé, filet supérieur or qui
  s'estompe vers les bords, lueur d'ambiance, capsule or sur l'onglet actif, icône active
  en or dégradé + halo.
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
4. Page d'accueil complète (toutes matières)
5. Navigation, matières, contenus
6. Backend (Firebase) + fonctionnalités
7. Packaging APK (TWA signée, build automatique)
