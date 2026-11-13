/** Modèle de données ARVX — deux producteurs (Réviser, Examens), des agrégats recalculés. */
import { MatiereId } from '@/theme/tokens';

export type SourceCours = 'texte' | 'photo' | 'pdf';
export type EtatEtape = 'todo' | 'doing' | 'done';

export interface Etape {
  id: string;
  texte: string;
  etat: EtatEtape;
}

export interface Question {
  id: string;
  /** cours d'origine — la question se souvient toujours d'où elle vient */
  courseId: string;
  courseTitre: string;
  matiere: MatiereId;
  prompt: string;
  choix: string[];
  reponse: number;
  explication: string;
}

export interface Cours {
  id: string;
  titre: string;
  matiere: MatiereId;
  source: SourceCours;
  /** texte extrait de la source */
  contenu: string;
  resume: string;
  etapes: Etape[];
  /** banque de questions prête pour Examens */
  questions: Question[];
  createdAt: string;
  analyzedAt: string;
  /** pour la carte « Reprendre » de l'Accueil */
  lastStepSeen: number;
  /** temps réellement passé sur le détail du cours (s) */
  tempsPasseSec: number;
}

export type StatutTentative = 'en_cours' | 'termine';

export interface Tentative {
  id: string;
  titre: string;
  mode: 'cible' | 'global';
  courseIds: string[];
  createdAt: string;
  completedAt: string | null;
  statut: StatutTentative;
  /** configuration */
  questionsDemandees: number;
  limiteMin: number | null;
  /** chronomètre */
  dureeSec: number;
  depassement: boolean;
  /** passage */
  questions: Question[];
  reponses: (number | null)[];
  revelations: boolean[];
  /** résultats */
  scorePct: number | null;
  bonnes: number | null;
  /** erreurs regroupées par cours — alimente « à renforcer » */
  erreursParCours: Record<string, number>;
}

export interface Session {
  nom: string;
  email: string;
  createdAt: string;
}

export interface Prefs {
  langue: 'fr' | 'an';
  theme: 'clair' | 'sombre';
  plan: 'gratuit';
}

export interface Evenement {
  id: string;
  type: 'cours' | 'reviser' | 'examen';
  at: string;
  courseId?: string;
  matiere?: MatiereId;
}
