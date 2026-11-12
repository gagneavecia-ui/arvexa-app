/* ═══════════════════════════════════════════════════════════════════
   ARVX v0.13 — BAKO, LA MASCOTTE (personnage ORIGINAL)
   Un camarade d'étude dessiné pour ARVX : peau chaude, HOODIE VERT
   de marque, CASQUETTE OR avec le X, LUNETTES RONDES or — rien à
   voir avec un quelconque personnage existant (couleurs, costume,
   accessoire, proportions : tout est issu de la palette ARVX).
   Comportements (plus riches qu'un simple avatar) :
     · idle      — respire, cligne des yeux
     · talk      — bouche animée quand il parle
     · think     — tête penchée + bulles de pensée (préparation GO)
     · cheer     — sautille (fin de séance réussie)
     · wave      — salue / encourage du bras
     · sleep     — s'endort après une longue inactivité (Zzz)
     · sit       — s'assoit pendant le mode focus
     · walk      — traverse l'écran d'un pas léger à chaque page
   Bulle de message DRAGGABLE (position mémorisée).
   Le CHAT IA restera désactivé jusqu'à réception des clés API —
   l'interface est déjà prévue (window.ARVXA_BAKO.chat).
   ═══════════════════════════════════════════════════════════════════ */

const LAYER = document.getElementById('bakoLayer');
const FIGURE = document.getElementById('bakoFigure');
const BUBBLE = document.getElementById('bakoBubble');
const BUBBLE_TEXT = document.getElementById('bakoBubbleText');

/* ── Le dessin — SVG original ARVX ─────────────────────────────── */
const BAKO_SVG = `
<svg viewBox="0 0 104 108" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Bako">
  <!-- ombre au sol -->
  <ellipse cx="52" cy="103" rx="26" ry="4.5" fill="rgba(0,0,0,0.32)"/>

  <!-- jambes (pantalons sombres + baskets vertes) -->
  <g class="bako-legs">
    <g class="bako-leg-l">
      <rect x="42" y="82" width="9" height="15" rx="4" fill="#23231F"/>
      <rect x="40" y="94" width="14" height="7" rx="3.5" fill="#2D7D5A"/>
      <rect x="40" y="98.5" width="14" height="2.5" rx="1.2" fill="#F5F0E8"/>
    </g>
    <g class="bako-leg-r">
      <rect x="53" y="82" width="9" height="15" rx="4" fill="#23231F"/>
      <rect x="51" y="94" width="14" height="7" rx="3.5" fill="#2D7D5A"/>
      <rect x="51" y="98.5" width="14" height="2.5" rx="1.2" fill="#F5F0E8"/>
    </g>
  </g>

  <!-- groupe corps : respire (idle), reste immobile (sit) -->
  <g class="bako-body">
    <!-- bras gauche (pendant) -->
    <g class="bako-arm-l">
      <rect x="30" y="60" width="8" height="22" rx="4" fill="#16301F"/>
      <circle cx="34" cy="84" r="4.5" fill="#A9714B"/>
    </g>

    <!-- bras droit (salue) -->
    <g class="bako-arm-r">
      <rect x="66" y="60" width="8" height="22" rx="4" fill="#16301F"/>
      <circle cx="70" cy="84" r="4.5" fill="#A9714B"/>
    </g>

    <!-- hoodie vert de marque -->
    <path d="M35 60 Q35 56 40 55 L64 55 Q69 56 69 60 L69 80 Q69 86 62 86 L42 86 Q35 86 35 80 Z" fill="#1A3A2A"/>
    <!-- poche kangourou -->
    <path d="M42 74 L62 74 L62 80 Q62 82 59 82 L45 82 Q42 82 42 80 Z" fill="#2A5A3A"/>
    <!-- fermeture centrale + lacets or -->
    <line x1="52" y1="57" x2="52" y2="73" stroke="#0F2418" stroke-width="1.6"/>
    <line x1="47" y1="58" x2="48" y2="66" stroke="#E0B84A" stroke-width="1.4" stroke-linecap="round"/>
    <line x1="57" y1="58" x2="56" y2="66" stroke="#E0B84A" stroke-width="1.4" stroke-linecap="round"/>
    <circle cx="48" cy="67" r="1.3" fill="#E0B84A"/>
    <circle cx="56" cy="67" r="1.3" fill="#E0B84A"/>
    <!-- écharpe or -->
    <path d="M38 53 Q52 60 66 53 L66 58 Q52 65 38 58 Z" fill="#E0B84A"/>
    <rect x="60" y="56" width="7" height="10" rx="3" fill="#C89A2A"/>

    <!-- tête (penche quand il réfléchit) -->
    <g class="bako-head">
      <!-- oreilles -->
      <circle cx="35" cy="39" r="3.4" fill="#A9714B"/>
      <circle cx="69" cy="39" r="3.4" fill="#A9714B"/>
      <!-- visage -->
      <circle cx="52" cy="38" r="15.5" fill="#A9714B"/>
      <!-- yeux ouverts (clignent) -->
      <g class="bako-eyes-open">
        <g class="bako-eyes-l">
          <ellipse cx="45.5" cy="38" rx="4.2" ry="5" fill="#FFFFFF"/>
          <circle cx="46.5" cy="38.6" r="2.3" fill="#1C1310"/>
          <circle cx="45.6" cy="37.2" r="0.9" fill="#FFFFFF"/>
        </g>
        <g class="bako-eyes-r">
          <ellipse cx="58.5" cy="38" rx="4.2" ry="5" fill="#FFFFFF"/>
          <circle cx="57.5" cy="38.6" r="2.3" fill="#1C1310"/>
          <circle cx="58.4" cy="37.2" r="0.9" fill="#FFFFFF"/>
        </g>
      </g>
      <!-- yeux fermés (endormi) -->
      <g class="bako-eyes-closed" opacity="0">
        <path d="M42 38.5 Q45.5 41 49 38.5" stroke="#1C1310" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <path d="M55 38.5 Q58.5 41 62 38.5" stroke="#1C1310" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      </g>
      <!-- sourcils -->
      <path d="M41.5 31.5 Q45.5 29.5 49.5 31.2" stroke="#5C3A22" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <path d="M54.5 31.2 Q58.5 29.5 62.5 31.5" stroke="#5C3A22" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <!-- bouche (parle) -->
      <path class="bako-mouth" d="M46 45.5 Q52 50.5 58 45.5" stroke="#5C3A22" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- LUNETTES RONDES or — la signature de Bako -->
      <g class="bako-glasses">
        <circle cx="45.5" cy="38" r="7" fill="rgba(255,255,255,0.10)" stroke="#E0B84A" stroke-width="1.9"/>
        <circle cx="58.5" cy="38" r="7" fill="rgba(255,255,255,0.10)" stroke="#E0B84A" stroke-width="1.9"/>
        <line x1="52.5" y1="37.2" x2="51.5" y2="37.2" stroke="#E0B84A" stroke-width="1.9"/>
        <line x1="38.5" y1="37.4" x2="35.6" y2="38.4" stroke="#E0B84A" stroke-width="1.9" stroke-linecap="round"/>
        <line x1="65.5" y1="37.4" x2="68.4" y2="38.4" stroke="#E0B84A" stroke-width="1.9" stroke-linecap="round"/>
        <!-- reflets des verres -->
        <path d="M41.5 34.5 A5.5 5.5 0 0 1 45 33" stroke="rgba(255,255,255,0.55)" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        <path d="M54.5 34.5 A5.5 5.5 0 0 1 58 33" stroke="rgba(255,255,255,0.55)" stroke-width="1.2" fill="none" stroke-linecap="round"/>
      </g>
      <!-- CASQUETTE or avec le X d'ARVX -->
      <g class="bako-cap">
        <path d="M37 27.5 Q37 17 52 17 Q67 17 67 27.5 L67 29 L37 29 Z" fill="#E0B84A"/>
        <path d="M52 17 Q46 17 42 19 L42 28 L52 28 Z" fill="#D9AC3D"/>
        <ellipse cx="52" cy="29.4" rx="27" ry="4.4" fill="#8A6508"/>
        <!-- le X de marque sur la casquette -->
        <path d="M49 20.5 L55 26 M55 20.5 L49 26" stroke="#141210" stroke-width="2.1" stroke-linecap="round"/>
      </g>
    </g>
  </g>

  <!-- bulles de pensée (réfléchit) -->
  <g class="bako-think">
    <circle cx="82" cy="34" r="3" fill="none" stroke="#E0B84A" stroke-width="1.4"/>
    <circle cx="88" cy="27" r="4.4" fill="none" stroke="#E0B84A" stroke-width="1.4"/>
    <circle cx="95" cy="19" r="5.8" fill="none" stroke="#E0B84A" stroke-width="1.6"/>
  </g>

  <!-- Zzz (endormi) -->
  <g class="bako-zzz" fill="#E0B84A" font-family="Inter, Arial, sans-serif" font-weight="700">
    <text x="76" y="40" font-size="9">Z</text>
    <text x="82" y="32" font-size="11">Z</text>
    <text x="88" y="22" font-size="13">Z</text>
  </g>
</svg>`;

FIGURE.innerHTML = BAKO_SVG;

/* ── États d'animation ─────────────────────────────────────── */
const ANIMS = ['idle', 'talk', 'think', 'cheer', 'wave', 'sleep', 'sit', 'walk'];
let currentAnim = 'idle';
let baseAnim = 'idle'; /* l'anim « de fond » de la page — restaurée
                          après chaque bulle (ex. : assis pendant le
                          mode focus, malgré les encouragements). */

function setAnim(name, isBase = true) {
  if (!ANIMS.includes(name)) name = 'idle';
  currentAnim = name;
  if (isBase) baseAnim = name;
  FIGURE.classList.remove(...ANIMS.map((a) => 'bako-anim-' + a));
  FIGURE.classList.add('bako-anim-' + name);
}

/* ── Bulle de message (draggable, position mémorisée) ──────────── */
const BUBBLE_POS_KEY = 'arvexa-bako-bubble';
let bubbleDx = 0;
let bubbleDy = 0;

try {
  const saved = JSON.parse(localStorage.getItem(BUBBLE_POS_KEY) || 'null');
  if (saved && Number.isFinite(saved.dx) && Number.isFinite(saved.dy)) {
    bubbleDx = Math.max(-220, Math.min(60, saved.dx));
    bubbleDy = Math.max(-160, Math.min(60, saved.dy));
  }
} catch { /* stockage indisponible */ }

function applyBubblePos() {
  BUBBLE.style.transform = 'translate(' + bubbleDx + 'px, ' + bubbleDy + 'px)';
}
applyBubblePos();

(function bindBubbleDrag() {
  let dragging = false;
  let sx = 0, sy = 0, ox = 0, oy = 0;
  BUBBLE.addEventListener('pointerdown', (e) => {
    dragging = true;
    sx = e.clientX; sy = e.clientY; ox = bubbleDx; oy = bubbleDy;
    BUBBLE.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  BUBBLE.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    bubbleDx = Math.max(-220, Math.min(60, ox + (e.clientX - sx)));
    bubbleDy = Math.max(-160, Math.min(60, oy + (e.clientY - sy)));
    applyBubblePos();
  });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    try { localStorage.setItem(BUBBLE_POS_KEY, JSON.stringify({ dx: bubbleDx, dy: bubbleDy })); } catch { /* stockage indisponible */ }
  };
  BUBBLE.addEventListener('pointerup', end);
  BUBBLE.addEventListener('pointercancel', end);
})();

let bubbleTimer = null;

/* Mode discret : pendant la SÉANCE, Bako n'affiche JAMAIS de bulle
   (aucun pixel ne recouvre le lecteur de flashcards) — il ne fait
   qu'animer son corps. */
function isQuiet() {
  return LAYER && LAYER.classList.contains('bako-quiet');
}

function say(text, { ttl = 2800, anim = 'talk' } = {}) {
  if (anim) setAnim(anim, false);
  if (isQuiet()) return; /* séance : animation seule */
  if (!BUBBLE || !BUBBLE_TEXT) return;
  BUBBLE_TEXT.textContent = String(text);
  BUBBLE.hidden = false;
  /* re-déclenche l'animation d'entrée */
  BUBBLE.classList.remove('bako-bubble-in');
  void BUBBLE.offsetWidth;
  BUBBLE.classList.add('bako-bubble-in');
  if (bubbleTimer) clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => {
    BUBBLE.hidden = true;
    if (currentAnim !== 'sleep' && currentAnim !== 'sit' && currentAnim !== 'think') {
      setAnim(baseAnim, false);
    }
  }, ttl);
}

/* Tap n'importe où → la bulle s'efface (jamais un obstacle collant). */
window.addEventListener('pointerdown', (e) => {
  if (!BUBBLE || BUBBLE.hidden) return;
  if (BUBBLE.contains(e.target) || FIGURE.contains(e.target)) return;
  BUBBLE.hidden = true;
  if (bubbleTimer) { clearTimeout(bubbleTimer); bubbleTimer = null; }
  if (currentAnim === 'talk' || currentAnim === 'wave' || currentAnim === 'cheer') {
    setAnim(baseAnim, false);
  }
}, true);

/* ── Visibilité par page (Accueil · rapide · focus · séance) ───── */
const VISIBLE_ROUTES = ['accueil', 'rapide', 'focus', 'seance'];

function routeNow() {
  return decodeURIComponent(location.hash.replace(/^#\/?/, '')).split('?')[0] || 'accueil';
}

function syncVisibility() {
  if (!LAYER) return false;
  const route = routeNow();
  const show = VISIBLE_ROUTES.includes(route);
  LAYER.hidden = !show;
  /* Séance : mode discret (bulle interdite, silhouette décorative).
     Rapide / focus : Bako se lève au-dessus de la zone GO / durées et
     devient décoratif (jamais un bouton bloqué). Accueil : son spot —
     on peut le toucher pour une astuce. */
  LAYER.classList.toggle('bako-quiet', route === 'seance');
  LAYER.classList.toggle('bako-nodeco', route === 'rapide' || route === 'focus');
  LAYER.classList.toggle('bako-lift', route === 'rapide' || route === 'focus' || route === 'seance');
  LAYER.classList.toggle('bako-lift2', route === 'focus');
  return show;
}

/* ── Répliques FR / AN (textes originaux ARVX) ─────────────────── */
function langNow() {
  if (window.ARVXA_lang) return window.ARVXA_lang();
  try { return localStorage.getItem('arvexa-lang') === 'an' ? 'an' : 'fr'; } catch { return 'fr'; }
}

function userName() {
  try {
    const u = JSON.parse(localStorage.getItem('arvexa_user') || 'null');
    return (u && u.firstName) || '';
  } catch { return ''; }
}

const LINES = {
  greetNamed: {
    fr: (n) => 'Salut ' + n + ' ! Prêt(e) pour ta séance ?',
    an: (n) => 'Hi ' + n + '! Ready for your session?',
  },
  greet: {
    fr: () => 'Salut ! Je suis Bako — ton camarade de révision.',
    an: () => 'Hi! I’m Bako — your study buddy.',
  },
  rapide: {
    fr: () => 'Appuie sur GO — je prépare tout.',
    an: () => 'Hit GO — I’ll prepare everything.',
  },
  focus: {
    fr: () => 'Un cycle à la fois. Je reste avec toi.',
    an: () => 'One cycle at a time. I’ll stay with you.',
  },
  seance: {
    fr: () => 'Réponds dans ta tête, puis révèle !',
    an: () => 'Answer in your head, then reveal!',
  },
  tips: {
    fr: [
      'Une fiche à la fois — c’est comme ça qu’on gagne.',
      'La régularité bat la quantité, toujours.',
      'Relis ta réponse à voix haute : ça s’ancre mieux.',
      '5 minutes valent mieux que 0 minute.',
    ],
    an: [
      'One card at a time — that’s how you win.',
      'Consistency beats quantity, always.',
      'Say your answer out loud — it sticks better.',
      'Five minutes beat zero minutes.',
    ],
  },
};

/* ── Sommeil d'inactivité (accueil uniquement) ─────────────────── */
let idleTimer = null;

function armIdleSleep() {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (routeNow() !== 'accueil' || !syncVisibility()) return;
    setAnim('sleep');
    say(langNow() === 'an' ? 'Zzz… wake me with a tap.' : 'Zzz… réveille-moi d’un petit toucher.', { ttl: 3400 });
  }, 45000);
}

function wakeUp() {
  if (currentAnim === 'sleep') {
    setAnim('wave');
    say(langNow() === 'an' ? 'I’m here!' : 'Je suis là !', { ttl: 1600 });
  }
  armIdleSleep();
}

window.addEventListener('pointerdown', wakeUp, { passive: true });
window.addEventListener('keydown', wakeUp);

/* ── Arrivée sur une page : salut, marche d'entrée ─────────────── */
let lastRoute = null;

function greetRoute(route) {
  const lang = langNow();
  /* L'anim « de fond » de la page — restaurée après chaque bulle. */
  setAnim(route === 'seance' ? 'sit' : 'idle');
  if (route === 'accueil') {
    const name = userName();
    say(name ? LINES.greetNamed[lang](name) : LINES.greet[lang](), { ttl: 3600, anim: 'wave' });
  } else if (route === 'rapide') {
    say(LINES.rapide[lang](), { ttl: 3000, anim: 'talk' });
  } else if (route === 'focus') {
    say(LINES.focus[lang](), { ttl: 3000, anim: 'sit' });
  } else if (route === 'seance') {
    /* Séance : bulle interdite — Bako s'assoit en silence. */
  }
}

window.addEventListener('hashchange', () => {
  const route = routeNow();
  if (route === lastRoute) return;
  lastRoute = route;
  const show = syncVisibility();
  if (!show) return;

  /* Petite entrée en marchant (jamais sur la séance : pas de distraction) */
  if (route !== 'seance') {
    FIGURE.classList.add('bako-anim-walk');
    LAYER.style.transform = 'translateX(90px)';
    LAYER.style.opacity = '0';
    requestAnimationFrame(() => {
      LAYER.style.transition = 'transform 0.7s ease, opacity 0.7s ease';
      LAYER.style.transform = 'translateX(0)';
      LAYER.style.opacity = '1';
    });
    setTimeout(() => {
      FIGURE.classList.remove('bako-anim-walk');
      LAYER.style.transition = '';
      /* Anim de fond — jamais un 'idle' brutal qui écraserait un état
         demandé entre-temps (Bako réfléchit au GO, etc.). */
      setAnim(baseAnim, false);
    }, 760);
  }
  greetRoute(route);
  armIdleSleep();
});

/* ── Tap sur Bako : astuce d'étude (le chat IA viendra avec les clés) ── */
FIGURE.addEventListener('click', () => {
  const lang = langNow();
  const tips = LINES.tips[lang];
  say(tips[Math.floor(Math.random() * tips.length)], { ttl: 3400, anim: 'talk' });
});

/* ── API publique — utilisée par js/main.js ────────────────────── */
window.ARVXA_BAKO = {
  say,
  set: setAnim,
  /* Chat IA : volontairement désactivé jusqu'aux clés API. */
  chat: null,
};

/* ── Amorçage : page courante, salue après le voile de démarrage ── */
lastRoute = routeNow();
setTimeout(() => {
  const show = syncVisibility();
  if (show) {
    setAnim('idle');
    greetRoute(lastRoute);
    armIdleSleep();
  }
}, 700);
