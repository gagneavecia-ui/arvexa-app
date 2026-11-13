/**
 * ARVX — pipeline d'analyse d'un cours (déclenché par « Analyser mon cours »).
 * 1. Extraction (texte collé — direct) · 2. Détection de la matière ·
 * 3. Résumé · 4. Pas à pas · 5. Banque de questions · 6. Enregistrement.
 *
 * Moteur d'analyse embarqué sur l'appareil : aucun réseau requis, aucune
 * donnée envoyée. L'interface `AnalyseResultat` restera la même quand le
 * moteur distant (IA serveur) prendra le relais.
 */
import { MatiereId } from '@/theme/tokens';
import { melange, uuid } from '@/lib/format';
import { Question } from '@/lib/types';

/* ───────────────────────── normalisation ───────────────────────── */

export function normalise(texte: string): string {
  return texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, ' ')
    .replace(/[œ]/g, 'oe')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Découpe en phrases sans lookbehind (compatibilité Hermes). */
export function decouperPhrases(texte: string): string[] {
  const phrases: string[] = [];
  let cur = '';
  const fin = /[.!?]/;
  for (let i = 0; i < texte.length; i++) {
    const ch = texte[i];
    cur += ch;
    if (fin.test(ch)) {
      const next = i + 1 >= texte.length ? ' ' : texte[i + 1];
      if (next === ' ' || next === '\n' || next === '\t') {
        const p = cur.trim();
        if (p.length > 0) phrases.push(p);
        cur = '';
      }
    }
  }
  const reste = cur.trim();
  if (reste.length > 0) phrases.push(reste);
  return phrases.filter((p) => p.replace(/[^\p{L}\p{N}]/gu, '').length >= 8);
}

function compter(texteNormalise: string, mot: string): number {
  const re = new RegExp(`\\b${mot.replace(/\s+/g, '\\s+')}\\b`, 'g');
  const found = texteNormalise.match(re);
  return Math.min(found ? found.length : 0, 3);
}

/* ───────────────────────── 2 · détection de la matière ───────────────────────── */

const MARQUEURS_FORTS: Record<MatiereId, string[]> = {
  maths: ['mathematique', 'mathematiques', 'cours de math', 'lecon de math', 'algebre', 'geometrie', 'arithmetique', 'trigonometrie'],
  physique: ['physique', 'chimie', 'physique chimie', 'mecanique', 'electricite'],
  svt: ['svt', 'science de la vie', 'sciences de la vie', 'biologie', 'biologique'],
  histoire: ['histoire', 'geographie', 'histoire geo'],
  francais: ['francais', 'philosophie', 'philo', 'grammaire', 'conjugaison', 'litterature'],
  langues: ['anglais', 'espagnol', 'allemand', 'langue vivante', 'vocabulary', 'grammar'],
  autre: ['informatique', 'algorithmique', 'programmation', 'algorithm', 'coding', 'droit', 'economie', 'comptabilite', 'gestion'],
};

const MOTS_CLES: Record<MatiereId, string[]> = {
  maths: [
    'equation', 'inequation', 'fonction', 'derivee', 'integrale', 'primitive', 'theoreme', 'pythagore', 'thales',
    'matrice', 'probabilite', 'polynome', 'fraction', 'limite', 'vecteur', 'sinus', 'cosinus', 'tangente',
    'hypotenuse', 'factorisation', 'coordonnees', 'repere', 'pourcentage', 'logarithme', 'exponentielle',
    'perimetre', 'volume', 'angle', 'cercle', 'bissectrice', 'mediane', 'developpement', 'racine carree',
    'nombre complexe', 'suite numerique', 'somme', 'produit', 'quotient', 'valeur absolue',
  ],
  physique: [
    'force', 'energie', 'vitesse', 'acceleration', 'masse', 'newton', 'joule', 'watt', 'tension', 'courant',
    'resistance', 'circuit', 'ampere', 'volt', 'ohm', 'champ magnetique', 'onde', 'frequence', 'gravitation',
    'gravite', 'pression', 'temperature', 'chaleur', 'conduction', 'convection', 'rayonnement', 'atome', 'noyau',
    'proton', 'neutron', 'electron', 'radioactivite', 'molecule', 'ion', 'acide', 'mole', 'concentration',
    'oxydation', 'optique', 'miroir', 'lentille', 'refraction', 'densite', 'archimede', 'inertie', 'puissance',
  ],
  svt: [
    'cellule', 'adn', 'arn', 'proteine', 'organisme', 'photosynthese', 'genetique', 'heredite', 'allele',
    'evolution', 'ecosysteme', 'respiration', 'digestion', 'enzyme', 'chromosome', 'mitose', 'meiose',
    'reproduction', 'sang', 'coeur', 'poumons', 'neurone', 'hormone', 'immunite', 'bacterie', 'virus',
    'biologie', 'geologie', 'roche', 'volcan', 'seisme', 'tectonique', 'chlorophylle', 'pollen', 'tissu',
    'organe', 'nutrition', 'embryon',
  ],
  histoire: [
    'guerre', 'revolution', 'empire', 'royaume', 'siecle', 'civilisation', 'colonisation', 'independance',
    'decolonisation', 'esclavage', 'traite negriere', 'monarchie', 'republique', 'election', 'constitution',
    'population', 'demographie', 'relief', 'fleuve', 'delta', 'sahara', 'sahel', 'urbanisation', 'migration',
    'songhai', 'tombouctou', 'kanem', 'frontiere', 'climat', 'ressource', 'pacte', 'alliance', 'dynastie',
    'protectorat', 'nationalisme',
  ],
  francais: [
    'verbe', 'conjugaison', 'grammaire', 'orthographe', 'roman', 'poesie', 'poeme', 'auteur', 'narrateur',
    'personnage', 'figure de style', 'metaphore', 'comparaison', 'hyperbole', 'litote', 'argumentation',
    'dissertation', 'commentaire', 'champ lexical', 'registre', 'fable', 'comedie', 'tragedie', 'strophe',
    'rime', 'synonyme', 'antonyme', 'vocabulaire', 'accord', 'participe passe', 'imparfait', 'subordonnee',
    'discours direct', 'focalisation', 'philosophie', 'conscience', 'liberte', 'existence', 'dialectique',
    'these', 'antithese',
  ],
  langues: [
    'english', 'verb', 'tense', 'word', 'sentence', 'grammar', 'vocabulary', 'listening', 'reading', 'writing',
    'past simple', 'present perfect', 'plural', 'pronoun', 'adverb', 'adjective', 'preterit', 'will', 'should',
    'traduire', 'traduction', 'espagnol', 'allemand', 'verbe irregulier', 'mot anglais',
  ],
  autre: [
    'algorithme', 'programme', 'code', 'variable', 'boucle', 'condition', 'ordinateur', 'logiciel', 'reseau',
    'internet', 'donnee', 'base de donnees', 'binaire', 'octet', 'python', 'javascript', 'html', 'css',
    'fichier', 'processeur', 'clavier', 'capteur', 'robot', 'marche', 'offre', 'demande', 'inflation', 'pib',
    'entreprise', 'budget', 'monnaie', 'commerce', 'contrat', 'loi', 'tribunal', 'penal', 'civil',
  ],
};

export type Confiance = 'elevee' | 'moyenne' | 'faible';

export interface Detection {
  matiere: MatiereId;
  confiance: Confiance;
}

const LIBELLE_CONFIANCE: Record<Confiance, string> = {
  elevee: 'confiance élevée',
  moyenne: 'confiance moyenne',
  faible: 'confiance faible',
};

export function libelleConfiance(c: Confiance): string {
  return LIBELLE_CONFIANCE[c];
}

export function detecterMatiere(contenu: string): Detection {
  const t = normalise(contenu.slice(0, 20000));
  const ids: MatiereId[] = ['maths', 'physique', 'svt', 'histoire', 'francais', 'langues', 'autre'];
  const scores: Record<string, number> = {};
  let total = 0;
  for (const id of ids) {
    let s = 0;
    for (const m of MARQUEURS_FORTS[id]) s += compter(t, m) * 8;
    for (const k of MOTS_CLES[id]) s += compter(t, k);
    scores[id] = s;
    total += s;
  }
  let meilleur: MatiereId = 'autre';
  let max = 0;
  for (const id of ids) {
    if (scores[id] > max) {
      max = scores[id];
      meilleur = id;
    }
  }
  let confiance: Confiance = 'faible';
  if (max >= 12) confiance = 'elevee';
  else if (max >= 5) confiance = 'moyenne';
  return { matiere: meilleur, confiance };
}

/* ───────────────────────── 3 · résumé ───────────────────────── */

const MARQUEURS_IMPORTANTS = [
  'il faut', 'on doit', 'permet de', 'signifie', 'définition', 'definition', 'important', 'retenir',
  'formule', 'se calcule', 'la regle', 'la règle', 'théorème', 'theoreme', 'propriété', 'propriete',
  'consequence', 'conséquence', 'exemple :', 'rappel :', 'attention', 'principe', 'etapes', 'étapes',
];

function estImportante(phrase: string): boolean {
  const n = normalise(phrase);
  if (MARQUEURS_IMPORTANTS.some((m) => n.includes(normalise(m)))) return true;
  if (/\d/.test(phrase) && phrase.length < 180) return true;
  return false;
}

function couper(texte: string, max: number): string {
  if (texte.length <= max) return texte;
  const coupe = texte.slice(0, max);
  const derniere = Math.max(coupe.lastIndexOf(' '), coupe.lastIndexOf('\n'));
  return (derniere > max * 0.6 ? coupe.slice(0, derniere) : coupe).trimEnd() + '…';
}

export function redigerResume(contenu: string): string {
  const phrases = decouperPhrases(contenu.replace(/\n+/g, ' '));
  if (phrases.length === 0) return couper(contenu.trim(), 240);
  const intro = couper(phrases.slice(0, 2).join(' '), 260);
  const cles = phrases.filter((p, i) => i > 1 && estImportante(p)).slice(0, 5);
  const suite = (cles.length > 0 ? cles : phrases.slice(2, 5)).map((p) => `• ${p}`).join('\n');
  return `${intro}\n\n${suite}`.trim();
}

/* ───────────────────────── 4 · pas à pas ───────────────────────── */

const MARQUEURS_PROGRESSION = [
  'd abord', 'ensuite', 'puis', 'enfin', 'donc', 'ainsi', 'alors', 'parce que', 'si ', 'il faut',
  'on peut', 'permet de', 'signifie', 'correspond', 'se calcule', 'la formule', 'premiere etape',
  'premierement', 'deuxiemement', 'resultat', 'exemple', 'en resume', 'conclusion',
];

export function construireEtapes(contenu: string): string[] {
  const phrases = decouperPhrases(contenu.replace(/\n+/g, ' '));
  const candidates = phrases.filter((p) => p.length >= 50 && p.length <= 260);
  if (candidates.length === 0) {
    return phrases.slice(0, 4);
  }
  const marquees = candidates.map((p, i) => ({
    p,
    i,
    score: MARQUEURS_PROGRESSION.filter((m) => normalise(p).includes(m)).length + (estImportante(p) ? 1 : 0),
  }));
  const retenues = marquees
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .sort((a, b) => a.i - b.i)
    .map((x) => x.p);
  const etapes = retenues.length >= 4 ? retenues : candidates.slice(0, 6);
  return etapes.map((p) => couper(p, 240));
}

/* ───────────────────────── 5 · banque de questions ───────────────────────── */

const MOTS_OUTILS = new Set([
  'plusieurs', 'toujours', 'ensemble', 'beaucoup', 'generalement', 'precisement', 'directement', 'important',
  'different', 'notamment', 'premiere', 'premier', 'deuxieme', 'troisieme', 'derniere', 'premierement',
  'deuxiemement', 'exemple', 'exemples', 'notion', 'notions', 'cours', 'lecon', 'chapitre', 'partie',
  'question', 'questions', 'reponse', 'reponses', 'certains', 'certaines', 'chacun', 'chacune', 'divers',
  'diverses', 'plusieurs', 'quelle', 'quelles', 'quand', 'comment', 'pourquoi', 'combien', 'cependant',
  'toutefois', 'parceque', 'ensuite', 'maintenant', 'aujourdhui', 'avant', 'apres', 'entre', 'contre',
  'servent', 'sert', 'faire', 'fait', 'faut', 'peut', 'peuvent', 'doit', 'doivent', 'etre', 'avoir', 'avant',
]);

function motsNotables(phrases: string[]): string[] {
  const compteur = new Map<string, number>();
  for (const p of phrases) {
    for (const mot of normalise(p).split(' ')) {
      if (mot.length >= 6 && !MOTS_OUTILS.has(mot) && !/^\d+$/.test(mot)) {
        compteur.set(mot, (compteur.get(mot) ?? 0) + 1);
      }
    }
  }
  return [...compteur.entries()].sort((a, b) => b[1] - a[1]).map(([m]) => m);
}

interface Definition {
  terme: string;
  predicat: string;
  phrase: string;
}

function extraireDefinitions(phrases: string[]): Definition[] {
  const defs: Definition[] = [];
  const verbes = ['est', 'sont', 'désigne', 'désignent', 'permet de', 'permettent de', 'correspond à', 'correspondent à', 'signifie', 'se définit comme', 'se calcule'];
  for (const p of phrases) {
    const courte = p.replace(/^[«"'\s]+/, '').replace(/[»"'\s.]+$/, '');
    for (const v of verbes) {
      const idx = courte.toLowerCase().indexOf(v.toLowerCase());
      if (idx >= 3 && idx <= 70) {
        const terme = courte.slice(0, idx).trim();
        const predicat = courte.slice(idx + v.length).trim();
        if (terme.split(' ').length <= 6 && terme.length >= 3 && predicat.length >= 12 && predicat.length <= 170) {
          defs.push({ terme, predicat, phrase: courte });
          break;
        }
      }
    }
  }
  return defs;
}

function optionsPour(correcte: string, distracteurs: string[]): string[] | null {
  const uniques: string[] = [];
  const vue = new Set([normalise(correcte)]);
  for (const d of distracteurs) {
    const n = normalise(d);
    if (!vue.has(n)) {
      vue.add(n);
      uniques.push(d);
    }
    if (uniques.length === 3) break;
  }
  if (uniques.length < 3) return null;
  const choix = melange([correcte, ...uniques]);
  return choix;
}

export function fabriquerQuestions(courseId: string, titre: string, matiere: MatiereId, contenu: string, cible = 20): Question[] {
  const phrases = decouperPhrases(contenu.replace(/\n+/g, ' '));
  const questions: Question[] = [];
  const vues = new Set<string>();

  const base = {
    courseId,
    courseTitre: titre,
    matiere,
  };

  /* stratégie 1 — QCM de définitions */
  const defs = extraireDefinitions(phrases);
  const predicats = defs.map((d) => d.predicat);
  const fragments = phrases
    .map((p) => p.replace(/^[A-ZÉÈÀÇa-zéèàç«"'\s]{0,30}(?:permet de|est|sont|signifie)\s+/i, '').slice(0, 100))
    .filter((f) => f.length >= 25);
  for (const d of defs) {
    if (questions.length >= cible) break;
    const correcte = couper(d.predicat, 100);
    const distracteurs = [...predicats.filter((p) => p !== d.predicat), ...fragments].map((x) => couper(x, 100));
    const choix = optionsPour(correcte, distracteurs);
    if (!choix) continue;
    const prompt = `Que sait-on sur « ${d.terme} » ?`;
    if (vues.has(prompt)) continue;
    vues.add(prompt);
    questions.push({
      id: uuid(),
      ...base,
      prompt,
      choix,
      reponse: choix.indexOf(correcte),
      explication: `Extrait du cours « ${titre} » : ${d.phrase}.`,
    });
  }

  /* stratégie 2 — phrases à compléter sur les mots notables */
  const notables = motsNotables(phrases);
  for (const phrase of phrases) {
    if (questions.length >= cible) break;
    if (phrase.length < 40 || phrase.length > 220) continue;
    const mots = phrase.split(/\s+/);
    let cible2: string | null = null;
    for (const mot of mots) {
      const n = normalise(mot).replace(/[^a-z0-9]/g, '');
      if (n.length >= 6 && !MOTS_OUTILS.has(n) && notables.includes(n)) {
        cible2 = mot;
        break;
      }
    }
    if (!cible2) continue;
    const correcte = cible2.replace(/[.,;:!?»"'(]/g, '');
    if (correcte.length < 5) continue;
    const distracteurs = notables
      .filter((n) => n !== normalise(correcte))
      .slice(0, 12)
      .map((n) => n.charAt(0).toUpperCase() + n.slice(1));
    const choix = optionsPour(correcte, distracteurs);
    if (!choix) continue;
    const prompt = couper(phrase.replace(cible2, '____'), 200);
    if (vues.has(prompt)) continue;
    vues.add(prompt);
    questions.push({
      id: uuid(),
      ...base,
      prompt: `Complète : « ${prompt} »`,
      choix,
      reponse: choix.indexOf(correcte),
      explication: `Extrait du cours « ${titre} » : ${phrase}`,
    });
  }

  /* stratégie 3 — compléter à partir de tous les mots notables, même peu fréquents */
  if (questions.length < Math.min(cible, 10)) {
    for (const phrase of phrases) {
      if (questions.length >= Math.min(cible, 12)) break;
      if (phrase.length < 60 || phrase.length > 200) continue;
      const mots = phrase.split(/\s+/);
      let cible3: string | null = null;
      for (const mot of mots) {
        const n = normalise(mot).replace(/[^a-z0-9]/g, '');
        if (n.length >= 7 && !MOTS_OUTILS.has(n)) {
          cible3 = mot;
          break;
        }
      }
      if (!cible3) continue;
      const correcte = cible3.replace(/[.,;:!?»"'(]/g, '');
      if (correcte.length < 6) continue;
      const distracteurs = notables
        .filter((n) => n !== normalise(correcte))
        .slice(0, 10)
        .map((n) => n.charAt(0).toUpperCase() + n.slice(1));
      const choix = optionsPour(correcte, distracteurs);
      if (!choix) continue;
      const prompt = `Complète : « ${couper(phrase.replace(cible3, '____'), 200)} »`;
      if (vues.has(prompt)) continue;
      vues.add(prompt);
      questions.push({
        id: uuid(),
        ...base,
        prompt,
        choix,
        reponse: choix.indexOf(correcte),
        explication: `Extrait du cours « ${titre} » : ${phrase}`,
      });
    }
  }

  return melange(questions).slice(0, cible);
}

/* ───────────────────────── le pipeline complet ───────────────────────── */

export interface AnalyseResultat {
  detection: Detection;
  resume: string;
  etapes: string[];
  questions: Question[];
}

export function analyserCours(contenu: string): AnalyseResultat {
  const detection = detecterMatiere(contenu);
  const resume = redigerResume(contenu);
  const etapes = construireEtapes(contenu);
  const questions = fabriquerQuestions('pending', 'pending', detection.matiere, contenu);
  return { detection, resume, etapes, questions };
}
