/* ═══════════════════════════════════════════════════════════════════
   ARVX v0.14 — TRANSPORT IA (client)
   Un seul point de passage vers /api/ai (fonction serverless Vercel).
   Les clés API restent côté serveur : le client n'envoie que la
   tâche + les données pédagogiques, il ne voit jamais de clé.

   window.ARVXA_AI = {
     ok()                     — le transport est disponible ?
     ask(task, payload)       — Promise<{ provider, data }>
       tasks : 'quiz' | 'exam' | 'course' | 'chat'
     errMessage(code)         — message FR/AN pour un code d'erreur
   }

   Aucune dépendance ; les erreurs réseau dégénèrent proprement
   (l'app reste 100 % utilisable hors IA).
   ═══════════════════════════════════════════════════════════════════ */

const AI_ENDPOINT = '/api/ai';
const AI_TIMEOUT_MS = 50000;

class AiError extends Error {
  constructor(code) {
    super(code);
    this.code = code; /* 'network' | 'rate' | 'ai_error' | 'bad' */
  }
}

function langNow() {
  try {
    if (typeof window.ARVXA_lang === 'function') return window.ARVXA_lang();
    return localStorage.getItem('arvexa-lang') === 'an' ? 'an' : 'fr';
  } catch { return 'fr'; }
}

async function ask(task, payload = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), AI_TIMEOUT_MS);
  let res;
  try {
    res = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, lang: langNow(), ...payload }),
      signal: ctrl.signal,
    });
  } catch {
    clearTimeout(timer);
    throw new AiError('network');
  }
  clearTimeout(timer);

  let body = null;
  try { body = await res.json(); } catch { /* réponse illisible */ }

  if (!res.ok || !body || body.ok !== true) {
    const code = (body && body.error) || 'ai_error';
    throw new AiError(code === 'rate' ? 'rate' : (res.status >= 400 && res.status < 500 ? 'bad' : 'ai_error'));
  }
  return { provider: body.provider, data: body.data };
}

function ok() {
  /* Le transport marche partout où /api/ai répond — même en local
     (les tests simulent la route). La disponibilité RÉELLE se voit
     à l'appel : les erreurs sont traduites et non bloquantes. */
  return typeof fetch === 'function';
}

const MSG = {
  fr: {
    network: 'Connexion impossible — vérifie ton réseau.',
    rate: 'Trop de demandes — réessaie dans quelques minutes.',
    ai_error: 'L’IA est indisponible — réessaie dans un instant.',
    bad: 'Demande refusée — réessaie.',
  },
  an: {
    network: 'Can’t connect — check your network.',
    rate: 'Too many requests — try again in a few minutes.',
    ai_error: 'AI is unavailable — try again in a moment.',
    bad: 'Request refused — try again.',
  },
};

function errMessage(code) {
  const l = langNow();
  return (MSG[l] && MSG[l][code]) || MSG.fr.ai_error || 'IA indisponible';
}

window.ARVXA_AI = { ok, ask, errMessage, AiError };
