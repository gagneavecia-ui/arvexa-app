/*
 * Service worker d'AXIA — l'app web hors-ligne, et la réception des pushes.
 *
 * Deux rôles sans rapport l'un avec l'autre, réunis ici parce qu'un site n'a
 * qu'un service worker :
 *
 *   1. Garder l'app elle-même (page, bundle, polices, wasm de la base locale, images)
 *      pour qu'elle s'ouvre SANS réseau, comme l'app native : les cours, les fiches
 *      et la révision vivent déjà dans la base locale du navigateur. Avant le
 *      30/10/2026, rien n'était gardé : hors connexion, la PWA ne s'ouvrait pas.
 *   2. Recevoir les notifications poussées par le serveur, et emmener l'élève au
 *      bon écran quand il appuie dessus. C'est le SEUL code d'AXIA qui tourne
 *      quand l'app web est fermée.
 */

/*
 * Une seule réserve, renouvelée par version : les fichiers de l'app portent leur
 * empreinte dans le nom (`index-<hash>.js`), une nouvelle version n'écrase donc rien,
 * et les fichiers d'une version qui n'est plus la page servie sont retirés.
 */
const SHELL = 'arvx-shell-v2';
/* Fichiers dont le nom change à chaque version : servis depuis la réserve d'abord. */
const IMMUTABLE = /^\/(_expo\/static|assets)\//;

self.addEventListener('install', (event) => {
  // La page et ses fichiers dès l'installation : la toute première visite suffit
  // ensuite pour rouvrir l'app hors-ligne.
  event.waitUntil(precacheShell().catch(() => undefined).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== SHELL && /-shell-/.test(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/**
 * Garde la page et les fichiers essentiels de la version en ligne (`precache.json`, cf.
 * `scripts/precache-manifest.js`), puis retire les bundles d'entrée d'une ancienne version.
 */
async function precacheShell() {
  const cache = await caches.open(SHELL);
  const page = await fetch('/', { cache: 'no-store' });
  if (!page.ok) return;
  const html = await page.clone().text();
  await cache.put('/', page);
  // La liste générée à la compilation ; à défaut, ce que la page charge elle-même.
  let wanted = [...html.matchAll(/(?:src|href)="(\/[^"]+)"/g)].map((m) => m[1]);
  try {
    const list = await fetch('/precache.json', { cache: 'no-store' });
    if (list.ok) wanted = await list.json();
  } catch (e) {
    /* Liste absente (build sans elle) : la page suffit pour démarrer. */
  }
  wanted = wanted.filter((u) => u !== '/' && !u.endsWith('/sw.js'));
  await Promise.all(
    wanted.map((u) =>
      cache.match(u).then((hit) => hit || fetch(u).then((r) => (r.ok ? cache.put(u, r) : undefined)).catch(() => undefined))
    )
  );
  // Ménage : les bundles d'entrée d'une ancienne version (les morceaux chargés à la
  // demande, eux, restent : ils se partagent souvent d'une version à l'autre).
  const keep = new Set(wanted);
  const entry = /\/_expo\/static\/js\/web\/(index|__common|__expo-metro-runtime)-/;
  for (const req of await cache.keys()) {
    const p = new URL(req.url).pathname;
    if (entry.test(p) && !keep.has(p)) await cache.delete(req);
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  /*
   * Seulement les lectures du site lui-même (pages, bundle, images). Un envoi (POST) ou
   * une requête vers un autre domaine (le stockage Supabase, l'API) passe directement
   * par le navigateur : relayé ici, son corps transitait en entier par le service worker
   * avant de repartir, et la page ne recevait AUCUN événement de progression -- la barre
   * de téléversement d'un import restait vide puis se remplissait d'un coup (2026-10-23).
   */
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname === '/sw.js') return;

  /*
   * Navigation (toute route de l'app, `/accueil`, `/tarifs`...) : le réseau d'abord,
   * pour toujours servir la dernière version, puis la page gardée si le réseau manque.
   * Toutes les routes sont la même page (application à page unique).
   */
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && !/\.html$/.test(url.pathname)) {
            // Nouvelle version en ligne : la réserve suit, sans retarder l'affichage.
            event.waitUntil(precacheShell().catch(() => undefined));
          }
          return response;
        })
        .catch(() =>
          caches
            .open(SHELL)
            .then((cache) => cache.match(url.pathname).then((hit) => hit || cache.match('/')))
            .then((hit) => hit || Response.error())
        )
    );
    return;
  }

  // Fichiers à empreinte : la réserve d'abord (ils ne changent jamais), le réseau sinon.
  if (IMMUTABLE.test(url.pathname)) {
    event.respondWith(
      caches.open(SHELL).then((cache) =>
        cache.match(request).then(
          (hit) =>
            hit ||
            fetch(request).then((response) => {
              if (response.ok && response.type === 'basic') cache.put(request, response.clone());
              return response;
            })
        )
      )
    );
    return;
  }

  // Le reste du site (icônes, manifeste) : le réseau, et la réserve s'il manque.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && response.type === 'basic') {
          const copy = response.clone();
          event.waitUntil(caches.open(SHELL).then((cache) => cache.put(request, copy)));
        }
        return response;
      })
      .catch(() => caches.open(SHELL).then((cache) => cache.match(request)).then((hit) => hit || Response.error()))
  );
});

/* ------------------------------------------------------------------ */
/* Réception d'un push                                                 */
/* ------------------------------------------------------------------ */

/**
 * Un push DOIT toujours aboutir à une notification visible.
 *
 * Ce n'est pas une préférence de produit mais une règle des plateformes : iOS
 * (depuis 16.4) et Chrome révoquent l'abonnement d'un site qui reçoit des pushes
 * sans rien afficher — le navigateur considère qu'on l'utilise comme un canal de
 * données clandestin. Un seul push silencieux peut donc faire perdre
 * définitivement le droit de notifier cet élève. D'où la notification de repli
 * ci-dessous : même sur une charge utile illisible, on affiche quelque chose.
 */
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    payload = {};
  }

  const data = payload.data && typeof payload.data === 'object' ? payload.data : {};
  const title = typeof payload.title === 'string' && payload.title ? payload.title : 'AXIA';
  const body = typeof payload.body === 'string' ? payload.body : '';
  const tag = typeof data.planId === 'string' && data.planId ? data.planId : 'axia';

  event.waitUntil(
    (async () => {
      /*
       * Fin de phase du Pomodoro : l'onglet, s'il vivait encore, l'a peut-être déjà
       * affichée lui-même à la seconde (cf. `scheduleTimerAlerts`). Le push doit
       * quand même afficher quelque chose (règle ci-dessus) : il REMPLACE donc la
       * notification de même `tag`, mais en silence — un second « Pause ! » sonore
       * dix secondes après le premier ferait croire à un bogue.
       */
      let alreadyShown = false;
      if (data.kind === 'timer') {
        try {
          const shown = await self.registration.getNotifications({ tag });
          alreadyShown = shown.length > 0;
        } catch (e) {
          alreadyShown = false;
        }
      }
      await self.registration.showNotification(title, {
        body,
        // iOS ignore ces icônes et utilise celle de l'app installée ; Android et
        // les navigateurs de bureau s'en servent. Le badge (barre d'état Android)
        // ne garde que la transparence : l'icône de l'app, opaque, y devenait un
        // carré plein. D'où le monogramme blanc ajouré
        // (scripts/generate-notification-icon.js).
        icon: '/icons/icon-192.png',
        badge: '/icons/badge-96.png',
        /*
         * Un `tag` égal à l'identifiant du plan fait qu'un rappel envoyé deux fois
         * REMPLACE le premier au lieu de s'empiler. `renotify` rend ce remplacement
         * audible : sans lui, la notification de remplacement arriverait en silence,
         * ce qui est précisément le défaut qu'on vient de corriger côté Android.
         */
        tag,
        renotify: !alreadyShown,
        data,
      });
    })()
  );

  // Si une fenêtre est ouverte, la cloche de l'en-tête doit se mettre à jour
  // sans attendre un rechargement (cf. `addReceivedListener`).
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          client.postMessage({ source: 'axia-push-received', target: data });
        }
      })
      .catch(() => undefined)
  );
});

/* ------------------------------------------------------------------ */
/* Appui sur une notification                                          */
/* ------------------------------------------------------------------ */

/**
 * Deux chemins, parce que l'app web peut être ouverte ou fermée :
 *
 *   ▸ OUVERTE — on la ramène au premier plan et on lui passe la cible par message.
 *     `useNotificationSync` l'attend (cf. `addResponseListener`).
 *   ▸ FERMÉE — on l'ouvre avec la cible dans l'URL, que `getLaunchTarget` relit au
 *     démarrage puis efface. C'est le cas le plus fréquent, et celui que les
 *     intégrations bâclées ratent : l'écouteur côté app n'existe pas encore au
 *     moment de l'appui qui vient de la lancer.
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};

  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      for (const client of clients) {
        if (new URL(client.url).origin !== self.location.origin) continue;
        client.postMessage({ source: 'axia-push', target: data });
        // `focus` peut être refusé si la fenêtre n'est pas focalisable : on a déjà
        // passé le message, l'app se mettra à jour quand l'élève y reviendra.
        if ('focus' in client) await client.focus().catch(() => undefined);
        return;
      }

      const url = '/?axia_push=' + encodeURIComponent(JSON.stringify(data));
      await self.clients.openWindow(url).catch(() => undefined);
    })()
  );
});

/**
 * Rotation d'abonnement par le navigateur.
 *
 * On ne peut pas le réenregistrer d'ici : l'appel au serveur exige la session de
 * l'élève, que ce contexte n'a pas. Le réabonnement se fait donc à la prochaine
 * ouverture de l'app, qui compare systématiquement l'abonnement courant à celui
 * qu'elle a enregistré. Cet écouteur n'existe que pour laisser une trace dans les
 * journaux du navigateur — sans lui, la perte serait totalement muette.
 * (Safari/iOS n'émet pas cet événement.)
 */
self.addEventListener('pushsubscriptionchange', () => {
  console.warn('[axia] abonnement push renouvelé par le navigateur — réenregistrement à la prochaine ouverture');
});
