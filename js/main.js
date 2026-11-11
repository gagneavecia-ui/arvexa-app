/* ═══════════════════════════════════════════════════════════════════
   ARVX — MAIN.JS (fondation)
   Même moteur de thème que ARVEXA School :
     · sombre par défaut, clair si localStorage 'arvexa-theme' = 'light'
     · meta theme-color synchronisée (barre système Android/PWA)
     · synchronisation entre onglets (événement storage)
     · API publique window.ARVEXA_THEME { get, set, toggle }

   v0.8 :
     · bouton RAFRAÎCHIR = vrai rechargement de la page (demande
       explicite) — la route est restaurée au boot depuis le hash ;
       le geste « tirer pour rafraîchir » du navigateur est rétabli
       (overscroll-behavior retiré côté CSS ; le document ne
       défile toujours pas).
     · rayons « aurora » recadrés signature ARVX (-148/-206, 640,
       pivot 6°) — empreinte géométrique distincte de la référence.

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

   v0.6 / v0.6.1 :
     · vue Accueil — BLOC 1 « carte statistiques » : la carte prend
       UN QUART du cadre entre la barre du haut et la barre du bas.
       Polyvalente (toutes matières — pas seulement le BAC) :
       à gauche le NOMBRE DE COURS de l'élève (+ cours lus et
       complétés), à droite un ANNEAU DE PROGRESSION (statistique
       visuelle, SVG), en bas la CITATION façon site original
       (2 citations au démarrage, tirée au hasard ; le bouton
       rafraîchir en propose une autre). Typographie expressive :
       Playfair Display pour le chiffre, le label et la citation.
       Valeurs d'exemple tant que les cours réels n'existent pas :
       localStorage 'arvexa-stats' { courses, done } prendra le
       relais.

   v0.6.2 :
     · BLOC 1bis « les deux modes » — deux mini-cartes côte à côte
       JUSTE AU-DESSOUS de la carte statistiques (position fidèle à
       l'app de référence AXIA : icône en haut, titre au milieu,
       sous-titre en bas — pas trop grandes, bien espacées, sans
       reprendre les couleurs de la référence). MODE RAPIDE (badge
       or) et MODE FOCUS (badge vert), traduits instantanément
       (FR/AN) via data-i18n — aucun handler pour l'instant, les
       modes seront branchés à leur étape.

   v0.6.3 / v0.6.4 :
     · CADRE VERROUILLÉ — plus AUCUN défilement nulle part : html,
       body et .page ont une hauteur exacte (100dvh) + overflow
       hidden + overscroll-behavior none ; chaque .view remplit
       exactement l'espace entre la barre du haut et la barre du
       bas. v0.6.3 avait aussi étendu la carte statistiques pour
       « remplir » l'espace : sur vrai téléphone elle débordait
       (mini-cartes coupées sous la barre du bas) — v0.6.4 la
       ramène à sa taille compacte (1/4 du cadre) et REMET la
       navigation sur les deux mini-cartes (boutons + effet
       d'appui), tout en gardant l'espace net de 16px entre la
       carte et elles. Les écrans cibles des modes seront branchés
       chacun à leur étape.

   v0.6.4 (suite) — NAVIGATION RÉELLE + ESPACE VIDE REMPLI :
     · les mini-cartes NAVIGUENT : Mode rapide → Réviser, Mode
       focus → Examen (SPA : le hash est la seule source de vérité,
       aucun rechargement — même moteur que la barre du bas) ;
     · l'espace vide sous les mini-cartes est rempli par les
       propositions demandées : carte « Continuer » (→ Réviser) et
       rangée « Actions rapides » 2×2 (Réviser / Examen /
       Progression / Profil) — la grille s'étire pour remplir
       EXACTEMENT l'espace jusqu'à la barre du bas (flex + min/max),
       ni vide, ni débordement ; sur les écrans courts (≤720px de
       hauteur) la carte Continuer s'efface et tout reste calé.

   v0.7 — VUE RÉVISER, structure de la page « cours » d'AXIA :
     · rayons aurora générés en SVG (mêmes paramètres géométriques
       qu'AXIA), anneau de progression, matières + badges « À jour »,
       libellés FR/AN exacts ;
   v0.7.1 — COULEURS EXACTES DU SITE : rayons recalibrés sur le
     vert de marque (émeraude / vert-or), teintes ARVX partout
     (voir design-system.css) ;
     · recherche qui FILTRE réellement (instantané, SPA) ;
     · les deux barres restent fixées : la liste défile À
       L'INTÉRIEUR du cadre — le document ne défile jamais.

   v0.7.2 — L'ACCUEIL REPREND LES DESIGN DE RÉVISER (demandes
     explicites) : la carte principale (stats) a l'arrière-plan
     EXACT de la carte héros de Réviser — vert de marque + radial
     or + rayons « aurora » (#statsRays peint par le MÊME
     générateur que #libRays), textes crème littéraux (la carte
     reste verte dans les deux thèmes) ; les autres cartes
     (mini-cartes de mode, Continuer, tuiles Actions rapides)
     passent au matériau EXACT de la carte matière « Sciences de
     la vie et de la Terre » : filet or .38, glow or, radius 18,
     pastilles or dégradées + encre #141210.
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
    'accueil.eyebrow': 'Mes cours',
    'accueil.coursLabel': 'cours',
    'accueil.lus': 'lus et complétés',
    'accueil.mode.rapide': 'Mode rapide',
    'accueil.mode.rapideSub': 'Révision éclair · 5 min',
    'accueil.mode.focus': 'Mode focus',
    'accueil.mode.focusSub': 'Cycles 25 / 5',
    'accueil.continuer': 'Continuer',
    'accueil.continuerSub': 'Ta dernière révision apparaîtra ici.',
    'accueil.actionsTitre': 'Actions rapides',
    'reviser.eyebrow': 'Bibliothèque',
    'reviser.titre': 'Mes cours',
    'reviser.ajouter': 'Ajouter',
    'reviser.recherche': 'Rechercher un cours, une matière…',
    'reviser.rouvrir': 'À rouvrir en premier',
    'reviser.reviser': 'Réviser ce cours',
    'reviser.fiches': '10 fiches dues',
    'reviser.matieres': 'Mes matières',
    'reviser.count': '1 matière · 1 cours',
    'reviser.subjectMeta': '1 cours · 1 chapitre',
    'reviser.ajour': 'À jour',
    'reviser.vide': 'Aucun cours pour l’instant.',
    'reviser.aucunResultat': 'Aucun résultat.',
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
    'accueil.eyebrow': 'My courses',
    'accueil.coursLabel': 'courses',
    'accueil.lus': 'read & completed',
    'accueil.mode.rapide': 'Quick mode',
    'accueil.mode.rapideSub': 'Flash review · 5 min',
    'accueil.mode.focus': 'Focus mode',
    'accueil.mode.focusSub': '25 / 5 cycles',
    'accueil.continuer': 'Continue',
    'accueil.continuerSub': 'Your latest revision will appear here.',
    'accueil.actionsTitre': 'Quick actions',
    'reviser.eyebrow': 'Library',
    'reviser.titre': 'My courses',
    'reviser.ajouter': 'Add',
    'reviser.recherche': 'Search for a course, a subject…',
    'reviser.rouvrir': 'Reopen first',
    'reviser.reviser': 'Revise this course',
    'reviser.fiches': '10 cards due',
    'reviser.matieres': 'My subjects',
    'reviser.count': '1 subject · 1 course',
    'reviser.subjectMeta': '1 course · 1 chapter',
    'reviser.ajour': 'Up to date',
    'reviser.vide': 'No courses yet.',
    'reviser.aucunResultat': 'No result.',
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
  /* placeholders (barre de recherche de la bibliothèque, v0.7) */
  document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
    const value = t(el.dataset.i18nPh);
    if (typeof value === 'string') el.setAttribute('placeholder', value);
  });
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    const active = btn.dataset.lang === lang;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
  applyGreeting();
  applyProfileCard();
  applyThemeButton();
  updateStatsCard();
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

/* ── VUE ACCUEIL — BLOC 1 : CARTE STATISTIQUES (v0.6.1) ──
   Polyvalente (toutes matières) : nombre de cours de l'élève,
   cours lus et complétés, anneau de progression et citation
   (façon le hero-quote de l'original — 2 citations pour débuter,
   tirée au hasard au démarrage, la langue bascule sans changer de
   citation). Tant que les cours réels n'existent pas, la carte
   affiche des valeurs d'exemple ; localStorage 'arvexa-stats'
   { courses, done } prendra le relais (backend / import de cours).
   La fonction est déclarée ici mais appelée dès le boot par
   applyLang() (hoisting) : aucune constante module-level, donc
   aucun risque de TDZ. ── */

function updateStatsCard(pickNewQuote) {
  /* Citations ARVX — 2 pour débuter, traduites FR / AN. */
  const QUOTES = [
    { fr: 'Chaque page lue rapproche ton objectif.', an: 'Every page you read brings your goal closer.' },
    { fr: 'Toute matière se dompte, un cours à la fois.', an: 'Any subject can be mastered, one course at a time.' },
  ];

  /* Citation tirée au hasard au démarrage et stable ensuite
     (la langue peut changer sans changer de citation) ; le
     bouton rafraîchir en tire une nouvelle (pickNewQuote). */
  if (pickNewQuote || updateStatsCard._qi === undefined) {
    updateStatsCard._qi = Math.floor(Math.random() * QUOTES.length);
  }

  const coursesEl = document.getElementById('statCourses');
  const doneEl = document.getElementById('statDone');
  const ringFill = document.getElementById('ringFill');
  const ringPct = document.getElementById('ringPct');
  const quoteEl = document.getElementById('quoteText');
  if (!coursesEl || !doneEl || !ringFill || !ringPct || !quoteEl) return;

  /* Statistiques : localStorage 'arvexa-stats' { courses, done }
     si présent, sinon les valeurs d'exemple (démo). */
  const STATS_KEY = 'arvexa-stats';
  const STATS_DEMO = { courses: 12, done: 7 };
  let stats = STATS_DEMO;
  try {
    const s = JSON.parse(localStorage.getItem(STATS_KEY) || 'null');
    if (s && Number.isFinite(s.courses) && s.courses > 0) stats = s;
  } catch { /* JSON invalide : on garde l'exemple */ }

  const courses = Math.max(0, Math.round(stats.courses));
  const done = Math.min(courses, Math.max(0, Math.round(stats.done || 0)));
  const pct = courses > 0 ? Math.round((done / courses) * 100) : 0;

  coursesEl.textContent = String(courses);
  doneEl.textContent = String(done);

  /* Anneau de progression : circonférence = 2π × 30 ≈ 188.5.
     L'arc rempli représente la part de cours lus et complétés. */
  const C = 2 * Math.PI * 30;
  ringFill.style.strokeDasharray = String(C);
  ringFill.style.strokeDashoffset = String(C * (1 - pct / 100));
  ringPct.innerHTML = pct + '<small>%</small>';

  /* Citation : « … » — même esprit que le hero-quote de l'original. */
  const q = QUOTES[updateStatsCard._qi];
  quoteEl.textContent = '« ' + (lang === 'an' ? q.an : q.fr) + ' »';
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

/* ── RAFRAÎCHIR (v0.8) — le bouton RAFRAÎCHIT VRAIMENT la page.
   Demande explicite : « j'essaie de rafraîchir la page, ça refuse,
   c'est bloqué ». Rétabli de deux façons :
   · le geste navigateur « tirer pour rafraîchir » fonctionne à
     nouveau (overscroll-behavior:none retiré — le document, lui,
     ne défile toujours pas) ;
   · ce bouton recharge la page : la route est restaurée au boot
     depuis le hash (#/…), l'app se rouvre exactement où elle
     était. Aucune navigation INTERNE ne recharge jamais (SPA). ── */

const refreshBtn = document.getElementById('refreshBtn');

refreshBtn?.addEventListener('click', () => {
  refreshBtn.classList.add('spinning');
  /* 280 ms : le temps de voir la rotation, puis rechargement réel */
  setTimeout(() => window.location.reload(), 280);
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

/* ── NAVIGATION SPA DEPUIS L'ACCUEIL (v0.6.4) ──
   Mini-cartes de mode, carte « Continuer » et tuiles d'actions :
   un seul chemin — le hash, la même source de vérité que la barre
   du bas. Aucune navigation document, aucune barre de chargement.
   Les cibles existent (vues déjà créées) ; les écrans DÉTAILLÉS
   (lecteur de révision, import de cours) viendront à leur étape. */
function goRoute(route) {
  if (!VIEWS.includes(route)) return;
  const target = '#/' + route;
  if (location.hash === target) showView(route, { animate: false });
  else location.hash = target;
}

document.getElementById('modeQuick')?.addEventListener('click', () => goRoute('reviser'));
document.getElementById('modeFocus')?.addEventListener('click', () => goRoute('examen'));
document.getElementById('continueCard')?.addEventListener('click', () => goRoute('reviser'));
document.querySelectorAll('.quick-tile[data-go]').forEach((tile) => {
  tile.addEventListener('click', () => goRoute(tile.dataset.go));
});

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

/* ═══════════════════════════════════════════════════════════════════
   VUE RÉVISER (v0.7 / v0.7.1) — structure de la page « cours »
   d'AXIA, couleurs exactes du site ARVX. Deux moteurs locaux : les
   rayons « aurora » de la carte héros (SVG généré une fois au
   démarrage, géométrie AXIA, teintes recalibrées sur le vert de
   marque) et la recherche qui filtre réellement la bibliothèque
   (instantané, aucun rechargement — SPA).
   Les boutons « Ajouter », « Réviser ce cours » et les cartes
   matière gardent leur effet d'appui : leurs écrans (import de
   cours, lecteur de révision) seront branchés chacun à leur étape,
   sur demande explicite.
   ═══════════════════════════════════════════════════════════════════ */

/* ── Rayons « aurora » — v0.8 : RECADRAGE SIGNATURE ARVX. Le disque
   SVG est positionné par le CSS (-148px, -206px, 640px, opacité
   0.5, pivot 6°) : la disposition n'est plus celle de la référence
   (-131px, -193px, 590px, opacité 0.55). 47 segments en deux
   rampes. Teintes RECALIBRÉES sur le vert de marque ARVX
   #1A3A2A : rampe 1 → vert émeraude bleuté, rampe 2 → vert-or
   sombre (l'équivalent des rampes ardoise d'AXIA, teintes ARVX).
   UN SEUL GÉNÉRATEUR peint les DEUX cartes depuis v0.7.2 : la
   carte héros de Réviser (#libRays) ET la carte principale de
   l'accueil (#statsRays — même arrière-plan, demande explicite).
   Décoratif : aria-hidden + pointer-events none. ── */
(function buildRays() {
  const COLORS = [
    'rgb(23, 49, 37)', 'rgb(23, 51, 39)', 'rgb(24, 53, 41)', 'rgb(24, 54, 42)',
    'rgb(25, 56, 44)', 'rgb(25, 58, 46)', 'rgb(26, 60, 48)', 'rgb(26, 61, 49)',
    'rgb(27, 63, 51)', 'rgb(27, 65, 53)', 'rgb(27, 67, 55)', 'rgb(28, 69, 57)',
    'rgb(28, 70, 58)', 'rgb(29, 72, 60)', 'rgb(29, 74, 62)', 'rgb(30, 76, 64)',
    'rgb(30, 77, 65)', 'rgb(31, 79, 67)', 'rgb(31, 81, 69)', 'rgb(24, 51, 38)',
    'rgb(27, 53, 37)', 'rgb(30, 54, 36)', 'rgb(34, 56, 35)', 'rgb(37, 57, 34)',
    'rgb(40, 59, 33)', 'rgb(43, 61, 32)', 'rgb(46, 62, 31)', 'rgb(50, 64, 30)',
    'rgb(53, 65, 29)', 'rgb(56, 67, 28)',
  ];
  const N = 47;
  const R = 295.2;
  let paths = '';
  for (let i = 0; i < N; i++) {
    const a1 = (i / N) * Math.PI * 2;
    const a2 = ((i + 1) / N) * Math.PI * 2;
    const x1 = (R + Math.cos(a1) * R).toFixed(1);
    const y1 = (R + Math.sin(a1) * R).toFixed(1);
    const x2 = (R + Math.cos(a2) * R).toFixed(1);
    const y2 = (R + Math.sin(a2) * R).toFixed(1);
    paths += '<path d="M' + R + ' ' + R + 'L' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2 + 'Z" fill="' + COLORS[i % COLORS.length] + '"></path>';
  }
  const svg = '<svg width="590" height="590" viewBox="0 0 590.4 590.4" focusable="false">' + paths + '</svg>';
  ['libRays', 'statsRays'].forEach((id) => {
    const holder = document.getElementById(id);
    if (holder) holder.innerHTML = svg;
  });
})();

/* ── Recherche bibliothèque — filtre réel et instantané. Chaque
   caractère compare le texte de la carte héros et des cartes
   matière ; l'état vide affiche « Aucun résultat. » quand rien ne
   correspond, « Aucun cours pour l'instant. » quand tout est vide. ── */
const libSearch = document.getElementById('libSearch');
const libCourse = document.getElementById('libCourse');
const libGrid = document.getElementById('libGrid');
const libEmpty = document.getElementById('libEmpty');
const libSubjectsHead = document.querySelector('.lib-subjects-head');

function filterLibrary() {
  if (!libSearch) return;
  const q = libSearch.value.trim().toLowerCase();
  let visible = 0;
  let subjectVisible = 0;

  if (libCourse) {
    const hit = !q || libCourse.textContent.toLowerCase().includes(q);
    libCourse.hidden = !hit;
    if (hit) visible++;
  }

  if (libGrid) {
    libGrid.querySelectorAll('.lib-subject').forEach((card) => {
      const hit = !q || card.textContent.toLowerCase().includes(q);
      card.hidden = !hit;
      if (hit) { visible++; subjectVisible++; }
    });
  }

  /* L'entête « Mes matières » disparaît si plus aucune matière */
  if (libSubjectsHead) {
    libSubjectsHead.hidden = !!q && subjectVisible === 0;
  }

  if (libEmpty) {
    libEmpty.hidden = visible > 0;
    libEmpty.textContent = q ? t('reviser.aucunResultat') : t('reviser.vide');
  }
}

libSearch?.addEventListener('input', filterLibrary);
