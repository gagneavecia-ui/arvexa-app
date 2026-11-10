/* ═══════════════════════════════════════════════════════════════════
   ARVX — MAIN.JS (fondation)
   Même moteur de thème que ARVEXA School :
     · sombre par défaut, clair si localStorage 'arvexa-theme' = 'light'
     · meta theme-color synchronisée (barre système Android/PWA)
     · synchronisation entre onglets (événement storage)
     · API publique window.ARVEXA_THEME { get, set, toggle }

   v0.3 :
     · salutation dynamique — logique fidèle au site original :
       05h-12h Bonjour 🌅 · 12h-18h Bon après-midi ☀️ · sinon Bonsoir 🌙
     · nom de l'utilisateur : localStorage 'arvexa_user' { firstName }
       si présent, sinon « Élève » (valeur par défaut du site original)
     · menu tiroir : ouverture/fermeture (bouton, overlay, Échap)
     · bouton rafraîchir : rotation de l'icône (les données viendront
       avec le backend, à une prochaine étape)

   v0.3.1 :
     · marque ARVX — le nom affiché dans la salutation est « ARVX »
       avec le X en or dégradé (même traitement que le wordmark du
       menu). Un prénom d'utilisateur lié au compte prendra le
       relais à l'étape backend.

   v0.4 :
     · SPA — le document ne se recharge JAMAIS (principe AXIA :
       aucune navigation document, donc jamais de barre de
       chargement du navigateur). Les 5 onglets échangent 5 vues
       de façon synchrone, URL synchronisée en #/route, titre de
       l'onglet mis à jour, retour arrière du navigateur géré
       (événement hashchange), retour en haut à chaque vue.

   v0.4.1 :
     · menu tiroir rempli — 3 sections (Mon compte / Inviter des
       gens / Aide et support). Chaque item ferme le tiroir ; le
       profil navigue vers #/profil, les autres écrans seront
       branchés à leur étape. État actif de l'item « Profil »
       synchronisé avec la vue courante.

   v0.4.2 :
     · « Ma classe » ajoutée dans Mon compte.
     · bas du tiroir : « Rejoindre la communauté » (WhatsApp) et
       bouton Déconnexion.
     · modale de confirmation copiée à l'identique de l'original
       (window.arvexaConfirm + #arvexaConfirmModal) : mêmes textes,
       mêmes variantes danger/primary, mêmes fermetures (croix,
       Annuler, extérieur, Échap). Le bouton Déconnexion ouvre le
       MÊME popup que le site actuel (« Se déconnecter ? ») ; la
       confirmation appellera Firebase Auth à l'étape backend.
   ═══════════════════════════════════════════════════════════════════ */

const KEY = 'arvexa-theme';
const META_COLORS = { dark: '#0A0A0A', light: '#F5F1E8' };

/* ── THÈME ─────────────────────────────────────────────────────── */

const get = () => {
  try {
    return localStorage.getItem(KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
};

const updateMeta = (theme) => {
  for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
    meta.setAttribute('content', META_COLORS[theme] ?? META_COLORS.dark);
  }
};

const apply = (theme) => {
  const root = document.documentElement;
  if (theme === 'light') root.setAttribute('data-theme', 'light');
  else root.removeAttribute('data-theme');
  updateMeta(theme);
};

const set = (theme, persist = true) => {
  if (theme !== 'light' && theme !== 'dark') theme = 'dark';
  apply(theme);
  if (persist) {
    try { localStorage.setItem(KEY, theme); } catch { /* stockage indisponible */ }
  }
  window.dispatchEvent(new CustomEvent('arvexa-themechange', { detail: { theme } }));
};

const toggle = () => set(get() === 'light' ? 'dark' : 'light');

/* Application immédiate (synchronise avec le boot anti-flash du <head>) */
apply(get());

/* Synchronisation entre onglets */
window.addEventListener('storage', (e) => {
  if (!e.key || e.key === KEY) apply(get());
});

/* API publique — pour le futur réglage "Apparence" */
window.ARVEXA_THEME = { get, set, toggle };

/* ── SALUTATION (fidèle au site original, index.html:2560-2564) ── */

function getGreeting() {
  const hours = new Date().getHours();
  if (hours >= 5 && hours < 12) return { text: 'Bonjour', emoji: '🌅' };
  if (hours >= 12 && hours < 18) return { text: 'Bon après-midi', emoji: '☀️' };
  return { text: 'Bonsoir', emoji: '🌙' };
}

function applyGreeting() {
  const { text, emoji } = getGreeting();
  const greetingText = document.getElementById('greetingText');
  const greetingEmoji = document.getElementById('greetingEmoji');
  if (greetingText) greetingText.textContent = text;
  if (greetingEmoji) greetingEmoji.textContent = emoji;

  /* Nom : compte lié au backend plus tard. D'ici là, localStorage
     'arvexa_user' { firstName } si présent, sinon la marque « ARVX »
     avec le X en or dégradé (façon le wordmark du site original). */
  const userFirstName = document.getElementById('userFirstName');
  if (userFirstName) {
    let firstName = '';
    try {
      const user = JSON.parse(localStorage.getItem('arvexa_user') || 'null');
      firstName = (user && user.firstName) || '';
    } catch { /* JSON invalide */ }
    userFirstName.classList.remove('loading');
    if (firstName) {
      userFirstName.textContent = firstName;
    } else {
      userFirstName.innerHTML = 'ARV<span class="gold-x">X</span>';
    }
  }
}

applyGreeting();

/* ── MENU TIROIR (fidèle au site original, index.html:3947-3954) ── */

const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const menuToggle = document.getElementById('menuToggle');

function openMenu(open) {
  if (!sidebar || !sidebarOverlay) return;
  sidebar.classList.toggle('open', open);
  sidebarOverlay.classList.toggle('active', open);
  if (menuToggle) menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
}

menuToggle?.addEventListener('click', () => openMenu(!sidebar.classList.contains('open')));
sidebarOverlay?.addEventListener('click', () => openMenu(false));
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') openMenu(false);
});

/* ── RAFRAÎCHIR (visuel — les données suivront avec le backend) ── */

const refreshBtn = document.getElementById('refreshBtn');

refreshBtn?.addEventListener('click', () => {
  refreshBtn.classList.add('spinning');
  setTimeout(() => refreshBtn.classList.remove('spinning'), 800);
});

/* ═══════════════════════════════════════════════════════════════════
   ROUTEUR SPA — le document ne se recharge jamais (principe AXIA).
   Les onglets de la barre du bas échangent des vues présentes dans
   le DOM : basculement synchrone, aucune requête, aucune barre de
   chargement navigateur. L'URL suit en #/route (partageable, bouton
   retour du navigateur fonctionnel), le titre de l'onglet aussi.
   ═══════════════════════════════════════════════════════════════════ */

const VIEWS = ['accueil', 'reviser', 'examen', 'progression', 'profil'];
const TITLES = {
  accueil: 'ARVX',
  reviser: 'ARVX — Réviser',
  examen: 'ARVX — Examen',
  progression: 'ARVX — Progression',
  profil: 'ARVX — Profil',
};

const viewSections = new Map(VIEWS.map((n) => [n, document.getElementById('view-' + n)]));

const navButtons = new Map();
document.querySelectorAll('.bottom-nav button[data-route]').forEach((btn) => {
  if (VIEWS.includes(btn.dataset.route)) navButtons.set(btn.dataset.route, btn);
});

let currentView = null;

function showView(name, { animate = true } = {}) {
  if (!viewSections.has(name)) name = 'accueil';
  if (name === currentView) return;
  currentView = name;

  /* Vues : une seule visible (attribut hidden = pas de coût de rendu) */
  for (const [n, el] of viewSections) {
    if (!el) continue;
    const active = n === name;
    el.hidden = !active;
    el.classList.toggle('enter', active && animate);
    if (active && animate) {
      /* re-déclenche l'animation même si la classe était déjà posée */
      el.classList.remove('enter');
      void el.offsetWidth;
      el.classList.add('enter');
    }
  }

  /* Onglets : état actif + aria-current */
  for (const [n, btn] of navButtons) {
    const active = n === name;
    btn.classList.toggle('active', active);
    if (active) btn.setAttribute('aria-current', 'page');
    else btn.removeAttribute('aria-current');
  }

  /* Menu tiroir : item « Profil » actif quand la vue correspond */
  document.querySelectorAll('.sidebar .nav-item[data-route]').forEach((el) => {
    el.classList.toggle('active', el.dataset.route === name);
  });

  /* Titre de l'onglet navigateur / app */
  document.title = TITLES[name] || 'ARVX';

  /* Chaque vue s'ouvre en haut, instantanément */
  window.scrollTo(0, 0);
}

function parseHash() {
  const h = decodeURIComponent(location.hash.replace(/^#\/?/, '')).split('?')[0];
  return VIEWS.includes(h) ? h : 'accueil';
}

/* Clic sur un onglet : on change le hash, le routeur fait le reste.
   Aucune autre action — jamais de rechargement. */
for (const [name, btn] of navButtons) {
  btn.addEventListener('click', () => {
    const target = '#/' + name;
    if (location.hash === target) {
      showView(name, { animate: false }); /* déjà là : rien à animer */
      return;
    }
    location.hash = target;
  });
}

/* Retour/avant du navigateur, lien #/... : une seule source de vérité */
window.addEventListener('hashchange', () => showView(parseHash()));

/* Logo du menu → Accueil + fermeture du tiroir (pas de rechargement) */
const logoLink = document.querySelector('.sidebar .logo');
logoLink?.addEventListener('click', () => openMenu(false));

/* Éléments du menu : fermer le tiroir au clic. « Profil » navigue
   vers #/profil (le hash fait le reste) ; les autres écrans
   (abonnement, camarades, parrainage, rappels, compte, support)
   seront branchés chacun à leur étape — même principe SPA. */
document.querySelectorAll('.sidebar .nav-item').forEach((el) => {
  el.addEventListener('click', () => openMenu(false));
});

/* Amorçage : vue demandée dans l'URL, sinon Accueil.
   Hash inconnu au démarrage → réécrit proprement sans polluer l'historique. */
if (location.hash) {
  const h = location.hash.replace(/^#\/?/, '').split('?')[0];
  if (!VIEWS.includes(h)) location.replace('#/accueil');
}
showView(parseHash(), { animate: false });

/* ═══════════════════════════════════════════════════════════════════
   MODALE DE CONFIRMATION — copie fidèle du site original
   (index.html:3565-3616). window.arvexaConfirm({ title, message,
   icon, confirmText, cancelText, variant, onConfirm, onCancel }).
   Fermetures : croix, Annuler, clic extérieur, Échap.
   ═══════════════════════════════════════════════════════════════════ */

const confirmModal = document.getElementById('arvexaConfirmModal');
const confirmIconBox = document.getElementById('arvexaConfirmIconBox');
const confirmIcon = document.getElementById('arvexaConfirmIcon');
const confirmTitle = document.getElementById('arvexaConfirmTitle');
const confirmMessage = document.getElementById('arvexaConfirmMessage');
const confirmOk = document.getElementById('arvexaConfirmOk');
const confirmOkText = document.getElementById('arvexaConfirmOkText');
const confirmCancel = document.getElementById('arvexaConfirmCancel');
const confirmClose = document.getElementById('arvexaConfirmClose');

let confirmCallback = null;
let confirmCancelCb = null;
let confirmedFlag = false;

window.arvexaConfirm = function (options) {
  if (!confirmModal) return;
  confirmTitle.textContent = options.title || 'Confirmation';
  confirmMessage.innerHTML = options.message || 'Es-tu sûr de vouloir continuer ?';
  confirmIcon.textContent = options.icon || '⚠️';
  confirmOkText.textContent = options.confirmText || 'Confirmer';
  confirmCancel.textContent = options.cancelText || 'Annuler';
  confirmIconBox.className = 'arvexa-confirm-icon-box ' + (options.variant === 'primary' ? '' : 'danger');
  confirmOk.className = 'arvexa-confirm-btn ' + (options.variant === 'primary' ? 'primary' : 'danger');
  confirmCallback = options.onConfirm || null;
  confirmCancelCb = options.onCancel || null;
  confirmedFlag = false;
  confirmModal.classList.add('show');
  document.body.style.overflow = 'hidden';
};

function closeArvexaConfirm() {
  if (!confirmModal) return;
  confirmModal.classList.remove('show');
  document.body.style.overflow = '';
  const ccb = confirmCancelCb;
  confirmCallback = null;
  confirmCancelCb = null;
  if (!confirmedFlag && typeof ccb === 'function') ccb();
}

confirmCancel?.addEventListener('click', closeArvexaConfirm);
confirmClose?.addEventListener('click', closeArvexaConfirm);
confirmOk?.addEventListener('click', () => {
  const cb = confirmCallback;
  confirmedFlag = true;
  closeArvexaConfirm();
  if (typeof cb === 'function') cb();
});
confirmModal?.addEventListener('click', (e) => {
  if (e.target === confirmModal) closeArvexaConfirm();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && confirmModal?.classList.contains('show')) closeArvexaConfirm();
});

/* ── DÉCONNEXION — mêmes textes que le site original
   (handleLogout, index.html:3928-3936). La confirmation exécutera
   Firebase Auth signOut + redirection à l'étape backend. ── */

function performLogout() {
  /* Backend à venir : signOut(auth) puis écran d'accueil/connexion.
     Pour l'instant rien de plus — aucun compte n'est encore branché. */
}

const logoutBtn = document.getElementById('logoutBtn');
logoutBtn?.addEventListener('click', (e) => {
  e.preventDefault();
  window.arvexaConfirm({
    title: 'Se déconnecter ?',
    message: 'Tu devras te <strong>reconnecter</strong> pour accéder à ton compte.',
    icon: '⚠️',
    confirmText: 'Se déconnecter',
    cancelText: 'Annuler',
    variant: 'danger',
    onConfirm: performLogout,
  });
});
