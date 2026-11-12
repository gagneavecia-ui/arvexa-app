/* ═══════════════════════════════════════════════════════════════════
   ARVX v0.14 — PASSERELLE IA (fonction serverless Vercel, Node)
   Les clés API vivent UNIQUEMENT dans les variables d'environnement
   Vercel (GROQ_API_KEY / OPENROUTER_API_KEY / GEMINI_API_KEY).
   Aucune clé n'apparaît dans le client, ni ici, ni ailleurs.

   Rôle : un point d'entrée unique /api/ai pour toutes les fonctions
   IA de l'app, avec une CHAÎNE DE FOURNISSEURS (Groq → OpenRouter →
   Gemini) : si l'un échoue ou traîne, le suivant prend le relais.

   Tâches (toutes renvoient du JSON strict) :
     quiz   — QCM éclair (5 questions, matière, langue)
     exam   — examen blanc (questions ouvertes + réponses attendues)
     course — structuration d'un cours collé par l'élève en fiches
     chat   — le camarade d'étude (réponse courte, persona Bako)

   Garde-fous :
     · POST seul, corps JSON borné (32 Ko), champs bornés
     · limite de débit glissante par IP (20 req / 10 min, best-effort)
     · délai d'attente par fournisseur (AbortController)
     · messages d'erreur génériques — jamais de détail d'API
   ═══════════════════════════════════════════════════════════════════ */

const MAX_BODY = 32 * 1024;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 20;
const PROVIDER_TIMEOUT_MS = 25000;
const TOTAL_BUDGET_MS = 32000; /* on répond toujours avant la limite Vercel */
const RETRY_BACKOFF_MS = 1200;

/* ── Modèles ──
   Chaîne : OpenRouter (modèle gratuit, marche partout) → Gemini
   (secours, régime US) → Groq (dernier recours). */
const OPENROUTER_MODELS = [
  'nvidia/nemotron-3-ultra-550b-a55b:free',
  'google/gemma-4-31b-it:free',
  'nvidia/nemotron-3-lightning:free',
];
const GEMINI_MODELS = ['gemini-3.8-flash', 'gemini-flash-latest'];
const GROQ_MODEL = 'llama-3.3-70b-versatile';

/* ── Limites par tâche (champs reçus du client) ─────────────────── */
const LIMITS = {
  quiz:   { maxTokens: 1400, temperature: 0.55 },
  exam:   { maxTokens: 2200, temperature: 0.6 },
  course: { maxTokens: 2600, temperature: 0.4 },
  chat:   { maxTokens: 350,  temperature: 0.7 },
  history: 8,        /* messages de chat max renvoyés par le client */
  content: 12000,    /* caractères de cours collés max */
  text: 300,         /* champs courts max (titres, messages chat) */
};

/* ═══════════════════════════════════════════════════════════════════
   PROMPT SYSTÈME — la voix pédagogique ARVX (une seule source).
   `lang` : 'fr' | 'an' (an → anglais). Les modèles doivent répondre
   UNIQUEMENT en JSON valide, sans markdown, sans commentaire.
   ═══════════════════════════════════════════════════════════════════ */

function sysLang(lang) {
  return lang === 'an'
    ? 'Write EVERYTHING in English. '
    : 'Écris TOUT en français. ';
}

function systemPrompt(task, lang) {
  const base =
    'Tu es le professeur particulier de l’application ARVX, ' +
    'préparation du BAC (terminale, lycée francophone d’Afrique de l’Ouest). ' +
    sysLang(lang) +
    'Tu réponds UNIQUEMENT avec un objet JSON valide, sans texte autour, ' +
    'sans markdown, sans balise de code. Contenu toujours fidèle au ' +
    'programme officiel — jamais d’invention.';

  if (task === 'quiz') {
    return base +
      ' Ton JSON : {"questions":[{"q":"énoncé court","choices":' +
      '["a","b","c","d"],"answer":0,"why":"justification en ≤ 20 mots"}]} ' +
      'avec "answer" = index (0-3) de la bonne réponse. ' +
      'Questions piégeuses typiques de l’épreuve, une seule bonne ' +
      'réponse par question, distracteurs plausibles.';
  }
  if (task === 'exam') {
    return base +
      ' Ton JSON : {"questions":[{"q":"énoncé de l’exercice",' +
      '"answer":"réponse attendue rédigée en 2 à 4 phrases"}]} ' +
      'Questions type BAC (restitution + raisonnement), difficulté ' +
      'réaliste, réponses attendues corrigées et complètes.';
  }
  if (task === 'course') {
    return base +
      ' Ton JSON : {"title":"titre propre","summary":"résumé en ' +
      '1 phrase","notions":[{"term":"terme","def":"définition"}],' +
      '"cards":[{"q":"question précise","a":"réponse exacte"}]} ' +
      '6 à 12 fiches tirées DU CONTENU FOURNI uniquement ; si le ' +
      'contenu est trop court, couvre les bases essentielles du thème. ' +
      'Réponses courtes (≤ 220 caractères), mémorisables.';
  }
  /* chat */
  return 'Tu es Bako, le camarade d’étude de l’app ARVX (BAC ' +
    'terminale). ' + sysLang(lang) +
    'Tu réponds en conversation : chaleureux, direct, encourageant, ' +
    'JAMAIS plus de 60 mots, pas de markdown, pas d’emoji. Tu aides à ' +
    'réviser : définitions, explications courtes, mini-exercices, ' +
    'astuces de mémorisation. Si la question sort du programme scolaire, ' +
    'ramène gentiment vers les révisions. Réponds avec ce JSON ' +
    'uniquement : {"reply":"ta réponse"}';
}

/* ═══════════════════════════════════════════════════════════════════
   UTILITAIRES
   ═══════════════════════════════════════════════════════════════════ */

function json(res, status, obj) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) { reject(new Error('too_large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

/* Extraction JSON robuste : les modèles ajoutent parfois des clôtures
   markdown, un préambule, ou réfléchissent à voix haute (<think>). */
function extractJSON(text) {
  if (!text) return null;
  const t = String(text)
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/```(?:json)?/gi, '')
    .trim();
  try { return JSON.parse(t); } catch { /* on tente la fenêtre {…} */ }
  const a = t.indexOf('{');
  const b = t.lastIndexOf('}');
  if (a === -1 || b <= a) return null;
  try { return JSON.parse(t.slice(a, b + 1)); } catch { return null; }
}

async function fetchJSON(url, options, { retries = 0 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), PROVIDER_TIMEOUT_MS);
    try {
      const r = await fetch(url, { ...options, signal: ctrl.signal });
      const body = await r.text();
      if (!r.ok) {
        /* 429 → courte attente puis nouvel essai (tiers gratuit) */
        if (r.status === 429 && attempt < retries) {
          await new Promise((res) => setTimeout(res, RETRY_BACKOFF_MS));
          continue;
        }
        const err = new Error('provider_' + r.status);
        err.status = r.status;
        throw err;
      }
      return JSON.parse(body);
    } finally {
      clearTimeout(timer);
    }
  }
}

/* ── Appel par fournisseur → texte brut ─────────────────────────── */

async function callGroq(sys, user, maxTokens, temperature, jsonMode) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('no_key');
  const body = {
    model: GROQ_MODEL,
    messages: [
      { role: 'system', content: sys },
      { role: 'user', content: user },
    ],
    temperature,
    max_tokens: maxTokens,
  };
  if (jsonMode) body.response_format = { type: 'json_object' };
  const j = await fetchJSON('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return j.choices && j.choices[0] && j.choices[0].message
    ? j.choices[0].message.content : null;
}

async function callOpenRouter(sys, user, maxTokens, temperature /*, jsonMode */) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('no_key');
  let lastErr = null;
  for (const model of OPENROUTER_MODELS) {
    try {
      const j = await fetchJSON('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + key,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://arvexa.app',
          'X-Title': 'ARVX',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: sys },
            { role: 'user', content: user },
          ],
          temperature,
          max_tokens: maxTokens,
        }),
      }, { retries: 1 });
      return j.choices && j.choices[0] && j.choices[0].message
        ? j.choices[0].message.content : null;
    } catch (e) {
      lastErr = e; /* modèle limité → essaie le suivant */
    }
  }
  throw lastErr || new Error('openrouter_failed');
}

async function callGemini(sys, user, maxTokens, temperature, jsonMode) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('no_key');
  let lastErr = null;
  for (const model of GEMINI_MODELS) {
    try {
      const gen = { temperature, maxOutputTokens: maxTokens };
      if (jsonMode) gen.responseMimeType = 'application/json';
      const j = await fetchJSON(
        'https://generativelanguage.googleapis.com/v1beta/models/' +
        model + ':generateContent?key=' + encodeURIComponent(key),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: sys }] },
            contents: [{ role: 'user', parts: [{ text: user }] }],
            generationConfig: gen,
          }),
        }
      );
      const cand = j.candidates && j.candidates[0];
      const parts = cand && cand.content && cand.content.parts;
      return parts && parts.length
        ? parts.map((p) => p.text || '').join('') : null;
    } catch (e) {
      lastErr = e; /* modèle retiré → essaie le suivant */
    }
  }
  throw lastErr || new Error('gemini_failed');
}

const PROVIDERS = [
  ['openrouter', callOpenRouter],
  ['gemini', callGemini],
  ['groq', callGroq],
];

/* Chaîne : premier fournisseur qui renvoie un JSON exploitable gagne.
   Budget temps global : jamais plus de TOTAL_BUDGET_MS avant réponse —
   la fonction Vercel a sa propre limite (maxDuration). */
async function generate(task, lang, user, { jsonMode = true } = {}) {
  const sys = systemPrompt(task, lang);
  const lim = LIMITS[task];
  const t0 = Date.now();
  const errors = [];
  for (const [name, fn] of PROVIDERS) {
    if (Date.now() - t0 > TOTAL_BUDGET_MS && errors.length) {
      errors.push('budget');
      break;
    }
    try {
      const raw = await fn(sys, user, lim.maxTokens, lim.temperature, jsonMode);
      const data = extractJSON(raw);
      if (data) return { provider: name, data };
      errors.push(name + ': unparsable');
    } catch (e) {
      errors.push(name + ': ' + (e.message || 'error'));
    }
  }
  const err = new Error('all_providers_failed');
  err.detail = errors.join(' | ');
  throw err;
}

/* ═══════════════════════════════════════════════════════════════════
   VALIDATION DES DEMANDES
   ═══════════════════════════════════════════════════════════════════ */

function clip(s, n) { return String(s || '').slice(0, n).trim(); }

function sanitize(task, p) {
  const out = { lang: p.lang === 'an' ? 'an' : 'fr' };
  if (task === 'quiz' || task === 'exam') {
    out.subject = clip(p.subject, 60);
    if (!out.subject) return null;
    out.count = task === 'quiz' ? 5 : Math.min(10, Math.max(4, Number(p.count) || 10));
    return out;
  }
  if (task === 'course') {
    out.title = clip(p.title, 120);
    out.subject = clip(p.subject, 60);
    out.content = clip(p.content, LIMITS.content);
    if (!out.title || !out.content) return null;
    return out;
  }
  if (task === 'chat') {
    const hist = Array.isArray(p.messages) ? p.messages.slice(-LIMITS.history) : [];
    out.messages = hist
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant'))
      .map((m) => ({ role: m.role, content: clip(m.content, LIMITS.text) }))
      .filter((m) => m.content);
    if (!out.messages.length || out.messages[out.messages.length - 1].role !== 'user') return null;
    return out;
  }
  return null;
}

function buildUserPrompt(task, v) {
  if (task === 'quiz') {
    return 'Matière : ' + v.subject + '. Niveau : terminale (BAC). ' +
      'Génère exactement 5 questions à choix multiples (4 choix, une ' +
      'seule bonne réponse, index "answer"). Varie les chapitres et les ' +
      'difficultés. JSON seulement.';
  }
  if (task === 'exam') {
    return 'Matière : ' + v.subject + '. Niveau : terminale (BAC). ' +
      'Génère exactement ' + v.count + ' questions ouvertes type épreuve ' +
      '(barème implicite 2 à 4 points), avec pour chacune la réponse ' +
      'attendue rédigée. JSON seulement.';
  }
  if (task === 'course') {
    return 'Matière : ' + (v.subject || 'général') + '. Titre voulu : ' +
      v.title + '.\nCONTENU FOURNI PAR L’ÉLÈVE (source unique, ne rien ' +
      'inventer au-delà) :\n"""' + v.content + '"""';
  }
  /* chat */
  return v.messages
    .map((m) => (m.role === 'user' ? 'Élève : ' : 'Bako : ') + m.content)
    .join('\n') + '\nRéponds au dernier message de l’élève.';
}

/* ═══════════════════════════════════════════════════════════════════
   LIMITE DE DÉBIT (glissante, en mémoire — best-effort serverless)
   ═══════════════════════════════════════════════════════════════════ */

const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (arr.length >= RATE_MAX) { hits.set(ip, arr); return true; }
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear(); /* garde-fou mémoire */
  return false;
}

/* ═══════════════════════════════════════════════════════════════════
   HANDLER
   ═══════════════════════════════════════════════════════════════════ */

async function handler(req, res) {
  if (req.method !== 'POST') { json(res, 405, { ok: false, error: 'method' }); return; }

  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    (req.socket && req.socket.remoteAddress) || 'ip';
  if (rateLimited(ip)) { json(res, 429, { ok: false, error: 'rate' }); return; }

  let payload;
  try {
    payload = JSON.parse(await readBody(req));
  } catch {
    json(res, 400, { ok: false, error: 'bad_request' });
    return;
  }

  const task = payload && typeof payload.task === 'string' ? payload.task : '';
  if (!LIMITS[task]) { json(res, 400, { ok: false, error: 'bad_task' }); return; }

  const v = sanitize(task, payload || {});
  if (!v) { json(res, 400, { ok: false, error: 'bad_request' }); return; }

  try {
    const { provider, data } = await generate(task, v.lang, buildUserPrompt(task, v));
    if (!validShape(task, data)) {
      json(res, 502, { ok: false, error: 'ai_error' });
      return;
    }
    json(res, 200, { ok: true, provider, data: normalize(task, data) });
  } catch (e) {
    json(res, 502, { ok: false, error: 'ai_error' });
  }
}

module.exports = handler;
module.exports.maxDuration = 45;

/* Formes attendues — on refuse le JSON hors-sujet. */
function validShape(task, d) {
  if (!d || typeof d !== 'object') return false;
  if (task === 'quiz') {
    return Array.isArray(d.questions) && d.questions.length > 0 &&
      d.questions.every((q) => q && typeof q.q === 'string' &&
        Array.isArray(q.choices) && q.choices.length === 4 &&
        Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 3);
  }
  if (task === 'exam') {
    return Array.isArray(d.questions) && d.questions.length > 0 &&
      d.questions.every((q) => q && typeof q.q === 'string' && typeof q.answer === 'string');
  }
  if (task === 'course') {
    return typeof d.title === 'string' && Array.isArray(d.cards) &&
      d.cards.length > 0 &&
      d.cards.every((c) => c && typeof c.q === 'string' && typeof c.a === 'string');
  }
  return typeof d.reply === 'string' && d.reply.trim().length > 0; /* chat */
}

/* Normalisation douce (bornes, trims) avant envoi au client. */
function normalize(task, d) {
  const cut = (s, n) => String(s || '').slice(0, n);
  if (task === 'quiz') {
    return { questions: d.questions.slice(0, 5).map((q) => ({
      q: cut(q.q, 400),
      choices: q.choices.slice(0, 4).map((c) => cut(c, 160)),
      answer: q.answer,
      why: cut(q.why || '', 220),
    })) };
  }
  if (task === 'exam') {
    return { questions: d.questions.slice(0, 10).map((q) => ({
      q: cut(q.q, 500),
      answer: cut(q.answer, 900),
    })) };
  }
  if (task === 'course') {
    return {
      title: cut(d.title, 120),
      summary: cut(d.summary || '', 240),
      notions: Array.isArray(d.notions)
        ? d.notions.slice(0, 20).map((n) => ({ term: cut(n.term, 80), def: cut(n.def, 300) }))
        : [],
      cards: d.cards.slice(0, 16).map((c) => ({ q: cut(c.q, 300), a: cut(c.a, 400) })),
    };
  }
  return { reply: cut(d.reply, 700) }; /* chat */
}
