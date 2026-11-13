/** Texte ARVX — Inter embarquée (400 · 500 · 700 · 800). Le 600 est rendu en 700. */
import React from 'react';
import { Text, TextStyle } from 'react-native';

const FAMILLES = {
  400: 'Inter_400Regular',
  500: 'Inter_500Medium',
  600: 'Inter_700Bold',
  700: 'Inter_700Bold',
  800: 'Inter_800ExtraBold',
} as const;

export type Poids = keyof typeof FAMILLES;

interface TxtProps {
  children?: React.ReactNode;
  taille?: number;
  poids?: Poids;
  couleur?: string;
  align?: 'left' | 'center' | 'right';
  espacement?: number;
  hauteur?: number;
  style?: TextStyle;
  nbLignes?: number;
}

export function Txt({
  children,
  taille = 13,
  poids = 400,
  couleur = '#17223B',
  align = 'left',
  espacement,
  hauteur,
  style,
  nbLignes,
}: TxtProps) {
  return (
    <Text
      numberOfLines={nbLignes}
      style={[
        {
          fontFamily: FAMILLES[poids],
          fontSize: taille,
          lineHeight: hauteur ?? Math.round(taille * 1.45),
          color: couleur,
          textAlign: align,
          letterSpacing: espacement,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function police(poids: Poids): string {
  return FAMILLES[poids];
}
