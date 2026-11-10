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

   v0.5 :
     · switch de langue FR / AN dans le menu, à droite du logo
       ARVX — traduction instantanée de toute l'interface (menu,
       salutation, onglets du bas, popup, titres d'onglet) SANS
       aucun rechargement (principe AXIA). Choix mémorisé dans
       localStorage 'arvexa-lang', synchronisé entre onglets.
     · carte profil en tête du menu : avatar doré (initiale du
       nom), nom, badge du type de compte (Gratuit / Premium).
     · « Parrainage » devient « Ambassadeur ARVX » (médaille).

   v0.5.1 :
     · le bouton profil du header devient le bouton THÈME — bascule
       mode clair / mode sombre en un clic (le profil reste accessible
       dans le menu et la barre du bas). Icône soleil (mode sombre →
       passer en clair) ↔ lune (mode clair → passer en sombre),
       libellés traduits (FR/AN), instantané, aucun rechargement.

   v0.6 :
     · vue Accueil — BLOC 1 « carte objectif » : objectif de l'élève
       (examen + date), compte à rebours J-x et mini barre de
       progression vers la date (inspiré du compte à rebours BAC de
       l'original, réduit et générique — ARVX est polyvalent).
       Valeur d'exemple tant que le flux « choisir mon objectif »
       n'existe pas : localStorage 'arvexa-goal' { label, date, start }
       prendra le relais. Le bouton rafraîchir recalcule le compte.
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

/* Synchronisation entre onglets (thème + langue) */
window.addEventListener('storage', (e) => {
  if (!e.key || e.key === KEY) {
    apply(get());
    applyThemeButton();
  }
  if (!e.key || e.key === LANG_KEY) {
    lang = storedLang();
    applyLang();
    document.title = titleFor(currentView || 'accueil');
  }
});

/* API publique — pour le futur réglage "Apparence" */
window.ARVEXA_THEME = { get, set, toggle };

/* ── BOUTON THÈME DU HEADER (v0.5.1) — mode clair / sombre en un
   clic, à la place de l'ancien raccourci profil (doublon du menu et
   de la barre du bas). Soleil en mode sombre (→ passer en clair),
   lune en mode clair (→ passer en sombre). Instantané : une classe
   sur <html>, aucun rechargement. ── */

const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');

function applyThemeButton() {
  const current = get();
  if (themeIcon) themeIcon.className = current === 'light' ? 'fas fa-moon' : 'fas fa-sun';
  if (themeBtn) {
    const label = t(current === 'light' ? 'theme.toDark' : 'theme.toLight');
    themeBtn.setAttribute('aria-label', label);
    themeBtn.title = label;
  }
}

themeBtn?.addEventListener('click', () => toggle());
window.addEventListener('arvexa-themechange', applyThemeButton);
/* Initialisation de l'icône/libellé : via applyLang() (boot plus bas).
   NE PAS appeler applyThemeButton() ICI : t() lirait I18N avant son
   initialisation (TDZ) et tuerait tout le module en silence. */

/* ── LANGUE FR / AN — traduction instantanée, zéro rechargement ──
   Principe AXIA : changer de langue est un simple échange de textes
   dans le DOM (querySelectorAll('[data-i18n]')) — aucune navigation
   document, aucune barre de chargement, effet immédiat. */

const LANG_KEY = 'arvexa-lang';

const I18N = {
  fr: {
    'salut.matin': 'Bonjour',
    'salut.apresmidi': 'Bon après-midi',
    'salut.soir': 'Bonsoir',
    'theme.toLight': 'Passer en mode clair',
    'theme.toDark': 'Passer en mode sombre',
    'accueil.objectif': 'Objectif',
    'accueil.j': 'J',
    'accueil.status.temps': '🌱 Tu as le temps',
    'accueil.status.course': '⏳ La course est lancée',
    'accueil.status.sprint': '🔥 Sprint final',
    'accueil.status.fin': '🏁 Bonne chance !',
    'profil.defaultName': 'Élève',
    'plan.gratuit': 'Gratuit',
    'plan.premium': 'Premium',
    'menu.section.compte': 'Mon compte',
    'menu.section.inviter': 'Inviter des gens',
    'menu.section.aide': 'Aide et support',
    'menu.profil': 'Profil',
    'menu.classe': 'Ma classe',
    'menu.abonnement': 'Mon abonnement',
    'menu.camarades': 'Inviter des camarades',
    'menu.ambassadeur': 'Ambassadeur ARVX',
    'menu.notifications': 'Rappels et notifications',
    'menu.compte': 'Compte et suppression',
    'menu.support': 'Contacter le support',
    'menu.communaute': 'Rejoindre la communauté',
    'menu.deconnexion': 'Déconnexion',
    'nav.accueil': 'Accueil',
    'nav.reviser': 'Réviser',
    'nav.examen': 'Examen',
    'nav.progression': 'Progression',
    'nav.profil': 'Profil',
    'confirm.title': 'Confirmation',
    'confirm.defaultMessage': 'Es-tu sûr de vouloir continuer ?',
    'confirm.cancel': 'Annuler',
    'confirm.ok': 'Confirmer',
    'deco.title': 'Se déconnecter ?',
    'deco.message': 'Tu devras te <strong>reconnecter</strong> pour accéder à ton compte.',
    'deco.ok': 'Se déconnecter',
    'deco.cancel': 'Annuler',
  },
  an: {
    'salut.matin': 'Good morning',
    'salut.apresmidi': 'Good afternoon',
    'salut.soir': 'Good evening',
    'theme.toLight': 'Switch to light mode',
    'theme.toDark': 'Switch to dark mode',
    'accueil.objectif': 'Goal',
    'accueil.j': 'D',
    'accueil.status.temps': '🌱 You have time',
    'accueil.status.course': '⏳ The race is on',
    'accueil.status.sprint': '🔥 Final sprint',
    'accueil.status.fin': '🏁 Good luck!',
    'profil.defaultName': 'Student',
    'plan.gratuit': 'Free',
    'plan.premium': 'Premium',
    'menu.section.compte': 'My account',
    'menu.section.inviter': 'Invite people',
    'menu.section.aide': 'Help & support',
    'menu.profil': 'Profile',
    'menu.classe': 'My class',
    'menu.abonnement': 'My subscription',
    'menu.camarades': 'Invite classmates',
    'menu.ambassadeur': 'ARVX Ambassador',
    'menu.notifications': 'Reminders & notifications',
    'menu.compte': 'Account & deletion',
    'menu.support': 'Contact support',
    'menu.communaute': 'Join the community',
    'menu.deconnexion': 'Log out',
    'nav.accueil': 'Home',
    'nav.reviser': 'Revise',
    'nav.examen': 'Exam',
    'nav.progression': 'Progress',
    'nav.profil': 'Profile',
    'confirm.title': 'Confirmation',
    'confirm.defaultMessage': 'Are you sure you want to continue?',
    'confirm.cancel': 'Cancel',
    'confirm.ok': 'Confirm',
    'deco.title': 'Log out?',
    'deco.message': 'You will need to <strong>log in</strong> again to access your account.',
    'deco.ok': 'Log out',
    'deco.cancel': 'Cancel',
  },
};

function storedLang() {
  try {
    const s = localStorage.getItem(LANG_KEY);
    return s === 'an' ? 'an' : 'fr';
  } catch {
    return 'fr';
  }
}

let lang = storedLang();

function t(key) {
  return (I18N[lang] && I18N[lang][key]) ?? I18N.fr[key] ?? key;
}

function applyLang() {
  document.documentElement.setAttribute('lang', lang === 'an' ? 'en' : 'fr');
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const value = t(el.dataset.i18n);
    if (typeof value === 'string') el.textContent = value;
  });
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    const active = btn.dataset.lang === lang;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
  applyGreeting();
  applyProfileCard();
  applyThemeButton();
  updateGoalCard();
}

function setLang(next) {
  lang = next === 'an' ? 'an' : 'fr';
  try { localStorage.setItem(LANG_KEY, lang); } catch { /* stockage indisponible */ }
  applyLang();
  document.title = titleFor(currentView || 'accueil');
  window.dispatchEvent(new CustomEvent('arvexa-langchange', { detail: { lang } }));
}

document.querySelectorAll('.lang-btn').forEach((btn) => {
  btn.addEventListener('click', () => setLang(btn.dataset.lang));
});

applyLang();

/* ── SALUTATION (fidèle au site original, index.html:2560-2564) ── */

function getGreeting() {
  const hours = new Date().getHours();
  if (hours >= 5 && hours < 12) return { text: t('salut.matin'), emoji: '🌅' };
  if (hours >= 12 && hours < 18) return { text: t('salut.apresmidi'), emoji: '☀️' };
  return { text: t('salut.soir'), emoji: '🌙' };
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

/* ── CARTE PROFIL DU MENU (v0.5) — avatar (initiale du nom),
   nom, type de compte (Gratuit / Premium). Le compte réel
   (photo, plan) prendra le relais à l'étape backend via
   localStorage 'arvexa_user' { firstName, plan } puis Firebase. ── */

function applyProfileCard() {
  const nameEl = document.getElementById('profileName');
  const avatarEl = document.getElementById('profileAvatar');
  const planEl = document.getElementById('profilePlan');
  if (!nameEl || !avatarEl || !planEl) return;

  let firstName = '';
  let plan = 'gratuit';
  try {
    const user = JSON.parse(localStorage.getItem('arvexa_user') || 'null');
    if (user) {
      firstName = user.firstName || '';
      if (user.plan === 'premium') plan = 'premium';
    }
  } catch { /* JSON invalide */ }

  const name = firstName || t('profil.defaultName');
  nameEl.textContent = name;
  avatarEl.textContent = (name.trim().charAt(0) || 'A').toUpperCase();
  planEl.textContent = t(plan === 'premium' ? 'plan.premium' : 'plan.gratuit');
  planEl.classList.toggle('premium', plan === 'premium');
  planEl.classList.toggle('gratuit', plan !== 'premium');
}

/* ── VUE ACCUEIL — BLOC 1 : CARTE OBJECTIF (v0.6) ──
   Objectif de l'élève (examen + date) + compte à rebours J-x +
   progression du temps vers la date — même esprit que le compte à
   rebours BAC de l'original, réduit et générique (toutes matières).
   Tant que le flux « choisir mon objectif » n'existe pas, la carte
   affiche un exemple ; localStorage 'arvexa-goal' { label, date,
   start } prendra le relais (profil / backend). La fonction est
   déclarée ici mais appelée dès le boot par applyLang() (hoisting) :
   aucune constante module-level, donc aucun risque de TDZ. ── */

function dayDiff(from, to) {
  const a = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  const b = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  return Math.round((a - b) / 86400000);
}

function updateGoalCard() {
  const titleEl = document.getElementById('goalTitle');
  const metaEl = document.getElementById('goalMeta');
  const countEl = document.getElementById('goalCount');
  const fillEl = document.getElementById('goalFill');
  if (!titleEl || !metaEl || !countEl || !fillEl) return;

  /* Objectif : localStorage 'arvexa-goal' { label, date, start }
     si présent, sinon l'exemple affiché par défaut (démo). */
  const GOAL_KEY = 'arvexa-goal';
  const GOAL_DEMO = { label: 'Baccalauréat 2027', date: '2027-06-15', start: '2026-09-15' };
  let goal = GOAL_DEMO;
  try {
    const g = JSON.parse(localStorage.getItem(GOAL_KEY) || 'null');
    if (g && g.label && g.date) goal = g;
  } catch { /* JSON invalide : on garde l'exemple */ }

  const now = new Date();
  const [gy, gm, gd] = String(goal.date).split('-').map(Number);
  const exam = new Date(gy, (gm || 1) - 1, gd || 1);
  const days = dayDiff(now, exam);

  titleEl.textContent = goal.label;

  /* Compte à rebours : J-216 en français, D-216 en anglais. */
  countEl.textContent = days > 0 ? t('accueil.j') + '-' + days : '🏁';

  /* Statut selon le temps restant — même esprit que l'original
     (« 🌱 Tu as le temps » quand la date est encore loin). */
  let statusKey = 'accueil.status.temps';
  if (days <= 0) statusKey = 'accueil.status.fin';
  else if (days <= 60) statusKey = 'accueil.status.sprint';
  else if (days <= 180) statusKey = 'accueil.status.course';

  const dateStr = new Intl.DateTimeFormat(lang === 'an' ? 'en-GB' : 'fr-FR',
    { day: 'numeric', month: 'long', year: 'numeric' }).format(exam);
  metaEl.textContent = dateStr + ' · ' + t(statusKey);

  /* Barre : progression du temps entre le début des révisions et
     l'examen (comme la barre du compte à rebours de l'original). */
  let pct = 0;
  const [sy, sm, sd] = String(goal.start || '').split('-').map(Number);
  if (sy) {
    const start = new Date(sy, (sm || 1) - 1, sd || 1);
    const total = dayDiff(start, exam);
    const done = dayDiff(start, now);
    if (total > 0) pct = Math.min(100, Math.max(0, Math.round((done / total) * 100)));
  }
  fillEl.style.width = pct + '%';
}

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
  updateGoalCard(); /* recalcule le compte à rebours de l'objectif */
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
  accueil: { fr: 'ARVX', an: 'ARVX' },
  reviser: { fr: 'ARVX — Réviser', an: 'ARVX — Revise' },
  examen: { fr: 'ARVX — Examen', an: 'ARVX — Exam' },
  progression: { fr: 'ARVX — Progression', an: 'ARVX — Progress' },
  profil: { fr: 'ARVX — Profil', an: 'ARVX — Profile' },
};

function titleFor(name) {
  const entry = TITLES[name];
  return entry ? (entry[lang] || entry.fr) : 'ARVX';
}

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

  /* Titre de l'onglet navigateur / app (selon la langue courante) */
  document.title = titleFor(name);

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
    title: t('deco.title'),
    message: t('deco.message'),
    icon: '⚠️',
    confirmText: t('deco.ok'),
    cancelText: t('deco.cancel'),
    variant: 'danger',
    onConfirm: performLogout,
  });
});
