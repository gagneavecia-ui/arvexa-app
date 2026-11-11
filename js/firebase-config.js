/* ═══════════════════════════════════════════════════════════════════
   ARVX — FIREBASE CONFIG (v0.10)

   Config Web du projet Firebase « arvexa-fbf10 » (la même base que
   ARVEXA School — un compte y fonctionne dans les deux applications).

   · Cette config est PUBLIQUE par conception (identifiants d'aiguillage,
     pas des secrets) : la sécurité est assurée par les règles Firestore
     (chacun n'accède qu'à ses données) et par la liste des domaines
     autorisés côté Authentication.
   · La clé ADMIN (compte de service) ne transite JAMAIS côté client —
     elle reste réservée aux scripts serveur (scripts/verify_firebase.py…).
   · SDK modulaire v12 via CDN ESM (gstatic) — aucun build, cohérent
     avec le déploiement statique Vercel.
   ═══════════════════════════════════════════════════════════════════ */

import { initializeApp, getApps, getApp } from
  'https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js';
import { getAuth } from
  'https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js';
import { initializeFirestore, persistentLocalCache, persistentSingleTabManager } from
  'https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js';

export const firebaseConfig = {
  apiKey: 'AIzaSyDHscOXw3rLuhV6z1Cny-bdYCumqpnG7QE',
  authDomain: 'arvexa-fbf10.firebaseapp.com',
  projectId: 'arvexa-fbf10',
  appId: '1:920108330053:web:f532d71cbc2c824bc7472c',
};

/* initializeApp idempotent : un seul initializeApp même si le module
   était importé deux fois (aucun risque « Firebase App named … exists »). */
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

/* Firestore avec cache persistant (IndexedDB, un seul onglet) — la
   MÊME configuration que ARVEXA School : la lecture du profil et des
   données résiste au hors-ligne et aux rechargements. */
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentSingleTabManager(),
  }),
});
