/** Matières connues — la carte n'existe que si au moins un cours l'a révélée. */
import { Ionicons } from '@expo/vector-icons';
import { MATIERES, MatiereId } from '@/theme/tokens';

export type NomIcone = keyof typeof Ionicons.glyphMap;

export const ICONE_MATIERE: Record<MatiereId, NomIcone> = {
  maths: 'calculator-outline',
  physique: 'flask-outline',
  svt: 'leaf-outline',
  histoire: 'earth-outline',
  francais: 'book-outline',
  langues: 'language-outline',
  autre: 'cube-outline',
};

export function matiereNom(id: MatiereId): string {
  return MATIERES[id].nom;
}

export function matiereCouleur(id: MatiereId): string {
  return MATIERES[id].couleur;
}

/** Liste ordonnée pour les écrans de sélection. */
export const MATIERES_ORDREES: MatiereId[] = [
  'maths', 'physique', 'svt', 'histoire', 'francais', 'langues', 'autre',
];
