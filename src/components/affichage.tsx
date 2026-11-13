/** Affichage ARVX — badges, puces, cartes, compteurs, barres, anneau de score, états vides. */
import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle, TextStyle, StyleProp } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { C, RAYON } from '@/theme/tokens';
import { MatiereId, MATIERES } from '@/theme/tokens';
import { Txt } from '@/components/txt';
import { matiereCouleur, matiereNom } from '@/lib/matieres';

/* ───────────────────────── badges ───────────────────────── */

export type TypeBadge = 'ok' | 'encours' | 'avenir' | 'acontinuer' | 'erreur';

const BADGES: Record<TypeBadge, { libelle: string; fond: string; texte: string }> = {
  ok: { libelle: 'Résumé prêt', fond: C.succesTeinte, texte: C.succes },
  encours: { libelle: 'Analyse en cours', fond: C.elevation, texte: C.texteSecond },
  avenir: { libelle: 'À venir', fond: C.elevation, texte: C.texteAttenu },
  acontinuer: { libelle: 'À continuer', fond: C.encreTeinteForte, texte: C.encre },
  erreur: { libelle: 'Erreur', fond: C.erreurTeinte, texte: C.erreur },
};

export function Badge({ type, libelle }: { type: TypeBadge; libelle?: string }) {
  const b = BADGES[type];
  return (
    <View style={[styles.badge, { backgroundColor: b.fond }]}>
      <Txt taille={9} poids={600} couleur={b.texte}>
        {libelle ?? b.libelle}
      </Txt>
    </View>
  );
}

export function PuceMatiere({ matiere }: { matiere: MatiereId }) {
  return (
    <View style={styles.puce}>
      <View style={[styles.point, { backgroundColor: matiereCouleur(matiere) }]} />
      <Txt taille={10} poids={700} couleur={C.texteSecond}>
        {matiereNom(matiere)}
      </Txt>
    </View>
  );
}

/* ───────────────────────── cartes ───────────────────────── */

export function Carte({
  children,
  style,
  onPress,
  onLongPress,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onLongPress?: () => void;
}) {
  if (onPress || onLongPress) {
    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={450}
        style={({ pressed }) => [styles.carte, pressed && { opacity: 0.9 }, style]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.carte, style]}>{children}</View>;
}

export function EtiquetteSection({ texte }: { texte: string }) {
  return (
    <Txt taille={11} poids={700} couleur={C.texteAttenu} espacement={1.2} style={{ marginBottom: 10 }}>
      {texte.toUpperCase()}
    </Txt>
  );
}

/* ───────────────────────── indicateurs ───────────────────────── */

export function Compteur({ valeur, libelle, flex }: { valeur: string; libelle: string; flex?: boolean }) {
  return (
    <View style={[styles.compteur, flex && { flex: 1 }]}>
      <Txt taille={22} poids={800} couleur={C.encre}>
        {valeur}
      </Txt>
      <Txt taille={9} poids={600} couleur={C.texteAttenu} align="center">
        {libelle.toUpperCase()}
      </Txt>
    </View>
  );
}

export function BarreProgression({ pct, couleur = C.encre, hauteur = 8 }: { pct: number; couleur?: string; hauteur?: number }) {
  const v = Math.max(0, Math.min(100, pct));
  return (
    <View style={[styles.barreFond, { height: hauteur }]}>
      <View style={[styles.barreRemplie, { width: `${v}%`, backgroundColor: couleur }]} />
    </View>
  );
}

export function AnneauScore({ pct, taille = 92 }: { pct: number; taille?: number }) {
  const trait = 8;
  const r = (taille - trait) / 2;
  const circ = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, pct));
  return (
    <View style={{ width: taille, height: taille, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={taille} height={taille} style={StyleSheet.absoluteFill}>
        <Circle cx={taille / 2} cy={taille / 2} r={r} stroke={C.contour} strokeWidth={trait} fill="none" />
        <Circle
          cx={taille / 2}
          cy={taille / 2}
          r={r}
          stroke={C.encre}
          strokeWidth={trait}
          fill="none"
          strokeDasharray={`${(circ * v) / 100} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${taille / 2} ${taille / 2})`}
        />
      </Svg>
      <Txt taille={20} poids={800} couleur={C.encre}>
        {v}%
      </Txt>
      <Txt taille={8} poids={600} couleur={C.texteAttenu}>
        SCORE
      </Txt>
    </View>
  );
}

/* ───────────────────────── état vide ───────────────────────── */

export function EtatVide({
  icone,
  titre,
  texte,
  action,
}: {
  icone?: keyof typeof Ionicons.glyphMap;
  titre: string;
  texte?: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.vide}>
      {icone ? <Ionicons name={icone} size={30} color={C.texteAttenu} /> : null}
      <Txt taille={15} poids={700} couleur={C.texte} align="center" style={{ marginTop: 10 }}>
        {titre}
      </Txt>
      {texte ? (
        <Txt taille={12} poids={400} couleur={C.texteSecond} align="center" style={{ marginTop: 6, maxWidth: 300 }}>
          {texte}
        </Txt>
      ) : null}
      {action ? <View style={{ marginTop: 16, alignSelf: 'stretch' }}>{action}</View> : null}
    </View>
  );
}

/* ───────────────────────── FAB « + » — Réviser seulement ───────────────────────── */

export function Fab({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.fab, pressed && { opacity: 0.9 }]}
    >
      <Ionicons name="add" size={28} color={C.blanc} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: RAYON.puce,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  puce: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: RAYON.puce,
    borderWidth: 1,
    borderColor: C.contour,
    backgroundColor: C.surface,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  point: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  carte: {
    backgroundColor: C.surface,
    borderRadius: RAYON.carte,
    borderWidth: 1,
    borderColor: C.contour,
    padding: 16,
  },
  compteur: {
    alignItems: 'center',
    gap: 2,
    paddingVertical: 8,
  },
  barreFond: {
    backgroundColor: C.elevation,
    borderRadius: RAYON.puce,
    overflow: 'hidden',
  },
  barreRemplie: {
    height: '100%',
    borderRadius: RAYON.puce,
  },
  vide: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: C.contourFort,
    borderRadius: RAYON.carte,
    backgroundColor: 'rgba(241, 243, 249, 0.5)',
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignSelf: 'stretch',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.encre,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: C.encre,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
});
