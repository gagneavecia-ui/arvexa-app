/**
 * ARVX — Design system « Encre claire » (planche v3, inspiration AXIA).
 * Jetons normatifs : aucun état improvisé au développement.
 */
export const C = {
  fond: '#F6F7FB',
  surface: '#FFFFFF',
  elevation: '#F1F3F9',
  contour: '#E3E7F1',
  contourFort: '#D6DBEA',
  encre: '#1F2A44',
  encreTeinte: 'rgba(31, 42, 68, 0.06)',
  encreTeinteForte: 'rgba(31, 42, 68, 0.12)',
  texte: '#17223B',
  texteSecond: '#5C6579',
  texteAttenu: '#8B94A8',
  succes: '#2FA36B',
  succesTeinte: 'rgba(47, 163, 107, 0.12)',
  erreur: '#E4574C',
  erreurTeinte: 'rgba(228, 87, 76, 0.10)',
  blanc: '#FFFFFF',
} as const;

/** Couleurs des matières — attribuées automatiquement à la détection. */
export const MATIERES = {
  maths: { id: 'maths', nom: 'Mathématiques', couleur: '#6F6BF0' },
  physique: { id: 'physique', nom: 'Physique-Chimie', couleur: '#B05CF6' },
  svt: { id: 'svt', nom: 'SVT', couleur: '#2FA36B' },
  histoire: { id: 'histoire', nom: 'Histoire-Géo', couleur: '#E8873C' },
  francais: { id: 'francais', nom: 'Français / Philo', couleur: '#D64560' },
  langues: { id: 'langues', nom: 'Langues', couleur: '#3B8CEB' },
  autre: { id: 'autre', nom: 'Informatique / Autre', couleur: '#1A8A88' },
} as const;

export type MatiereId = keyof typeof MATIERES;

export const RAYON = {
  champ: 8,
  bouton: 12,
  carte: 16,
  puce: 999,
} as const;

/** Grille d'espacement : multiple de 4 pt · gouttière d'écran 20 px. */
export const ESP = {
  gouttiere: 20,
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 20,
  xxl: 28,
} as const;

/** Échelle typographique — Inter embarquée (400 · 500 · 700 · 800). */
export const T = {
  titreAccueil: { size: 24, weight: '800' as const, color: C.texte },
  titrePage: { size: 19, weight: '800' as const, color: C.texte },
  titreCarte: { size: 15, weight: '700' as const, color: C.texte },
  corps: { size: 13, weight: '400' as const, color: C.texteSecond },
  corpsFonce: { size: 13, weight: '400' as const, color: C.texte },
  etiquette: { size: 11, weight: '700' as const, color: C.texteAttenu, letterSpacing: 1.2 },
  legende: { size: 10, weight: '600' as const, color: C.texteAttenu },
  chiffre: { size: 22, weight: '800' as const, color: C.encre },
} as const;
