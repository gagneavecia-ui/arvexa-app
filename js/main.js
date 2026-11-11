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

   v0.10 — AUTHENTIFICATION (Firebase, même projet que ARVEXA
     School) :
     · SIXIÈME VUE « auth » (#/auth) — connexion + inscription
       sur UNE SEULE page (design identique aux pages originales,
       js/auth.js) ; les barres du haut et du bas sont masquées
       (body.auth-mode) quand la vue est active ;
     · GARDE DE ROUTE — non connecté, toute route mène à #/auth
       (la route demandée est mémorisée en sessionStorage et
       restaurée après connexion) ; connecté, #/auth ramène à
       l'accueil ;
     · VOILE DE DÉMARRAGE — couvre l'app pendant la vérification
       de session (zéro flash) ; filet de sécurité 6 s si
       Firebase est injoignable ;
     · FIN DES DONNÉES FICTIVES — la carte statistiques affiche
       les VRAIES valeurs du profil Firestore (stats.courses /
       stats.done, 0 au départ) ; la salutation et la carte
       profil utilisent le vrai prénom du compte ;
     · déconnexion RÉELLE — signOut Firebase puis retour #/auth ;
     · i18n FR/AN complète de la page auth.
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
    /* Les autres modules (page auth) réagissent comme à un vrai
       changement de langue (setLang). */
    window.dispatchEvent(new CustomEvent('arvexa-langchange', { detail: { lang } }));
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
    'accueil.progression': 'Ma progression',
    'accueil.progressionSubVide': 'Commence ta première révision.',
    'accueil.progressionSubOk': '{done} cours lus sur {total}',
    'progression.eyebrow': 'Parcours',
    'progression.titre': 'Ma progression',
    'progression.coursLus': 'Cours lus',
    'progression.aCompleter': 'À compléter',
    'progression.vide': 'Ton parcours s’affichera ici dès ta première révision.',
    'reviser.eyebrow': 'Bibliothèque',
    'reviser.titre': 'Mes cours',
    'reviser.ajouter': 'Ajouter',
    'reviser.recherche': 'Rechercher un cours, une matière…',
    'reviser.rouvrir': 'À rouvrir en premier',
    'reviser.reviser': 'Réviser ce cours',
    'reviser.fiches': '10 fiches dues',
    'reviser.matieres': 'Mes matières',
    'reviser.vide': 'Aucun cours pour l’instant.',
    'reviser.aucunResultat': 'Aucun résultat.',
    'reviser.countModel': '{n} matières · {m} chapitres',
    'reviser.metaModel': '{n} chapitres · {m} notions',
    'reviser.bac': 'BAC',
    'reviser.heroMeta': 'Terminale · Chapitre 3',
    'reviser.ajoutBientot': 'L’import de cours arrive bientôt.',
    'accueil.serie': 'Série',
    'accueil.jours': 'j',
    'accueil.minutes': 'min',
    'accueil.semaine': '· 7 j',
    'accueil.continuerAuj': 'Révisé aujourd’hui',
    'accueil.continuerIlYa': 'Révisé il y a {n} j',
    'examen.eyebrow': 'Examen',
    'examen.titre': 'Prépare ton BAC',
    'examen.countdown': 'Compte à rebours',
    'examen.jours': 'jours',
    'examen.countdownSub': 'Un chapitre par jour garde ta longueur d’avance.',
    'examen.epreuve': 'Épreuve le {date}',
    'examen.quiz': 'Quiz éclair',
    'examen.quizSub': '5 questions · générées pour toi',
    'examen.blanc': 'Examen blanc',
    'examen.blancSub': 'Dans les conditions réelles',
    'examen.bientot': 'Bientôt',
    'examen.bientotToast': 'Bientôt disponible — les clés IA arrivent.',
    'examen.plan': 'Plan de révision',
    'examen.planModel': '{n} chapitres · {m} notions à couvrir avant l’épreuve.',
    'examen.rythme': '≈ {n} chapitres / semaine',
    'examen.matieres': 'Matières d’examen',
    'examen.countModel': '{n} matières',
    'progression.serie': 'Série',
    'progression.minutes': 'min · 7 j',
    'progression.quiz': 'Quiz réussis',
    'progression.activite': 'Activité · 7 derniers jours',
    'progression.objectif': 'Objectif hebdo',
    'progression.objectifSub': '5 jours actifs par semaine — la régularité fait la réussite.',
    'progression.objectifModel': '{n} / 5 j',
    'profil.eyebrow': 'Mon espace',
    'profil.titre': 'Profil',
    'profil.minutes': 'Minutes',
    'profil.reglages': 'Réglages',
    'profil.theme': 'Mode sombre',
    'profil.themeLight': 'Mode clair',
    'profil.langue': 'Langue',
    'profil.compte': 'Compte',
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
    'auth.tab.login': 'Connexion',
    'auth.tab.register': 'Inscription',
    'auth.header.versInscription': 'Pas encore membre ?',
    'auth.header.versConnexion': 'Connexion',
    'auth.login.badge': 'Bon retour parmi nous',
    'auth.login.titre1': 'Content de te',
    'auth.login.titre2': 'revoir',
    'auth.login.titre3': ' !',
    'auth.login.sousTitre': 'Retrouve ton espace personnel et continue ta préparation pour le BAC.',
    'auth.champ.email': 'Adresse e-mail',
    'auth.champ.mdp': 'Mot de passe',
    'auth.champ.prenom': 'Prénom',
    'auth.champ.nom': 'Nom',
    'auth.champ.etablissement': 'Établissement',
    'auth.champ.optionnel': 'optionnel',
    'auth.champ.confirm': 'Confirmer le mot de passe',
    'ph.login.email': 'exemple@email.com',
    'ph.login.mdp': 'Entre ton mot de passe',
    'ph.register.prenom': 'Ton prénom',
    'ph.register.nom': 'Ton nom',
    'ph.register.email': 'exemple@email.com',
    'ph.register.etab': 'Nom de ton lycée',
    'ph.register.mdp': 'Minimum 6 caractères',
    'ph.register.confirm': 'Retape ton mot de passe',
    'auth.login.souvenir': 'Se souvenir de moi',
    'auth.login.oublie': 'Mot de passe oublié ?',
    'auth.login.bouton': 'Se connecter',
    'auth.divider': 'ou',
    'auth.login.creerCompte': 'Créer un nouveau compte',
    'auth.login.securite': 'Connexion sécurisée par Firebase',
    'auth.footer.droits': 'Tous droits réservés',
    'auth.footer.aide': 'Aide',
    'auth.footer.dejaMembre': 'Déjà membre ?',
    'auth.footer.seConnecter': 'Se connecter',
    'auth.register.badge': 'Étape 1 sur 2',
    'auth.register.titre1': 'Crée ton compte',
    'auth.register.titre2': 'ARVEXA',
    'auth.register.sousTitre': 'Rejoins la communauté des élèves qui préparent leur BAC avec méthode et sérénité.',
    'auth.register.etape': 'Inscription',
    'auth.register.force': 'Force du mot de passe',
    'auth.register.conditions1': 'J’accepte les',
    'auth.register.conditions2': 'Conditions d’utilisation',
    'auth.register.conditions3': 'et la',
    'auth.register.conditions4': 'Politique de confidentialité',
    'auth.register.conditions5': 'd’ARVEXA School.',
    'auth.register.termsErreur': 'Tu dois accepter les conditions pour continuer.',
    'auth.register.bouton': 'Créer mon compte',
    'auth.register.securite': 'Inscription sécurisée par Firebase',
    'auth.force.tresFaible': 'Très faible',
    'auth.force.faible': 'Faible',
    'auth.force.moyen': 'Moyen',
    'auth.force.fort': 'Fort',
    'auth.force.tresFort': 'Très fort',
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
    'accueil.progression': 'My progress',
    'accueil.progressionSubVide': 'Start your first review.',
    'accueil.progressionSubOk': '{done} of {total} courses read',
    'progression.eyebrow': 'Journey',
    'progression.titre': 'My progress',
    'progression.coursLus': 'Courses read',
    'progression.aCompleter': 'To complete',
    'progression.vide': 'Your journey will appear here after your first review.',
    'reviser.eyebrow': 'Library',
    'reviser.titre': 'My courses',
    'reviser.ajouter': 'Add',
    'reviser.recherche': 'Search for a course, a subject…',
    'reviser.rouvrir': 'Reopen first',
    'reviser.reviser': 'Revise this course',
    'reviser.fiches': '10 cards due',
    'reviser.matieres': 'My subjects',
    'reviser.vide': 'No courses yet.',
    'reviser.aucunResultat': 'No result.',
    'reviser.countModel': '{n} subjects · {m} chapters',
    'reviser.metaModel': '{n} chapters · {m} topics',
    'reviser.bac': 'BAC',
    'reviser.heroMeta': 'Grade 12 · Chapter 3',
    'reviser.ajoutBientot': 'Course import is coming soon.',
    'accueil.serie': 'Streak',
    'accueil.jours': 'd',
    'accueil.minutes': 'min',
    'accueil.semaine': '· 7 d',
    'accueil.continuerAuj': 'Revised today',
    'accueil.continuerIlYa': 'Revised {n} d ago',
    'examen.eyebrow': 'Exam',
    'examen.titre': 'Prepare for your BAC',
    'examen.countdown': 'Countdown',
    'examen.jours': 'days',
    'examen.countdownSub': 'One chapter a day keeps you ahead.',
    'examen.epreuve': 'Exam on {date}',
    'examen.quiz': 'Flash quiz',
    'examen.quizSub': '5 questions · generated for you',
    'examen.blanc': 'Mock exam',
    'examen.blancSub': 'Under real conditions',
    'examen.bientot': 'Soon',
    'examen.bientotToast': 'Coming soon — the AI keys are on the way.',
    'examen.plan': 'Revision plan',
    'examen.planModel': '{n} chapters · {m} topics to cover before the exam.',
    'examen.rythme': '≈ {n} chapters / week',
    'examen.matieres': 'Exam subjects',
    'examen.countModel': '{n} subjects',
    'progression.serie': 'Streak',
    'progression.minutes': 'min · 7 d',
    'progression.quiz': 'Quizzes passed',
    'progression.activite': 'Activity · last 7 days',
    'progression.objectif': 'Weekly goal',
    'progression.objectifSub': '5 active days a week — consistency wins.',
    'progression.objectifModel': '{n} / 5 d',
    'profil.eyebrow': 'My space',
    'profil.titre': 'Profile',
    'profil.minutes': 'Minutes',
    'profil.reglages': 'Settings',
    'profil.theme': 'Dark mode',
    'profil.themeLight': 'Light mode',
    'profil.langue': 'Language',
    'profil.compte': 'Account',
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
    'auth.tab.login': 'Sign in',
    'auth.tab.register': 'Sign up',
    'auth.header.versInscription': 'Not a member yet?',
    'auth.header.versConnexion': 'Sign in',
    'auth.login.badge': 'Welcome back among us',
    'auth.login.titre1': 'Good to see',
    'auth.login.titre2': 'you again',
    'auth.login.titre3': '!',
    'auth.login.sousTitre': 'Back to your personal space — keep preparing for the BAC.',
    'auth.champ.email': 'Email address',
    'auth.champ.mdp': 'Password',
    'auth.champ.prenom': 'First name',
    'auth.champ.nom': 'Last name',
    'auth.champ.etablissement': 'School',
    'auth.champ.optionnel': 'optional',
    'auth.champ.confirm': 'Confirm password',
    'ph.login.email': 'name@email.com',
    'ph.login.mdp': 'Enter your password',
    'ph.register.prenom': 'Your first name',
    'ph.register.nom': 'Your last name',
    'ph.register.email': 'name@email.com',
    'ph.register.etab': 'Your school name',
    'ph.register.mdp': 'At least 6 characters',
    'ph.register.confirm': 'Retype your password',
    'auth.login.souvenir': 'Remember me',
    'auth.login.oublie': 'Forgot password?',
    'auth.login.bouton': 'Sign in',
    'auth.divider': 'or',
    'auth.login.creerCompte': 'Create a new account',
    'auth.login.securite': 'Secure sign-in powered by Firebase',
    'auth.footer.droits': 'All rights reserved',
    'auth.footer.aide': 'Help',
    'auth.footer.dejaMembre': 'Already a member?',
    'auth.footer.seConnecter': 'Sign in',
    'auth.register.badge': 'Step 1 of 2',
    'auth.register.titre1': 'Create your account',
    'auth.register.titre2': 'ARVEXA',
    'auth.register.sousTitre': 'Join the students preparing for the BAC with method and serenity.',
    'auth.register.etape': 'Sign up',
    'auth.register.force': 'Password strength',
    'auth.register.conditions1': 'I accept the',
    'auth.register.conditions2': 'Terms of use',
    'auth.register.conditions3': 'and the',
    'auth.register.conditions4': 'Privacy policy',
    'auth.register.conditions5': 'of ARVEXA School.',
    'auth.register.termsErreur': 'You must accept the terms to continue.',
    'auth.register.bouton': 'Create my account',
    'auth.register.securite': 'Secure sign-up powered by Firebase',
    'auth.force.tresFaible': 'Very weak',
    'auth.force.faible': 'Weak',
    'auth.force.moyen': 'Medium',
    'auth.force.fort': 'Strong',
    'auth.force.tresFort': 'Very strong',
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
  updateProgression();
  updateContinue();
  updateLibrary();
  updateExamen();
  updateProfil();
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

/* (v0.12 : le premier applyLang() est appelé en FIN de module —
   les données v0.12 doivent être initialisées avant le rendu.) */

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

function updateStatsCard() {
  const coursesEl = document.getElementById('statCourses');
  const doneEl = document.getElementById('statDone');
  const ringFill = document.getElementById('ringFill');
  const ringPct = document.getElementById('ringPct');
  if (!coursesEl || !doneEl || !ringFill || !ringPct) return;

  /* Statistiques RÉELLES (v0.10) : le profil Firestore
     (window.ARVXA_PROFILE, posé par js/auth.js) fait foi —
     stats.courses / stats.done, 0 au départ. Le localStorage
     'arvexa-stats' reste un cache d'appareil. */
  const stats = getRealStats();

  const courses = Math.max(0, Math.round(stats.courses));
  const done = Math.min(courses, Math.max(0, Math.round(stats.done || 0)));
  const pct = courses > 0 ? Math.round((done / courses) * 100) : 0;

  coursesEl.textContent = String(courses);
  doneEl.textContent = String(done);

  /* Anneau de progression : circonférence = 2π × 30 ≈ 188.5. */
  const C = 2 * Math.PI * 30;
  ringFill.style.strokeDasharray = String(C);
  ringFill.style.strokeDashoffset = String(C * (1 - pct / 100));
  ringPct.innerHTML = pct + '<small>%</small>';

  /* v0.12 — pastilles statistiques réelles : série (jours
     consécutifs d'activité) et minutes des 7 derniers jours. */
  const act = getActivity();
  const streakEl = document.getElementById('statStreak');
  const minutesEl = document.getElementById('statMinutes');
  if (streakEl) streakEl.textContent = String(computeStreak(act.days));
  if (minutesEl) minutesEl.textContent = String(weekTotalMinutes(act.days));
}

/* ── SOURCE DE VÉRITÉ PARTAGÉE (v0.11) — les statistiques réelles,
   lues par la carte principale ET la carte « Ma progression » ET la
   vue Progression : une seule fonction, jamais de divergence.
   Profil Firestore (window.ARVXA_PROFILE) fait foi, cache
   localStorage en repli, 0/0 par défaut. ── */
function getRealStats() {
  const profile = window.ARVXA_PROFILE || null;
  if (profile && profile.stats && Number.isFinite(profile.stats.courses)) {
    return { courses: profile.stats.courses, done: profile.stats.done || 0 };
  }
  try {
    const s = JSON.parse(localStorage.getItem('arvexa-stats') || 'null');
    if (s && Number.isFinite(s.courses) && s.courses > 0) return s;
  } catch { /* JSON invalide */ }
  return { courses: 0, done: 0 };
}

/* ═══════════════════════════════════════════════════════════════════
   V0.11 — « MA PROGRESSION » : carte de l'accueil + vue Progression
   Demande : « juste après ce qu'il y a tu mets la progression de
   l'élève » + « lorsqu'on va à la page de progression tu les
   connectes entre eux ». Les DEUX écrans lisent la MÊME source
   (getRealStats) : la carte de l'accueil mène à la vue (goRoute,
   SPA), la vue fait écho à la carte. Vraies données uniquement —
   état vide tant qu'aucun cours n'existe.
   ═══════════════════════════════════════════════════════════════════ */

function setRing(fillEl, pctEl, radius, pct) {
  if (!fillEl || !pctEl) return;
  const C = 2 * Math.PI * radius;
  fillEl.style.strokeDasharray = String(C);
  fillEl.style.strokeDashoffset = String(C * (1 - pct / 100));
  pctEl.innerHTML = pct + '<small>%</small>';
}

function updateProgression() {
  const stats = getRealStats();
  const courses = Math.max(0, Math.round(stats.courses));
  const done = Math.min(courses, Math.max(0, Math.round(stats.done || 0)));
  const pct = courses > 0 ? Math.round((done / courses) * 100) : 0;

  /* Carte de l'accueil (v0.11.1 — grande carte détaillée) :
     anneau 84px (r = 35) + compteurs réels + barre or + sous-titre */
  setRing(
    document.getElementById('progressRingFill'),
    document.getElementById('progressPct'),
    35, pct
  );
  const homeDone = document.getElementById('homeProgDone');
  const homeLeft = document.getElementById('homeProgLeft');
  if (homeDone) homeDone.textContent = String(done);
  if (homeLeft) homeLeft.textContent = String(Math.max(0, courses - done));
  const barFill = document.getElementById('progressBarFill');
  if (barFill) barFill.style.width = pct + '%';
  const sub = document.getElementById('progressSub');
  if (sub) {
    sub.textContent = courses > 0
      ? t('accueil.progressionSubOk').replace('{done}', String(done)).replace('{total}', String(courses))
      : t('accueil.progressionSubVide');
  }

  /* Mini-graphe de la semaine de la grande carte (7 barres or) */
  buildWeek(document.getElementById('homeWeek'));

  /* Vue Progression : grand anneau (r = 41) + compteurs réels */
  setRing(
    document.getElementById('progRingFill'),
    document.getElementById('progRingPct'),
    41, pct
  );
  const doneEl = document.getElementById('progDone');
  const leftEl = document.getElementById('progLeft');
  if (doneEl) doneEl.textContent = String(done);
  if (leftEl) leftEl.textContent = String(Math.max(0, courses - done));

  /* v0.12 — tuiles statistiques réelles + activité de la semaine
     + objectif hebdomadaire (jours actifs / 5). */
  const act = getActivity();
  const tStreak = document.getElementById('progStreak');
  const tMinutes = document.getElementById('progMinutes');
  const tQuiz = document.getElementById('progQuiz');
  if (tStreak) tStreak.textContent = String(computeStreak(act.days));
  if (tMinutes) tMinutes.textContent = String(weekTotalMinutes(act.days));
  if (tQuiz) tQuiz.textContent = String(act.quiz.correct);

  const days = buildWeek(document.getElementById('progWeek'));
  const weekTotalEl = document.getElementById('progWeekTotal');
  if (weekTotalEl) weekTotalEl.textContent = weekTotalMinutes(act.days) + ' min';

  const active = days.filter((d) => d.minutes > 0).length;
  const goalVal = document.getElementById('progGoalVal');
  const goalFill = document.getElementById('progGoalFill');
  if (goalVal) goalVal.textContent = t('progression.objectifModel').replace('{n}', String(active));
  if (goalFill) goalFill.style.width = Math.min(100, (active / 5) * 100) + '%';

  const vide = document.getElementById('progVide');
  if (vide) vide.hidden = courses > 0;
}

/* Connexion demandée : la carte « Ma progression » de l'accueil
   ouvre la vue Progression (navigation SPA, zéro rechargement). */
document.getElementById('progressCard')?.addEventListener('click', () => goRoute('progression'));

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

const VIEWS = ['accueil', 'reviser', 'examen', 'progression', 'profil', 'auth'];
const TITLES = {
  accueil: { fr: 'ARVX', an: 'ARVX' },
  reviser: { fr: 'ARVX — Réviser', an: 'ARVX — Revise' },
  examen: { fr: 'ARVX — Examen', an: 'ARVX — Exam' },
  progression: { fr: 'ARVX — Progression', an: 'ARVX — Progress' },
  profil: { fr: 'ARVX — Profil', an: 'ARVX — Profile' },
  auth: { fr: 'ARVX — Connexion', an: 'ARVX — Sign in' },
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

  /* Mode auth (v0.10) : les deux barres s'effacent, la vue auth
     occupe tout l'écran (CSS body.auth-mode). */
  document.body.classList.toggle('auth-mode', name === 'auth');

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

  /* Chaque vue s'ouvre en haut, instantanément — y compris les
     vues qui défilent À L'INTÉRIEUR du cadre (Réviser, Examen,
     Progression, Profil) : leur scroll local repart de zéro. */
  window.scrollTo(0, 0);
  viewSections.forEach((el) => {
    if (!el) return;
    el.scrollTop = 0;
    el.querySelectorAll('.exam-body, .prof-wrap, .prog-wrap, .lib-body').forEach((scroller) => {
      scroller.scrollTop = 0;
    });
  });
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

/* ── NAVIGATION SPA DEPUIS L'ACCUEIL (v0.6.4 · v0.9.1) ──
   Mini-cartes de mode et carte « Continuer » : un seul chemin — le
   hash, la même source de vérité que la barre du bas. Aucune
   navigation document, aucune barre de chargement. (v0.9.1 : les
   tuiles « Actions rapides » sont supprimées — la barre du bas
   couvre toutes les routes.) Les écrans DÉTAILLÉS (lecteur de
   révision, import de cours) viendront à leur étape. */
function goRoute(route) {
  if (!VIEWS.includes(route)) return;
  const target = '#/' + route;
  if (location.hash === target) showView(route, { animate: false });
  else location.hash = target;
}

document.getElementById('modeQuick')?.addEventListener('click', () => goRoute('reviser'));
document.getElementById('modeFocus')?.addEventListener('click', () => goRoute('examen'));
document.getElementById('continueCard')?.addEventListener('click', () => goRoute('reviser'));

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

/* ── DÉCONNEXION — RÉELLE depuis v0.10 : signOut Firebase (js/auth.js)
   expose window.ARVXA_AUTH.signOut), puis onAuthStateChanged(null)
   renvoie automatiquement à #/auth (garde de route). Mêmes textes
   que le site original (handleLogout, index.html:3928-3936). ── */

async function performLogout() {
  try {
    if (window.ARVXA_AUTH && typeof window.ARVXA_AUTH.signOut === 'function') {
      await window.ARVXA_AUTH.signOut();
    }
  } catch (e) {
    console.warn('[Auth] Déconnexion :', e.code || e.message);
  }
}

/* (v0.12 : la déconnexion est câblée dans la section v0.12 — confirmLogout.) */

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
  ['libRays', 'statsRays', 'progRays', 'homeProgRays', 'examRays', 'profRays'].forEach((id) => {
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

/* ═══════════════════════════════════════════════════════════════════
   V0.10 — PONT AVEC L'AUTHENTIFICATION (js/auth.js)
   · window.ARVXA_t : le module auth traduit ses messages via le
     même dictionnaire i18n (une seule source de vérité).
   · 'arvexa-profile' : js/auth.js a posé le profil Firestore réel
     (window.ARVXA_PROFILE + localStorage 'arvexa_user') → on
     rafraîchit salutation, carte profil et carte statistiques.
   · Voile de démarrage : filet de sécurité 6 s — si Firebase est
     injoignable (hors ligne), on dévoile la page auth plutôt que
     de laisser l'écran bloqué.
   ═══════════════════════════════════════════════════════════════════ */

window.ARVXA_t = (key) => t(key);
window.ARVXA_lang = () => lang;

window.addEventListener('arvexa-profile', () => {
  applyGreeting();
  applyProfileCard();
  updateStatsCard();
  updateProgression();
  updateContinue();
  updateLibrary();
  updateExamen();
  updateProfil();
});

/* Le profil (Réglages → thème) reflète la bascule, où qu'elle vienne. */
window.addEventListener('arvexa-themechange', () => updateProfil());

function hideBootVeil() {
  const veil = document.getElementById('bootVeil');
  if (veil && !veil.classList.contains('done')) {
    veil.classList.add('done');
    setTimeout(() => veil.remove(), 400);
  }
}
window.ARVXA_hideVeil = hideBootVeil;

setTimeout(() => {
  if (!window.ARVXA_AUTH_READY) {
    /* Firebase injoignable : on dévoile la page auth (les boutons
       réessaieront la connexion dès le retour du réseau). */
    if (currentView !== 'auth') {
      if (VIEWS.includes(parseHash()) && parseHash() !== 'auth') {
        try { sessionStorage.setItem('arvx_pending_route', parseHash()); } catch { /* stockage indisponible */ }
      }
      if (location.hash === '#/auth') showView('auth', { animate: false });
      else location.replace('#/auth');
    }
    hideBootVeil();
  }
}, 6000);

/* ═══════════════════════════════════════════════════════════════════
   V0.12 — SITE D'ÉDUCATION COMPLET (tout sauf le menu)
   · DONNÉES D'ACTIVITÉ RÉELLES : localStorage 'arvexa-activity'
     { days: { 'YYYY-MM-DD': { minutes, revisions } }, quiz: { correct,
     total }, last: { title, at } } — tout commence à zéro, jamais de
     chiffre inventé ; les écrans de quiz/examen à venir écriront ici.
   · MATIÈRES RÉELLES : les 7 matières du dépôt ARVEXA School
     (bac-*.json) avec leurs VRAIS volumes (chapitres / notions).
   · BAC : même configuration que bac-date.js du site original
     (14 juillet) — la prochaine occurrence est calculée en direct.
   · VUES : Examen (compte à rebours, outils, plan calculé, matières),
     Profil (identité, stats, thème, langue, compte), Progression
     enrichie (tuiles, semaine, objectif), Réviser aux 7 matières,
     grande carte progression avec mini-graphe.
   ═══════════════════════════════════════════════════════════════════ */

const ACTIVITY_KEY = 'arvexa-activity';

/* ── Lecture de l'activité réelle (repli sûr : tout à zéro) ── */
function getActivity() {
  try {
    const a = JSON.parse(localStorage.getItem(ACTIVITY_KEY) || 'null');
    if (a && typeof a === 'object') {
      return {
        days: (a.days && typeof a.days === 'object') ? a.days : {},
        quiz: {
          correct: Number.isFinite(a.quiz && a.quiz.correct) ? a.quiz.correct : 0,
          total: Number.isFinite(a.quiz && a.quiz.total) ? a.quiz.total : 0,
        },
        last: (a.last && typeof a.last === 'object' && a.last.title) ? a.last : null,
      };
    }
  } catch { /* JSON invalide */ }
  return { days: {}, quiz: { correct: 0, total: 0 }, last: null };
}

/* Clé de jour locale YYYY-MM-DD (les séries suivent le calendrier
   de l'appareil, pas celui du serveur). */
function dayKey(d) {
  const dt = d instanceof Date ? d : new Date();
  return dt.getFullYear() + '-' +
    String(dt.getMonth() + 1).padStart(2, '0') + '-' +
    String(dt.getDate()).padStart(2, '0');
}

function dayMinutes(days, key) {
  const e = days[key];
  return e && Number.isFinite(e.minutes) && e.minutes > 0 ? Math.round(e.minutes) : 0;
}

/* SÉRIE — jours consécutifs d'activité, finissant aujourd'hui
   (ou hier si aujourd'hui n'est pas encore actif : la série du
   lendemain matin ne casse pas avant la fin de la journée). */
function computeStreak(days) {
  let streak = 0;
  const cursor = new Date();
  if (dayMinutes(days, dayKey(cursor)) === 0) cursor.setDate(cursor.getDate() - 1);
  while (dayMinutes(days, dayKey(cursor)) > 0) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/* Les 7 derniers jours (le plus récent en dernier) — minutes réelles. */
function last7Days(days) {
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = dayKey(d);
    out.push({ key: k, minutes: dayMinutes(days, k), weekday: d.getDay(), date: new Date(d) });
  }
  return out;
}

function weekTotalMinutes(days) {
  return last7Days(days).reduce((sum, d) => sum + d.minutes, 0);
}

/* Lettres des jours (indexées par Date.getDay, 0 = dimanche) */
const DAY_LETTERS = {
  fr: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
  an: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
};

/* Construit un mini-graphe hebdomadaire (7 barres or) dans un
   conteneur ; hauteur relative au maximum de la semaine (plancher
   30 min pour que les petites valeurs restent lisibles). Retourne
   les jours pour les compteurs. */
function buildWeek(container) {
  if (!container) return last7Days(getActivity().days);
  const days = last7Days(getActivity().days);
  const max = Math.max(30, ...days.map((d) => d.minutes));
  const letters = DAY_LETTERS[lang] || DAY_LETTERS.fr;
  container.innerHTML = days.map((d, i) => {
    const h = d.minutes > 0 ? Math.max(14, Math.round((d.minutes / max) * 100)) : 0;
    const today = i === days.length - 1 ? ' today' : '';
    return '<span class="pw-col' + today + '">' +
      '<span class="pw-track"><span class="pw-bar" style="height:' + h + '%"></span></span>' +
      '<span class="pw-day">' + letters[d.weekday] + '</span>' +
      '</span>';
  }).join('');
  return days;
}

/* ── LES 7 MATIÈRES RÉELLES — dépôt ARVEXA School (bac-*.json,
      niveau terminale, examen BAC). Vrais volumes documentés. ── */
const SUBJECTS = [
  { id: 'maths',    fr: 'Mathématiques',                     an: 'Mathematics',           icon: 'fa-square-root-variable', chapters: 11, notions: 154 },
  { id: 'physique', fr: 'Physique',                          an: 'Physics',               icon: 'fa-atom',                 chapters: 17, notions: 238 },
  { id: 'chimie',   fr: 'Chimie',                            an: 'Chemistry',             icon: 'fa-flask',                chapters: 9,  notions: 126 },
  { id: 'svt',      fr: 'Sciences de la vie et de la Terre', an: 'Life & Earth Sciences', icon: 'fa-leaf',                 chapters: 20, notions: 280 },
  { id: 'histoire', fr: 'Histoire',                          an: 'History',               icon: 'fa-landmark',             chapters: 8,  notions: 112 },
  { id: 'geo',      fr: 'Géographie',                        an: 'Geography',             icon: 'fa-earth-africa',         chapters: 9,  notions: 126 },
  { id: 'philo',    fr: 'Philosophie',                       an: 'Philosophy',            icon: 'fa-feather-pointed',      chapters: 13, notions: 182 },
];
const SUBJECTS_CH = SUBJECTS.reduce((a, s2) => a + s2.chapters, 0);   /* 87  */
const SUBJECTS_NO = SUBJECTS.reduce((a, s2) => a + s2.notions, 0);    /* 1218 */

/* Matière présélectionnée (connexion Réviser ↔ Examen) */
let selectedSubject = null;

/* ── BAC — même configuration que bac-date.js du site original :
      14 juillet ; la prochaine occurrence est calculée en direct. ── */
const BAC_CONFIG = { month: 6, day: 14 }; /* mois 0-based → 14 juillet */

function nextBacDate() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let d = new Date(now.getFullYear(), BAC_CONFIG.month, BAC_CONFIG.day);
  if (d < today) d = new Date(now.getFullYear() + 1, BAC_CONFIG.month, BAC_CONFIG.day);
  return d;
}

function daysUntil(date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.round((date - today) / 86400000));
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ═══════════════════════════════════════════════════════════════════
   VUE ACCUEIL — CARTE « CONTINUER » (v0.12, données réelles)
   Affiche la dernière révision enregistrée dans l'activité ; état
   vide tant qu'aucune révision n'existe.
   ═══════════════════════════════════════════════════════════════════ */

function updateContinue() {
  const titleEl = document.getElementById('continueTitle');
  const subEl = document.getElementById('continueSub');
  if (!titleEl || !subEl) return;

  const last = getActivity().last;
  if (last && last.title) {
    titleEl.textContent = last.title.length > 34 ? last.title.slice(0, 33) + '…' : last.title;
    const days = Math.floor((Date.now() - (last.at || Date.now())) / 86400000);
    subEl.textContent = days <= 0
      ? t('accueil.continuerAuj')
      : t('accueil.continuerIlYa').replace('{n}', String(days));
  } else {
    titleEl.textContent = t('accueil.continuer');
    subEl.textContent = t('accueil.continuerSub');
  }
}

/* ═══════════════════════════════════════════════════════════════════
   VUE RÉVISER — LES 7 MATIÈRES RÉELLES (v0.12)
   La grille est générée en JS : libellés traduits FR / AN, vrais
   volumes (chapitres / notions), pastille BAC. Le clic sur une
   matière mène à l'Examen avec la matière présélectionnée.
   ═══════════════════════════════════════════════════════════════════ */

function updateLibrary() {
  const grid = document.getElementById('libGrid');
  const count = document.getElementById('libCount');
  const heroSub = document.getElementById('libHeroSub');

  if (count) {
    count.textContent = t('reviser.countModel')
      .replace('{n}', String(SUBJECTS.length))
      .replace('{m}', String(SUBJECTS_CH));
  }

  /* Sous-titre du héros : matière réelle + niveau (traduit) */
  if (heroSub) {
    const svt = SUBJECTS.find((s2) => s2.id === 'svt');
    heroSub.textContent = (lang === 'an' ? svt.an : svt.fr) + ' · ' + t('reviser.heroMeta');
  }

  if (grid) {
    grid.innerHTML = SUBJECTS.map((s2) =>
      '<button type="button" class="lib-subject" data-subject="' + s2.id + '">' +
        '<span class="lib-subject-top">' +
          '<span class="lib-subject-chip" aria-hidden="true"><i class="fas ' + s2.icon + '"></i></span>' +
          '<span class="lib-subject-badge" aria-hidden="true">' + s2.chapters + '</span>' +
        '</span>' +
        '<span class="lib-subject-name">' + (lang === 'an' ? s2.an : s2.fr) + '</span>' +
        '<span class="lib-subject-meta">' + t('reviser.metaModel')
          .replace('{n}', String(s2.chapters)).replace('{m}', String(s2.notions)) + '</span>' +
        '<span class="lib-subject-ok">' + t('reviser.bac') + '</span>' +
      '</button>'
    ).join('');

    /* Clic matière → Examen, matière présélectionnée (SPA). */
    grid.querySelectorAll('.lib-subject').forEach((card) => {
      card.addEventListener('click', () => {
        selectedSubject = card.dataset.subject;
        goRoute('examen');
        updateExamen();
      });
    });
  }

  /* La recherche courante se réapplique à la grille fraîche. */
  filterLibrary();
}

/* ═══════════════════════════════════════════════════════════════════
   VUE EXAMEN (v0.12) — compte à rebours BAC réel, plan de révision
   calculé, 7 matières d'examen réelles. Connexion : un clic sur une
   matière ouvre la Bibliothèque filtrée sur cette matière.
   ═══════════════════════════════════════════════════════════════════ */

function updateExamen() {
  /* Compte à rebours (prochaine occurrence du BAC) */
  const bac = nextBacDate();
  const daysEl = document.getElementById('examDays');
  const dateEl = document.getElementById('examDate');
  const daysLeft = daysUntil(bac);
  if (daysEl) daysEl.textContent = String(daysLeft);
  if (dateEl) {
    const loc = lang === 'an' ? 'en-GB' : 'fr-FR';
    const dateStr = bac.toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    dateEl.textContent = t('examen.epreuve').replace('{date}', capitalize(dateStr));
  }

  /* Plan de révision : rythme réel (87 chapitres ÷ semaines restantes)
     et avancement réel (part de cours lus, même source que l'anneau). */
  const paceEl = document.getElementById('examPace');
  const planSub = document.getElementById('examPlanSub');
  const planFill = document.getElementById('examPlanFill');
  const weeksLeft = Math.max(1, Math.ceil(daysLeft / 7));
  const perWeek = Math.max(1, Math.ceil(SUBJECTS_CH / weeksLeft));
  if (paceEl) paceEl.textContent = t('examen.rythme').replace('{n}', String(perWeek));
  if (planSub) {
    planSub.textContent = t('examen.planModel')
      .replace('{n}', String(SUBJECTS_CH)).replace('{m}', String(SUBJECTS_NO));
  }
  if (planFill) {
    const stats = getRealStats();
    const pct = stats.courses > 0
      ? Math.min(100, Math.round(((stats.done || 0) / stats.courses) * 100))
      : 0;
    planFill.style.width = pct + '%';
  }

  const countEl = document.getElementById('examCount');
  if (countEl) countEl.textContent = t('examen.countModel').replace('{n}', String(SUBJECTS.length));

  /* Grille des matières (progression réelle : 0 % au départ —
     la progression par matière viendra avec les vrais cours). */
  const grid = document.getElementById('examGrid');
  if (grid) {
    grid.innerHTML = SUBJECTS.map((s2) => {
      const selected = selectedSubject === s2.id ? ' selected' : '';
      return (
        '<button type="button" class="exam-card' + selected + '" data-subject="' + s2.id + '">' +
          '<span class="exam-card-top">' +
            '<span class="exam-card-chip" aria-hidden="true"><i class="fas ' + s2.icon + '"></i></span>' +
            '<span class="exam-card-pct">0&nbsp;%</span>' +
          '</span>' +
          '<span class="exam-card-name">' + (lang === 'an' ? s2.an : s2.fr) + '</span>' +
          '<span class="exam-card-meta">' + t('reviser.metaModel')
            .replace('{n}', String(s2.chapters)).replace('{m}', String(s2.notions)) + '</span>' +
          '<span class="exam-card-bar" aria-hidden="true"><span></span></span>' +
        '</button>'
      );
    }).join('');

    /* Clic matière → Bibliothèque filtrée sur cette matière (SPA). */
    grid.querySelectorAll('.exam-card').forEach((card) => {
      card.addEventListener('click', () => {
        const subject = SUBJECTS.find((s3) => s3.id === card.dataset.subject);
        if (!subject) return;
        const search = document.getElementById('libSearch');
        if (search) {
          search.value = lang === 'an' ? subject.an : subject.fr;
          filterLibrary();
        }
        goRoute('reviser');
      });
    });
  }
}

/* ═══════════════════════════════════════════════════════════════════
   VUE PROFIL (v0.12) — identité réelle (Firebase), stats réelles,
   réglages RÉELS (thème + langue), compte et déconnexion.
   ═══════════════════════════════════════════════════════════════════ */

function updateProfil() {
  /* Identité : vrai profil Firestore (repli : cache 'arvexa_user') */
  const nameEl = document.getElementById('profName');
  const emailEl = document.getElementById('profEmail');
  const avatarEl = document.getElementById('profAvatar');
  const planEl = document.getElementById('profPlan');

  let firstName = '';
  let plan = 'gratuit';
  const profile = window.ARVXA_PROFILE || null;
  if (profile) {
    firstName = profile.firstName || '';
    plan = profile.plan || 'gratuit';
  } else {
    try {
      const user = JSON.parse(localStorage.getItem('arvexa_user') || 'null');
      if (user) {
        firstName = user.firstName || '';
        if (user.plan === 'premium') plan = 'premium';
      }
    } catch { /* JSON invalide */ }
  }

  const name = firstName || t('profil.defaultName');
  if (nameEl) nameEl.textContent = name;
  if (avatarEl) avatarEl.textContent = (name.trim().charAt(0) || 'A').toUpperCase();
  if (emailEl) {
    emailEl.textContent = (profile && profile.email) || '—';
  }
  if (planEl) {
    planEl.textContent = t(plan === 'premium' ? 'plan.premium' : 'plan.gratuit');
    planEl.classList.toggle('premium', plan === 'premium');
  }

  /* Statistiques réelles (mêmes sources que les autres écrans) */
  const act = getActivity();
  const stats = getRealStats();
  const done = Math.min(Math.max(0, Math.round(stats.courses)), Math.max(0, Math.round(stats.done || 0)));
  const sDone = document.getElementById('profStatDone');
  const sStreak = document.getElementById('profStatStreak');
  const sMinutes = document.getElementById('profStatMinutes');
  if (sDone) sDone.textContent = String(done);
  if (sStreak) sStreak.textContent = String(computeStreak(act.days));
  if (sMinutes) sMinutes.textContent = String(weekTotalMinutes(act.days));

  /* Réglage thème : libellé + interrupteur reflètent l'état réel */
  const dark = (window.ARVEXA_THEME ? window.ARVEXA_THEME.get() : 'dark') !== 'light';
  const switchEl = document.getElementById('profThemeSwitch');
  const themeName = document.getElementById('profThemeName');
  if (switchEl) switchEl.classList.toggle('on', dark);
  if (themeName) themeName.textContent = dark ? t('profil.theme') : t('profil.themeLight');

  /* Sélecteur de langue : état actif réel */
  document.querySelectorAll('.prof-langbtn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

/* ── Toasts ARVX — même design que les toasts auth du site
      original (injection sécurisée par textContent). ── */
function arvxToast(message, type = 'success', duration = 2600) {
  const container = document.getElementById('authToastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  const icon = document.createElement('i');
  icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
  toast.appendChild(icon);
  const span = document.createElement('span');
  span.textContent = String(message);
  toast.appendChild(span);
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ── CONNEXIONS INTER-PAGES (v0.12) — chaque carte mène quelque
      part, sans jamais recharger (SPA). ── */

/* Réviser : héros « Réviser ce cours » → Examen (SVT présélectionnée) */
document.getElementById('libRevise')?.addEventListener('click', () => {
  selectedSubject = 'svt';
  goRoute('examen');
  updateExamen();
});

/* Réviser : « Ajouter » → information honnête (import à venir) */
document.getElementById('libAdd')?.addEventListener('click', () => {
  arvxToast(t('reviser.ajoutBientot'));
});

/* Examen : Quiz éclair / Examen blanc → bientôt (clés IA à venir) */
['examQuiz', 'examWhite'].forEach((id) => {
  document.getElementById(id)?.addEventListener('click', () => {
    arvxToast(t('examen.bientotToast'));
  });
});

/* Profil : abonnement / rappels → bientôt */
['profAbo', 'profNotifs'].forEach((id) => {
  document.getElementById(id)?.addEventListener('click', () => {
    arvxToast(t('examen.bientotToast'));
  });
});

/* Profil : bascule de thème réelle (même moteur que le header) */
document.getElementById('profThemeRow')?.addEventListener('click', () => {
  window.ARVEXA_THEME.toggle();
});

/* Profil : sélecteur de langue réelle (même moteur que le menu) */
document.querySelectorAll('.prof-langbtn').forEach((btn) => {
  btn.addEventListener('click', () => setLang(btn.dataset.lang));
});

/* Profil : déconnexion — la même modale de confirmation que le menu */
function confirmLogout() {
  window.arvexaConfirm({
    title: t('deco.title'),
    message: t('deco.message'),
    icon: '⚠️',
    confirmText: t('deco.ok'),
    cancelText: t('deco.cancel'),
    variant: 'danger',
    onConfirm: performLogout,
  });
}
document.getElementById('profLogout')?.addEventListener('click', confirmLogout);
const prevLogout = document.getElementById('logoutBtn');
if (prevLogout && !prevLogout.dataset.arvxLogoutBound) {
  prevLogout.dataset.arvxLogoutBound = '1';
  prevLogout.addEventListener('click', (e) => {
    e.preventDefault();
    confirmLogout();
  });
}

/* ── AMORÇAGE v0.12 — premier rendu complet, données initialisées ── */
applyLang();
