/** Boutons ARVX — 4 rôles : principal, secondaire, destructif, désactivé. Un seul verbe par bouton. */
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, StyleProp, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, RAYON } from '@/theme/tokens';
import { Txt, police } from '@/components/txt';

interface BoutonPrincipalProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  enCours?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function BoutonPrincipal({ label, onPress, disabled, enCours, style }: BoutonPrincipalProps) {
  const inactif = disabled || enCours;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactif}
      style={({ pressed }) => [
        styles.principal,
        inactif && styles.principalInactif,
        pressed && !inactif && styles.appuye,
        style,
      ]}
    >
      {enCours ? (
        <ActivityIndicator size="small" color={C.blanc} />
      ) : null}
      <Txt taille={14} poids={700} couleur={inactif ? C.texteAttenu : C.blanc}>
        {label}
      </Txt>
    </Pressable>
  );
}

interface BoutonSecondaireProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icone?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}

export function BoutonSecondaire({ label, onPress, disabled, icone, style }: BoutonSecondaireProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.secondaire,
        disabled && styles.inactif,
        pressed && !disabled && styles.appuye,
        style,
      ]}
    >
      {icone ? <Ionicons name={icone} size={16} color={disabled ? C.texteAttenu : C.encre} /> : null}
      <Txt taille={13} poids={700} couleur={disabled ? C.texteAttenu : C.encre}>
        {label}
      </Txt>
    </Pressable>
  );
}

interface BoutonDestructifProps {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
}

export function BoutonDestructif({ label, onPress, style }: BoutonDestructifProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.destructif, pressed && styles.appuye, style]}>
      <Txt taille={13} poids={700} couleur={C.erreur}>
        {label}
      </Txt>
    </Pressable>
  );
}

interface BoutonIconeProps {
  icone: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  couleur?: string;
  style?: ViewStyle;
}

export function BoutonIcone({ icone, onPress, couleur = C.encre, style }: BoutonIconeProps) {
  return (
    <Pressable onPress={onPress} hitSlop={12} style={({ pressed }) => [styles.icones, pressed && styles.appuyeIcone, style]}>
      <Ionicons name={icone} size={22} color={couleur} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  principal: {
    height: 48,
    borderRadius: RAYON.bouton,
    backgroundColor: C.encre,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  } as ViewStyle,
  principalInactif: {
    backgroundColor: C.elevation,
  } as ViewStyle,
  secondaire: {
    height: 44,
    borderRadius: RAYON.bouton,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.contourFort,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  } as ViewStyle,
  destructif: {
    height: 44,
    borderRadius: RAYON.bouton,
    backgroundColor: C.erreurTeinte,
    borderWidth: 1,
    borderColor: 'rgba(228, 87, 76, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  } as ViewStyle,
  inactif: {
    backgroundColor: C.elevation,
    borderColor: C.contour,
  } as ViewStyle,
  appuye: {
    opacity: 0.85,
  } as ViewStyle,
  icones: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  appuyeIcone: {
    backgroundColor: C.elevation,
  } as ViewStyle,
});
