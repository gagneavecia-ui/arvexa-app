# Publier ARVX — guide pas à pas

Tout est prêt dans ce dépôt : le code complet, la pipeline CI, la page vitrine. Il reste quatre commandes à exécuter depuis une machine connectée au compte GitHub de l'écosystème ARVEXA.

## 1. Pousser sur le dépôt `arvexa-app`

Décision du propriétaire : la publication se fait sur le dépôt **`arvexa-app`** (script prêt : `scripts/publish_arvexa.sh`, il suffit de fournir un token GitHub).

Manuellement :

```bash
cd arvexa-mobile
git remote add origin https://github.com/ARVEXA/arvexa-app.git
git push -u origin main
```

## 2. Laisser la pipeline construire l'APK

La poussée déclenche automatiquement **Build APK** (onglet *Actions* du dépôt) :

1. `npm ci` — dépendances verrouillées par `package-lock.json`
2. `npx expo prebuild -p android --clean`
3. `./gradlew assembleRelease`
4. Artefact **ARVX-APK** téléchargeable (≈ 15–25 minutes au total)

## 3. Publier la Release publique

```bash
git tag v1.0.0
git push origin v1.0.0
```

Une Release **v1.0.0** est créée avec l'APK joint :
`https://github.com/ARVEXA/arvexa-app/releases/latest`

## 4. Déployer la page vitrine sur Vercel

La page vitrine (`landing/index.html`) est un fichier statique autonome.

```bash
cd landing
vercel --prod
```

(ou importer le dépôt dans Vercel avec *Root Directory* = `landing`)

Puis ouvrir `landing/index.html` et remplacer le lien de téléchargement provisoire par l'URL de la Release :

```
https://github.com/ARVEXA/arvexa-app/releases/latest/download/ARVX-1.0.0.apk
```

re-pousser, Vercel redéploie tout seul.

## Signer proprement (recommandé ensuite)

La v1 produit un APK signé avec la clé debug (installable immédiatement). Pour la boutique ou les mises à jour stables, générer un keystore dédié et ajouter les secrets `ARVX_KEYSTORE` / `ARVX_KEYSTORE_PASSWORD` à la pipeline — une étape de signature s'ajoutera au workflow sans toucher au reste.

## Ce qui reste ouvert (décisions du propriétaire)

- Source photo (OCR) et PDF intégré — phase 2, moteur à valider
- Synchronisation cloud Firebase — projet à trancher (arvexa-fbf10 vs nexgen-39043) + `google-services.json`
- Bascule aninka — traduction réelle à fournir avant d'activer l'entrée
