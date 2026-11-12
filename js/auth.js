/* ═══════════════════════════════════════════════════════════════════
   ARVX — AUTH.JS (v0.10)
   Authentification réelle Firebase — même projet que ARVEXA School
   (un compte y fonctionne dans les deux applications).

   · GARDE DE ROUTE : onAuthStateChanged décide — non connecté, toute
     route mène à #/auth (la route demandée est mémorisée puis
     restaurée après connexion) ; connecté, #/auth ramène à l'app.
   · UNE SEULE PAGE : connexion + inscription (panneaux échangés sans
     rechargement) — design identique aux pages login.html /
     register.html du site original.
   · PROFIL Firestore users/{uid} : lecture résiliente (3 essais +
     relecture serveur) et AUTO-RÉPARATION (compte Auth sans document
     → recréation « étudiant gratuit » au lieu d'un cul-de-sac).
   · Inscription : profil créé avec retry ×3 ; si échec total, le
     compte Auth est supprimé (jamais de compte orphelin).
   · Erreurs Firebase traduites en français ; toasts du design
     original (injection sécurisée par textContent).
   · Déconnexion réelle : window.ARVXA_AUTH.signOut() (main.js).
   ═══════════════════════════════════════════════════════════════════ */

import { app, auth, db } from './firebase-config.js';
import {
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js';
import {
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js';

/* ── Persistance de session (IndexedDB — identique à l'original) ── */
try {
  await setPersistence(auth, browserLocalPersistence);
} catch (e) {
  console.warn('[Auth] Persistance locale indisponible :', e.code || e.message);
}

/* ═══════════════════════════════════════════════════════════════════
   DOM
   ═══════════════════════════════════════════════════════════════════ */

const $ = (id) => document.getElementById(id);

const viewAuth = $('view-auth');
const tabs = $('authTabs');
const tabLogin = $('authTabLogin');
const tabRegister = $('authTabRegister');
const panelLogin = $('authPanelLogin');
const panelRegister = $('authPanelRegister');
const headerLink = $('authHeaderLink');
const headerLinkIcon = $('authHeaderLinkIcon');
const headerLinkText = $('authHeaderLinkText');
const goRegister = $('authGoRegister');
const goLogin = $('authGoLogin');
const toastContainer = $('authToastContainer');

/* Connexion */
const loginForm = $('authLoginForm');
const loginEmail = $('authLoginEmail');
const loginPassword = $('authLoginPassword');
const loginBtn = $('authLoginBtn');
const loginEmailWrap = $('authLoginEmailWrap');
const loginPwdWrap = $('authLoginPwdWrap');
const loginEmailStatus = $('authLoginEmailStatus');
const loginPwdStatus = $('authLoginPwdStatus');
const loginEmailHelp = $('authLoginEmailHelp');
const loginPwdHelp = $('authLoginPwdHelp');
const rememberMe = $('authRememberMe');
const toggleLoginPwd = $('authLoginToggle');
const forgotBtn = $('authForgot');

/* Inscription */
const registerForm = $('authRegisterForm');
const firstName = $('authFirstName');
const lastName = $('authLastName');
const regEmail = $('authRegisterEmail');
const establishment = $('authEstablishment');
const regPassword = $('authRegisterPassword');
const confirmPassword = $('authConfirmPassword');
const registerBtn = $('authRegisterBtn');
const termsCheckbox = $('authTermsCheckbox');
const termsBox = $('authTermsBox');
const termsError = $('authTermsError');
const toggleRegPwd = $('authRegisterToggle');
const toggleConfirmPwd = $('authConfirmToggle');
const pwdStrength = $('authPwdStrength');
const pwdStrengthLabel = $('authPwdStrengthLabel');

/* ═══════════════════════════════════════════════════════════════════
   MESSAGES — erreurs de validation et erreurs Firebase traduites.
   (Les textes STATIQUES de la page sont dans main.js I18N ; ici ce
   sont les messages DYNAMIques, choisis au moment de l'affichage.)
   ═══════════════════════════════════════════════════════════════════ */

const MSG = {
  fr: {
    emailInvalide: 'Format d’e-mail invalide',
    mdpCourt: 'Le mot de passe doit contenir au moins 6 caractères',
    prenomRequis: 'Le prénom est requis',
    prenomCourt: 'Au moins 2 caractères',
    nomRequis: 'Le nom est requis',
    nomCourt: 'Au moins 2 caractères',
    emailRequis: 'L’e-mail est requis',
    mdpRequis: 'Le mot de passe est requis',
    mdp6: 'Au moins 6 caractères',
    confirmRequis: 'Confirme ton mot de passe',
    confirmDiff: 'Les mots de passe ne correspondent pas',
    caracteresRefuses: 'Caractères non autorisés',
    verifieChamps: 'Vérifie les champs en rouge',
    forgotEntreeEmail: 'Entre ton e-mail ci-dessus, puis reclique.',
    resetEnvoye: 'E-mail de réinitialisation envoyé ! Vérifie ta boîte de réception.',
    aucunCompte: 'Aucun compte trouvé avec cet e-mail.',
    tropTentatives: '⏳ Trop de tentatives. Réessaie dans quelques minutes.',
    mdpIncorrect: '❌ Mot de passe incorrect.',
    compteDesactive: '❌ Ce compte a été désactivé. Contacte le support.',
    reseau: '📶 Problème de connexion. Vérifie ta connexion internet.',
    emailDejaUtilise: 'Cette adresse e-mail est déjà utilisée.',
    mdpFaible: 'Le mot de passe est trop faible (6 caractères min).',
    inscriptionDesactivee: 'L’inscription est temporairement désactivée.',
    profilEchec: 'Impossible de créer ton profil. Vérifie ta connexion et réessaie.',
    erreurGenerique: '❌ Une erreur est survenue. Réessaie.',
    compteCree: 'Compte créé avec succès !',
    connexionReussie: '✅ Connexion réussie !',
    profilRestaure: '✅ Ton profil a été restauré, connexion en cours…',
    compteBloque: '❌ Ton compte est bloqué. Contacte le support.',
    horsLigne: 'Profil indisponible hors ligne — certaines données peuvent manquer.',
    verifCompte: 'Impossible de vérifier ton compte pour le moment. Réessaie.',
  },
  an: {
    emailInvalide: 'Invalid email format',
    mdpCourt: 'Password must be at least 6 characters',
    prenomRequis: 'First name is required',
    prenomCourt: 'At least 2 characters',
    nomRequis: 'Last name is required',
    nomCourt: 'At least 2 characters',
    emailRequis: 'Email is required',
    mdpRequis: 'Password is required',
    mdp6: 'At least 6 characters',
    confirmRequis: 'Please confirm your password',
    confirmDiff: 'Passwords do not match',
    caracteresRefuses: 'Unauthorized characters',
    verifieChamps: 'Check the fields in red',
    forgotEntreeEmail: 'Enter your email above, then click again.',
    resetEnvoye: 'Reset email sent! Check your inbox.',
    aucunCompte: 'No account found with this email.',
    tropTentatives: '⏳ Too many attempts. Try again in a few minutes.',
    mdpIncorrect: '❌ Incorrect password.',
    compteDesactive: '❌ This account has been disabled. Contact support.',
    reseau: '📶 Network problem. Check your internet connection.',
    emailDejaUtilise: 'This email address is already in use.',
    mdpFaible: 'The password is too weak (6 characters min).',
    inscriptionDesactivee: 'Sign-up is temporarily disabled.',
    profilEchec: 'Could not create your profile. Check your connection and try again.',
    erreurGenerique: '❌ Something went wrong. Try again.',
    compteCree: 'Account created successfully!',
    connexionReussie: '✅ Signed in successfully!',
    profilRestaure: '✅ Your profile has been restored, signing in…',
    compteBloque: '❌ Your account is blocked. Contact support.',
    horsLigne: 'Profile unavailable offline — some data may be missing.',
    verifCompte: 'Cannot verify your account right now. Try again.',
  },
};

function m(key) {
  const l = window.ARVXA_lang ? window.ARVXA_lang() : 'fr';
  return (MSG[l] && MSG[l][key]) ?? MSG.fr[key] ?? key;
}

/* ═══════════════════════════════════════════════════════════════════
   TOASTS — design original (login.html:364-409), injection sécurisée
   ═══════════════════════════════════════════════════════════════════ */

function buildToast(type) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = document.createElement('i');
  icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
  toast.appendChild(icon);
  const span = document.createElement('span');
  toast.appendChild(span);
  return { toast, span };
}

function showToast(message, type = 'success', duration = 4000) {
  if (!toastContainer) return;
  const { toast, span } = buildToast(type);
  span.textContent = String(message);
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ═══════════════════════════════════════════════════════════════════
   GARDE DE ROUTE — SPA : le hash est la seule source de vérité
   ═══════════════════════════════════════════════════════════════════ */

/* v0.13 — SEANCE / RAPIDE / FOCUS protégées comme les autres.
   BIENVENUE (#/bienvenue) est PUBLIQUE : c'est la page de porte
   d'entrée, visible sans compte (comme une landing). */
const PROTECTED_ROUTES = ['accueil', 'reviser', 'examen', 'progression', 'profil', 'seance', 'rapide', 'focus'];
const PUBLIC_ROUTES = ['bienvenue'];
const PENDING_KEY = 'arvx_pending_route';

function currentRoute() {
  return decodeURIComponent(location.hash.replace(/^#\/?/, '')).split('?')[0];
}

function consumePendingRoute() {
  try {
    const r = sessionStorage.getItem(PENDING_KEY);
    sessionStorage.removeItem(PENDING_KEY);
    return r && r !== 'auth' && PROTECTED_ROUTES.includes(r) ? r : null;
  } catch {
    return null;
  }
}

/* Non connecté → #/auth (la route demandée est mémorisée).
   Exception : les routes PUBLIQUES (#/bienvenue) restent accessibles. */
function forceAuthView() {
  const route = currentRoute();
  if (route === 'auth') return;
  if (PUBLIC_ROUTES.includes(route)) return;
  if (PROTECTED_ROUTES.includes(route)) {
    try { sessionStorage.setItem(PENDING_KEY, route); } catch { /* stockage indisponible */ }
  }
  if (location.hash !== '#/auth') location.replace('#/auth');
}

/* Connecté → on quitte #/auth vers la route demandée (ou l'accueil). */
function exitAuthView() {
  if (currentRoute() !== 'auth') return;
  const target = consumePendingRoute() || 'accueil';
  location.hash = '#/' + target;
}

/* Garde en continu : chaque navigation SPA est vérifiée. */
window.addEventListener('hashchange', () => {
  if (!authReady) return; /* le boot est géré par onAuthStateChanged */
  const user = auth.currentUser;
  const route = currentRoute();
  if (!user && route !== 'auth' && !PUBLIC_ROUTES.includes(route)) {
    forceAuthView();
  } else if (user && route === 'auth' && currentUid) {
    location.replace('#/' + (consumePendingRoute() || 'accueil'));
  }
});

/* ═══════════════════════════════════════════════════════════════════
   PROFIL FIRESTORE — lecture résiliente + auto-réparation (v9.0 de
   l'original) : 3 essais, relecture FORCÉE sur le serveur si le
   snapshot semble vide (cache périmé), recréation « étudiant
   gratuit » si le document a vraiment disparu.
   ═══════════════════════════════════════════════════════════════════ */

const MAX_PROFILE_READS = 3;

async function readProfile(user) {
  const userRef = doc(db, 'users', user.uid);
  let lastErr = null;
  for (let attempt = 1; attempt <= MAX_PROFILE_READS; attempt++) {
    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) return snap;
      try {
        return await getDocFromServer(userRef);
      } catch (e2) {
        if (e2 && (e2.code === 'permission-denied' || e2.code === 'unauthenticated')) throw e2;
        lastErr = e2;
      }
    } catch (e) {
      lastErr = e;
    }
    if (attempt < MAX_PROFILE_READS) {
      await new Promise((r) => setTimeout(r, attempt === 1 ? 800 : 2000));
    }
  }
  throw lastErr || new Error('profil_illisible');
}

async function createMissingProfile(user) {
  const now = serverTimestamp();
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    firstName: '',
    lastName: '',
    fullName: '',
    email: user.email || '',
    establishment: '',
    classId: 'terminale_d',
    exam: 'bac',
    role: 'student',
    onboardingCompleted: false,
    premium: false,
    isUnlocked: false,
    hasDeposited: false,
    accountStatus: 'active',
    plan: 'gratuit',
    stats: { courses: 0, done: 0 },
    totalStudyTime: 0,
    createdAt: now,
    updatedAt: now,
  });
}

/* Profil → app : window.ARVXA_PROFILE + localStorage 'arvexa_user'
   { firstName, plan } (lu par la salutation et la carte du menu). */
function readCachedUser() {
  try {
    return JSON.parse(localStorage.getItem('arvexa_user') || 'null');
  } catch {
    return null;
  }
}

function publishProfile(uid, data) {
  const d = data || {};
  const profile = {
    uid,
    firstName: d.firstName || '',
    lastName: d.lastName || '',
    email: d.email || '',
    plan: d.premium ? 'premium' : (d.plan === 'premium' ? 'premium' : 'gratuit'),
    stats:
      d.stats && Number.isFinite(d.stats.courses)
        ? { courses: d.stats.courses, done: d.stats.done || 0 }
        : { courses: 0, done: 0 },
  };
  window.ARVXA_PROFILE = profile;
  try {
    localStorage.setItem('arvexa_user', JSON.stringify(profile));
  } catch { /* stockage indisponible */ }
  window.dispatchEvent(new CustomEvent('arvexa-profile'));
}

async function hardSignOut() {
  try { await signOut(auth); } catch (e) { console.warn('[Auth] signOut :', e.code || e.message); }
  try { localStorage.removeItem('arvexa_user'); } catch { /* stockage indisponible */ }
  window.ARVXA_PROFILE = null;
}
window.ARVXA_AUTH = { signOut: hardSignOut };

/* ═══════════════════════════════════════════════════════════════════
   RÉSOLUTION DE L'ACCÈS — un seul chemin (comme l'original) :
   lecture profil → statut → publication → sortie de l'écran auth.
   ═══════════════════════════════════════════════════════════════════ */

let authReady = false;
let currentUid = null;       /* uid dont l'accès est résolu */
let resolvingUid = null;     /* lecture de profil en cours */
let registeringUid = null;   /* uid de l'inscription en cours */
let registering = false;     /* VRAI dès AVANT createUserWithEmailAndPassword :
   onAuthStateChanged peut fire AVANT la résolution de la promesse —
   sans ce drapeau, attemptAccess partirait en lecture AVANT l'écriture
   du profil (et l'auto-réparation écraserait le prénom par un doc vide). */

async function attemptAccess(user) {
  if (!user) return;
  if (resolvingUid === user.uid || currentUid === user.uid) return;
  resolvingUid = user.uid;

  let data = null;
  let readFailed = false;

  try {
    const snap = await readProfile(user);
    if (snap && snap.exists()) data = snap.data();
  } catch (err) {
    console.warn('[Auth] Lecture du profil échouée :', err.code || err.message);
    readFailed = true;
  }

  /* Auto-réparation : compte Auth présent, document absent. */
  if (!data && !readFailed) {
    try {
      await createMissingProfile(user);
      const snap = await getDoc(doc(db, 'users', user.uid));
      data = snap.exists() ? snap.data() : null;
      showToast(m('profilRestaure'), 'success', 2600);
    } catch (repairErr) {
      console.warn('[Auth] Auto-réparation impossible :', repairErr.code || repairErr.message);
      readFailed = true;
    }
  }

  /* Compte bloqué → déconnexion immédiate. */
  if (data && data.accountStatus === 'blocked') {
    await hardSignOut();
    showToast(m('compteBloque'), 'error', 6000);
    resolvingUid = null;
    resetLoginButton();
    return;
  }

  /* Lecture impossible (hors ligne) → entrée dégradée avec le cache
     local ; le profil se resynchronisera au retour du réseau. */
  if (!data) {
    const cached = readCachedUser();
    data = {
      firstName: (cached && cached.firstName) || '',
      lastName: (cached && cached.lastName) || '',
      email: user.email || '',
      premium: false,
      plan: 'gratuit',
      stats: { courses: 0, done: 0 },
    };
    if (!cached || !cached.firstName) {
      showToast(m('horsLigne'), 'error', 5000);
    }
  }

  currentUid = user.uid;
  resolvingUid = null;
  publishProfile(user.uid, data);
  window.ARVXA_AUTH_READY = true;
  exitAuthView();
  hideVeil();
}

function hideVeil() {
  if (typeof window.ARVXA_hideVeil === 'function') window.ARVXA_hideVeil();
}

function resetLoginButton() {
  if (!loginBtn) return;
  loginBtn.disabled = false;
  loginBtn.classList.remove('loading');
}

/* ═══════════════════════════════════════════════════════════════════
   onAuthStateChanged — point d'entrée unique (comme l'original)
   ═══════════════════════════════════════════════════════════════════ */

onAuthStateChanged(auth, (user) => {
  authReady = true;
  window.ARVXA_AUTH_READY = true;

  if (user) {
    /* Inscription en cours : le formulaire publie le profil lui-même
       (sinon l'auto-réparation écraserait le prénom par un doc vide). */
    if (registering || registeringUid === user.uid) {
      hideVeil();
      return;
    }
    attemptAccess(user);
  } else {
    currentUid = null;
    resolvingUid = null;
    try { localStorage.removeItem('arvexa_user'); } catch { /* stockage indisponible */ }
    window.ARVXA_PROFILE = null;
    /* Comme l'original : une session qui se ferme ramène au formulaire
       de CONNEXION (pas au panneau inscription laissé ouvert).
       Exception v0.13 : si l'élève est sur la page publique
       BIENVENUE, on ne le chasse pas vers le formulaire. */
    switchMode('login');
    if (!PUBLIC_ROUTES.includes(currentRoute())) forceAuthView();
    hideVeil();
  }
});

/* ═══════════════════════════════════════════════════════════════════
   CONTRÔLE SEGMENTÉ — les deux pages en une (transition 220 ms)
   ═══════════════════════════════════════════════════════════════════ */

let mode = 'login';

function applyHeaderLink() {
  if (!headerLinkIcon || !headerLinkText) return;
  const toRegister = mode === 'login';
  headerLinkIcon.className = toRegister ? 'fas fa-user-plus' : 'fas fa-sign-in-alt';
  headerLinkText.textContent = window.ARVXA_t
    ? window.ARVXA_t(toRegister ? 'auth.header.versInscription' : 'auth.header.versConnexion')
    : (toRegister ? 'Pas encore membre ?' : 'Connexion');
}

function switchMode(next) {
  if (next !== 'login' && next !== 'register') return;
  if (next === mode) return;
  mode = next;
  const isLogin = mode === 'login';

  tabs?.classList.toggle('register', !isLogin);
  tabLogin?.classList.toggle('active', isLogin);
  tabRegister?.classList.toggle('active', !isLogin);
  tabLogin?.setAttribute('aria-selected', isLogin ? 'true' : 'false');
  tabRegister?.setAttribute('aria-selected', isLogin ? 'false' : 'true');

  /* Le panneau entrant est remonté en haut du cadre — jamais de
     défilement résiduel d'un formulaire long. */
  if (viewAuth) viewAuth.scrollTop = 0;

  panelLogin.hidden = !isLogin;
  panelLogin.classList.toggle('active', isLogin);
  panelRegister.hidden = isLogin;
  panelRegister.classList.toggle('active', !isLogin);

  applyHeaderLink();
}

tabLogin?.addEventListener('click', () => switchMode('login'));
tabRegister?.addEventListener('click', () => switchMode('register'));
goRegister?.addEventListener('click', () => switchMode('register'));
goLogin?.addEventListener('click', () => switchMode('login'));
headerLink?.addEventListener('click', () => switchMode(mode === 'login' ? 'register' : 'login'));
window.addEventListener('arvexa-langchange', applyHeaderLink);

/* ═══════════════════════════════════════════════════════════════════
   VALIDATION — états visuels identiques à l'original
   ═══════════════════════════════════════════════════════════════════ */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s\-']+$/;
const ESTABLISHMENT_REGEX = /^[a-zA-ZÀ-ÿ0-9\s\-'.,()]+$/;

function setFieldState(wrap, status, help, isValid, hasValue, errorMsg) {
  const hasError = !isValid && hasValue;
  if (wrap) {
    wrap.classList.toggle('is-error', hasError);
    wrap.classList.toggle('is-success', isValid && hasValue);
  }
  if (status) {
    status.className = 'field-status';
    if (hasValue) {
      status.classList.add(isValid ? 'success' : 'error');
      status.innerHTML = isValid
        ? '<i class="fas fa-check-circle"></i>'
        : '<i class="fas fa-times-circle"></i>';
    } else {
      status.innerHTML = '';
    }
  }
  if (help) {
    help.className = 'field-help';
    if (hasError) {
      help.classList.add('visible', 'error');
      help.textContent = errorMsg;
    } else {
      help.textContent = '';
    }
  }
}

/* ── CONNEXION : e-mail + mot de passe ─────────────────────────── */

function validateLoginField(which) {
  if (which === 'email') {
    const v = loginEmail.value.trim();
    setFieldState(loginEmailWrap, loginEmailStatus, loginEmailHelp, EMAIL_REGEX.test(v), v.length > 0, m('emailInvalide'));
    return EMAIL_REGEX.test(v);
  }
  const v = loginPassword.value;
  setFieldState(loginPwdWrap, loginPwdStatus, loginPwdHelp, v.length >= 6, v.length > 0, m('mdpCourt'));
  return v.length >= 6;
}

function updateLoginButton() {
  if (!loginBtn) return;
  loginBtn.disabled = !(EMAIL_REGEX.test(loginEmail.value.trim()) && loginPassword.value.length >= 6);
}

loginEmail?.addEventListener('input', () => { validateLoginField('email'); updateLoginButton(); });
loginPassword?.addEventListener('input', () => { validateLoginField('password'); updateLoginButton(); });
loginEmail?.addEventListener('blur', () => validateLoginField('email'));
loginPassword?.addEventListener('blur', () => validateLoginField('password'));

function wireTogglePwd(button, input) {
  button?.addEventListener('click', function () {
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);
    this.querySelector('i').className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    this.setAttribute('aria-label', type === 'password' ? 'Afficher le mot de passe' : 'Masquer le mot de passe');
  });
}
wireTogglePwd(toggleLoginPwd, loginPassword);
wireTogglePwd(toggleRegPwd, regPassword);
wireTogglePwd(toggleConfirmPwd, confirmPassword);

/* E-mail mémorisé (Se souvenir de moi — même clé que l'original). */
const REMEMBER_KEY = 'arvexa_remember_email';
try {
  const savedEmail = localStorage.getItem(REMEMBER_KEY);
  if (savedEmail && loginEmail) {
    loginEmail.value = savedEmail;
    if (rememberMe) rememberMe.checked = true;
    validateLoginField('email');
    updateLoginButton();
  }
} catch { /* stockage indisponible */ }

/* ═══════════════════════════════════════════════════════════════════
   CONNEXION — soumission + erreurs Firebase traduites
   ═══════════════════════════════════════════════════════════════════ */

let loginSubmitting = false;

function handleSignInError(error) {
  const code = error && error.code ? error.code : '';
  switch (code) {
    case 'auth/user-not-found':
      showToast(m('aucunCompte'), 'error', 6000);
      return;
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      showToast(m('mdpIncorrect'), 'error', 6000);
      return;
    case 'auth/too-many-requests':
      showToast(m('tropTentatives'), 'error', 6000);
      return;
    case 'auth/invalid-email':
      showToast(m('emailInvalide'), 'error', 6000);
      return;
    case 'auth/network-request-failed':
      showToast(m('reseau'), 'error', 6000);
      return;
    case 'auth/user-disabled':
      showToast(m('compteDesactive'), 'error', 6000);
      return;
    default:
      console.warn('[Auth] Erreur de connexion :', code || error.message);
      showToast(m('erreurGenerique'), 'error', 6000);
  }
}

loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (loginSubmitting || loginBtn.disabled) return;

  loginSubmitting = true;
  loginBtn.disabled = true;
  loginBtn.classList.add('loading');

  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);

    try {
      if (rememberMe?.checked) localStorage.setItem(REMEMBER_KEY, email);
      else localStorage.removeItem(REMEMBER_KEY);
    } catch { /* stockage indisponible */ }

    /* L'accès (profil + statut + sortie de l'écran auth) passe par le
       chemin unique ; onAuthStateChanged a peut-être déjà traité. */
    await attemptAccess(credential.user);
    showToast(m('connexionReussie'), 'success', 1600);
    resetLoginButton();
  } catch (error) {
    handleSignInError(error);
    resetLoginButton();
  } finally {
    loginSubmitting = false;
  }
});

/* ── MOT DE PASSE OUBLIÉ — vrai envoi Firebase (e-mail du champ) ── */

forgotBtn?.addEventListener('click', async () => {
  const email = loginEmail.value.trim();
  if (!EMAIL_REGEX.test(email)) {
    setFieldState(loginEmailWrap, loginEmailStatus, loginEmailHelp, false, true, m('forgotEntreeEmail'));
    loginEmail?.focus();
    return;
  }
  forgotBtn.disabled = true;
  try {
    await sendPasswordResetEmail(auth, email);
    showToast(m('resetEnvoye'), 'success', 6000);
  } catch (error) {
    const code = error && error.code ? error.code : '';
    if (code === 'auth/user-not-found') showToast(m('aucunCompte'), 'error', 6000);
    else if (code === 'auth/network-request-failed') showToast(m('reseau'), 'error', 6000);
    else if (code === 'auth/too-many-requests') showToast(m('tropTentatives'), 'error', 6000);
    else showToast(m('erreurGenerique'), 'error', 6000);
  } finally {
    forgotBtn.disabled = false;
  }
});

/* ═══════════════════════════════════════════════════════════════════
   INSCRIPTION — validateurs, brouillon, force du mot de passe
   (logique copiée de register.html, messages traduits FR/AN)
   ═══════════════════════════════════════════════════════════════════ */

const FIELD_IDS = ['authFirstName', 'authLastName', 'authRegisterEmail', 'authEstablishment', 'authRegisterPassword', 'authConfirmPassword'];
const INPUTS = {
  authFirstName: firstName,
  authLastName: lastName,
  authRegisterEmail: regEmail,
  authEstablishment: establishment,
  authRegisterPassword: regPassword,
  authConfirmPassword: confirmPassword,
};
const WRAPS = {
  authFirstName: $('authFirstNameWrap'),
  authLastName: $('authLastNameWrap'),
  authRegisterEmail: $('authRegisterEmailWrap'),
  authEstablishment: $('authEstablishmentWrap'),
  authRegisterPassword: $('authRegisterPwdWrap'),
  authConfirmPassword: $('authConfirmWrap'),
};
const STATUSES = {
  authFirstName: $('authFirstNameStatus'),
  authLastName: $('authLastNameStatus'),
  authRegisterEmail: $('authRegisterEmailStatus'),
  authEstablishment: $('authEstablishmentStatus'),
  authConfirmPassword: $('authConfirmStatus'),
};
const HELPS = {
  authFirstName: $('authFirstNameHelp'),
  authLastName: $('authLastNameHelp'),
  authRegisterEmail: $('authRegisterEmailHelp'),
  authEstablishment: $('authEstablishmentHelp'),
  authRegisterPassword: $('authRegisterPwdHelp'),
  authConfirmPassword: $('authConfirmHelp'),
};

const regState = {
  touched: {},
  isSubmitting: false,
};

const validators = {
  authFirstName: (v) => {
    const s = v.trim();
    if (!s) return m('prenomRequis');
    if (s.length < 2) return m('prenomCourt');
    if (!NAME_REGEX.test(s)) return m('caracteresRefuses');
    return '';
  },
  authLastName: (v) => {
    const s = v.trim();
    if (!s) return m('nomRequis');
    if (s.length < 2) return m('nomCourt');
    if (!NAME_REGEX.test(s)) return m('caracteresRefuses');
    return '';
  },
  authRegisterEmail: (v) => {
    const s = v.trim();
    if (!s) return m('emailRequis');
    if (!EMAIL_REGEX.test(s)) return m('emailInvalide');
    return '';
  },
  authEstablishment: (v) => {
    const s = v.trim();
    if (s && !ESTABLISHMENT_REGEX.test(s)) return m('caracteresRefuses');
    return '';
  },
  authRegisterPassword: (v) => {
    if (!v) return m('mdpRequis');
    if (v.length < 6) return m('mdp6');
    return '';
  },
  authConfirmPassword: (v) => {
    if (!v) return m('confirmRequis');
    if (v !== regPassword.value) return m('confirmDiff');
    return '';
  },
};

function renderRegisterField(id) {
  const input = INPUTS[id];
  if (!input) return true;
  const error = validators[id](input.value);
  const valid = !error;
  setFieldState(WRAPS[id], STATUSES[id], HELPS[id], valid, input.value.length > 0, error);
  return valid;
}

function updateRegisterButton() {
  if (!registerBtn) return false;
  let allValid = true;
  for (const id of FIELD_IDS) {
    const ok = renderRegisterField(id);
    if (!ok) allValid = false;
  }
  /* Conditions : erreur visible seulement après une tentative. */
  const termsOk = termsCheckbox?.checked;
  if (regState.touched.terms) {
    termsBox?.classList.toggle('is-error', !termsOk);
    termsError?.classList.toggle('visible', !termsOk);
  }
  registerBtn.disabled = !allValid || !termsOk;
  return allValid && !!termsOk;
}

FIELD_IDS.forEach((id) => {
  INPUTS[id]?.addEventListener('input', () => {
    /* Confirmation : réévalue si le mot de passe change. */
    if (id === 'authRegisterPassword' && regState.touched.authConfirmPassword) {
      renderRegisterField('authConfirmPassword');
    }
    if (regState.touched[id] || INPUTS[id].value.length > 0) {
      regState.touched[id] = true;
      renderRegisterField(id);
    }
    updateRegisterButton();
  });
  INPUTS[id]?.addEventListener('blur', () => {
    regState.touched[id] = true;
    renderRegisterField(id);
    updateRegisterButton();
  });
});

termsCheckbox?.addEventListener('change', () => {
  regState.touched.terms = true;
  updateRegisterButton();
});

/* ── FORCE DU MOT DE PASSE (algorithme exact de l'original) ────── */

function getPasswordStrength(pwd) {
  if (!pwd) return { score: 0, labelKey: 'auth.force.tresFaible', color: '#E74C3C' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^a-zA-Z0-9]/.test(pwd)) score++;
  score = Math.min(score, 5);
  const map = {
    0: 'auth.force.tresFaible',
    1: 'auth.force.tresFaible',
    2: 'auth.force.faible',
    3: 'auth.force.moyen',
    4: 'auth.force.fort',
    5: 'auth.force.tresFort',
  };
  const colors = ['#E74C3C', '#E74C3C', '#E67E22', '#F1C40F', '#2ECC71', '#27AE60'];
  return { score, labelKey: map[score], color: colors[score] };
}

function renderPasswordStrength(pwd) {
  if (!pwdStrength) return;
  if (!pwd) {
    pwdStrength.classList.remove('visible');
    return;
  }
  pwdStrength.classList.add('visible');
  const { score, labelKey, color } = getPasswordStrength(pwd);
  pwdStrength.querySelectorAll('.pwd-strength-segment').forEach((seg, i) => {
    seg.className = 'pwd-strength-segment';
    if (i < score) seg.classList.add(`filled-${score}`);
  });
  if (pwdStrengthLabel) {
    pwdStrengthLabel.textContent = window.ARVXA_t ? window.ARVXA_t(labelKey) : labelKey;
    pwdStrengthLabel.style.color = color;
  }
}

regPassword?.addEventListener('input', () => renderPasswordStrength(regPassword.value));

/* ── BROUILLON (arvexa_register_draft_v2 — même clé que l'original) ── */

const SAVE_KEY = 'arvexa_register_draft_v2';

function saveDraft() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      authFirstName: firstName?.value.trim() || '',
      authLastName: lastName?.value.trim() || '',
      authRegisterEmail: regEmail?.value.trim() || '',
      authEstablishment: establishment?.value.trim() || '',
    }));
  } catch { /* stockage indisponible */ }
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const draft = JSON.parse(raw);
    FIELD_IDS.forEach((id) => {
      if (id === 'authRegisterPassword' || id === 'authConfirmPassword') return;
      if (draft[id] && INPUTS[id]) INPUTS[id].value = draft[id];
    });
  } catch { /* brouillon illisible */ }
}

function clearDraft() {
  try { localStorage.removeItem(SAVE_KEY); } catch { /* stockage indisponible */ }
}

['authFirstName', 'authLastName', 'authRegisterEmail', 'authEstablishment'].forEach((id) => {
  INPUTS[id]?.addEventListener('input', saveDraft);
});

/* ═══════════════════════════════════════════════════════════════════
   INSCRIPTION — soumission (profil Firestore avec retry ×3, compte
   Auth supprimé si le profil est impossible à écrire, notifications
   admin non bloquantes — fidèle à l'original)
   ═══════════════════════════════════════════════════════════════════ */

registerForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (regState.isSubmitting || registerBtn.disabled) return;

  FIELD_IDS.forEach((id) => { regState.touched[id] = true; });
  regState.touched.terms = true;

  if (!updateRegisterButton()) {
    showToast(m('verifieChamps'), 'error', 3000);
    return;
  }

  regState.isSubmitting = true;
  registerBtn.disabled = true;
  registerBtn.classList.add('loading');

  const firstNameValue = firstName.value.trim();
  const lastNameValue = lastName.value.trim();
  const emailValue = regEmail.value.trim();
  const passwordValue = regPassword.value;
  const establishmentValue = establishment.value.trim() || '';

  registering = true;

  try {
    /* 1. Compte Firebase Auth */
    const credential = await createUserWithEmailAndPassword(auth, emailValue, passwordValue);
    registeringUid = credential.user.uid;

    /* 2. Profil Firestore (retry ×3 — même politique que l'original) */
    const now = serverTimestamp();
    const profileData = {
      uid: credential.user.uid,
      firstName: firstNameValue,
      lastName: lastNameValue,
      fullName: `${firstNameValue} ${lastNameValue}`.trim(),
      email: emailValue,
      establishment: establishmentValue,
      classId: 'terminale_d',
      exam: 'bac',
      role: 'student',
      onboardingCompleted: false,
      premium: false,
      isUnlocked: false,
      hasDeposited: false,
      accountStatus: 'active',
      plan: 'gratuit',
      stats: { courses: 0, done: 0 },
      totalStudyTime: 0,
      createdAt: now,
      updatedAt: now,
    };

    let profileSaved = false;
    let lastWriteError = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await setDoc(doc(db, 'users', credential.user.uid), profileData);
        profileSaved = true;
        break;
      } catch (err) {
        lastWriteError = err;
        console.warn(`[Auth] Tentative ${attempt}/3 — création du profil :`, err.message);
        if (attempt < 3) await new Promise((r) => setTimeout(r, attempt * 1000));
      }
    }

    if (!profileSaved) {
      console.error('[Auth] Profil introuvable après 3 tentatives :', lastWriteError?.code || lastWriteError?.message);
      try {
        await credential.user.delete();
      } catch (deleteErr) {
        try {
          const pending = JSON.parse(localStorage.getItem('arvexa_pending_cleanup') || '[]');
          pending.push({ uid: credential.user.uid, email: emailValue, at: Date.now() });
          localStorage.setItem('arvexa_pending_cleanup', JSON.stringify(pending));
        } catch { /* stockage indisponible */ }
      }
      throw Object.assign(new Error('PROFILE_CREATION_FAILED'), { code: 'PROFILE_CREATION_FAILED' });
    }

    /* 3. Notification admin (temps réel console) — non bloquant. */
    try {
      await addDoc(collection(db, 'admin_notifications'), {
        kind: 'new_signup',
        title: '🎉 Nouvelle inscription',
        message: `${firstNameValue} ${lastNameValue}`.trim() + (establishmentValue ? ' · ' + establishmentValue : ''),
        userUid: credential.user.uid,
        userEmail: emailValue,
        userName: `${firstNameValue} ${lastNameValue}`.trim(),
        establishment: establishmentValue || '',
        type: 'success',
        read: false,
        createdAt: now,
      });
    } catch (notifErr) {
      console.warn('[Auth] Notification admin échouée :', notifErr.code || notifErr.message);
    }

    /* 4. Fin — publication du profil et entrée dans l'app (SPA). */
    clearDraft();
    showToast(m('compteCree'), 'success', 2400);
    registering = false;
    registeringUid = null;
    await attemptAccess(credential.user);
    publishProfile(credential.user.uid, profileData);
  } catch (error) {
    registering = false;
    registeringUid = null;
    console.error('[Auth] Erreur inscription :', error);

    let message = m('erreurGenerique');
    let duration = 4000;
    const code = error && error.code ? error.code : '';

    switch (code) {
      case 'PROFILE_CREATION_FAILED':
        message = m('profilEchec');
        duration = 8000;
        break;
      case 'auth/email-already-in-use':
        message = m('emailDejaUtilise');
        duration = 6000;
        break;
      case 'auth/invalid-email':
        message = m('emailInvalide');
        break;
      case 'auth/weak-password':
        message = m('mdpFaible');
        break;
      case 'auth/operation-not-allowed':
        message = m('inscriptionDesactivee');
        duration = 6000;
        break;
      case 'auth/too-many-requests':
        message = m('tropTentatives');
        duration = 6000;
        break;
      case 'auth/network-request-failed':
        message = m('reseau');
        duration = 6000;
        break;
      default:
        message = error && error.message ? error.message : m('erreurGenerique');
    }

    showToast(message, 'error', duration);
    setTimeout(() => {
      regState.isSubmitting = false;
      registerBtn.disabled = false;
      registerBtn.classList.remove('loading');
      updateRegisterButton();
    }, 3000);
    return;
  }

  regState.isSubmitting = false;
  registerBtn.disabled = false;
  registerBtn.classList.remove('loading');
  updateRegisterButton();
});

/* ═══════════════════════════════════════════════════════════════════
   INITIALISATION
   ═══════════════════════════════════════════════════════════════════ */

loadDraft();
applyHeaderLink();
updateRegisterButton();

console.log('🚀 ARVX — Auth v0.10 (connexion + inscription sur une seule page, Firebase réel)');
