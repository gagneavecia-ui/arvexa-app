/**
 * Agrégats ARVX — recalculés des sources, jamais stockés.
 * Promesse n°10 : un chiffre n'est jamais affiché sans donnée réelle derrière.
 */
import { Cours, Tentative, Evenement } from '@/lib/arvx/types';
import { MatiereId } from '@/lib/arvx/tokens';

export interface ChiffresAccueil {
  nbCours: number;
  revisions7j: number;
  moyenne: number | null;
}

export function chiffresAccueil(cours: Cours[], tentatives: Tentative[], evenements: Evenement[]): ChiffresAccueil {
  const il7j = Date.now() - 7 * 24 * 3600 * 1000;
  const revisions7j = evenements.filter((e) => e.type === 'reviser' && new Date(e.at).getTime() >= il7j).length;
  const terminees = tentatives.filter((t) => t.statut === 'termine' && t.scorePct !== null);
  const moyenne =
    terminees.length > 0
      ? Math.round(terminees.reduce((s, t) => s + (t.scorePct ?? 0), 0) / terminees.length)
      : null;
  return { nbCours: cours.length, revisions7j, moyenne };
}

/** Cours à reprendre : celui consulté le plus récemment (lastStepSeen est écrit à l'ouverture du détail). */
export function coursAReprendre(cours: Cours[]): Cours | null {
  const visibles = cours.filter((c) => c.tempsPasseSec > 0 || c.lastStepSeen > 0);
  if (visibles.length === 0) return null;
  return visibles.sort((a, b) => (b.analyzedAt > a.analyzedAt ? 1 : -1))[0] ?? null;
}

export interface EtatMatiere {
  matiere: MatiereId;
  nbCours: number;
  etapesTotal: number;
  etapesFaites: number;
  revisePct: number;
  moyenne: number | null;
  dernierAjoutIso: string;
}

export function etatsMatieres(cours: Cours[], tentatives: Tentative[]): EtatMatiere[] {
  const parMatiere = new Map<MatiereId, Cours[]>();
  for (const c of cours) {
    const liste = parMatiere.get(c.matiere) ?? [];
    liste.push(c);
    parMatiere.set(c.matiere, liste);
  }
  const etats: EtatMatiere[] = [];
  parMatiere.forEach((liste, matiere) => {
    const etapesTotal = liste.reduce((s, c) => s + c.etapes.length, 0);
    const etapesFaites = liste.reduce((s, c) => s + c.etapes.filter((e) => e.etat === 'done').length, 0);
    const courseIds = new Set(liste.map((c) => c.id));
    const scores = tentatives
      .filter((t) => t.statut === 'termine' && t.questions.some((q) => courseIds.has(q.courseId)))
      .map((t) => t.scorePct ?? 0);
    etats.push({
      matiere,
      nbCours: liste.length,
      etapesTotal,
      etapesFaites,
      revisePct: etapesTotal > 0 ? Math.round((etapesFaites / etapesTotal) * 100) : 0,
      moyenne: scores.length > 0 ? Math.round(scores.reduce((s, x) => s + x, 0) / scores.length) : null,
      dernierAjoutIso: liste.map((c) => c.createdAt).sort().reverse()[0] ?? '',
    });
  });
  return etats.sort((a, b) => (a.dernierAjoutIso < b.dernierAjoutIso ? 1 : -1));
}

/** Série de jours actifs : jours consécutifs avec au moins un événement réviser/examen. */
export function serieJours(evenements: Evenement[]): number {
  const jours = new Set(
    evenements
      .filter((e) => e.type === 'reviser' || e.type === 'examen')
      .map((e) => new Date(e.at).toISOString().slice(0, 10))
  );
  if (jours.size === 0) return 0;
  const aujourdhui = new Date();
  const cle = (d: Date) => {
    const x = new Date(d);
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  };
  let curseur = new Date(aujourdhui);
  if (!jours.has(cle(curseur))) {
    curseur.setDate(curseur.getDate() - 1);
    if (!jours.has(cle(curseur))) return 0;
  }
  let serie = 0;
  while (jours.has(cle(curseur))) {
    serie += 1;
    curseur = new Date(curseur);
    curseur.setDate(curseur.getDate() - 1);
  }
  return serie;
}

export interface BilanProgression {
  serie: number;
  tempsRevisSec: number;
  examensPasses: number;
  etats: EtatMatiere[];
  aRenforcer: { cours: Cours; erreurs: number } | null;
}

export function bilanProgression(cours: Cours[], tentatives: Tentative[], evenements: Evenement[]): BilanProgression {
  const terminees = tentatives.filter((t) => t.statut === 'termine');
  const erreurs = new Map<string, number>();
  for (const t of terminees) {
    for (const [id, n] of Object.entries(t.erreursParCours)) {
      erreurs.set(id, (erreurs.get(id) ?? 0) + n);
    }
  }
  let aRenforcer: { cours: Cours; erreurs: number } | null = null;
  for (const [id, n] of [...erreurs.entries()].sort((a, b) => b[1] - a[1])) {
    const coursTrouve = cours.find((c) => c.id === id);
    if (coursTrouve) {
      aRenforcer = { cours: coursTrouve, erreurs: n };
      break;
    }
  }
  return {
    serie: serieJours(evenements),
    tempsRevisSec: cours.reduce((s, c) => s + c.tempsPasseSec, 0),
    examensPasses: terminees.length,
    etats: etatsMatieres(cours, tentatives),
    aRenforcer,
  };
}

/** Temps total révisé humain + compteur des 3 chiffres d'Accueil. */
export function etapesTerminees(cours: Cours[]): { faites: number; total: number } {
  return {
    faites: cours.reduce((s, c) => s + c.etapes.filter((e) => e.etat === 'done').length, 0),
    total: cours.reduce((s, c) => s + c.etapes.length, 0),
  };
}
