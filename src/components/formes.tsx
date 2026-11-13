/** Champs et contrôles ARVX — vide · rempli · erreur. Le titre du cours est obligatoire. */
import React, { useState } from 'react';
import { Pressable, StyleSheet, StyleProp, TextInput, View, ViewStyle, TextStyle } from 'react-native';
import { C, RAYON } from '@/theme/tokens';
import { Txt, police } from '@/components/txt';

interface ChampProps {
  valeur: string;
  onChange: (v: string) => void;
  placeholder?: string;
  erreur?: string | null;
  clavier?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences' | 'words';
  style?: StyleProp<ViewStyle>;
}

export function Champ({ valeur, onChange, placeholder, erreur, clavier, autoCapitalize, style }: ChampProps) {
  const [focus, setFocus] = useState(false);
  const bordure = erreur ? C.erreur : focus ? C.contourFort : 'transparent';
  return (
    <View style={style}>
      <TextInput
        value={valeur}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={C.texteAttenu}
        keyboardType={clavier}
        autoCapitalize={autoCapitalize}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={[styles.champ, { borderColor: bordure }, erreur && { borderWidth: 1.5 }]}
      />
      {erreur ? (
        <Txt taille={10} poids={600} couleur={C.erreur} style={{ marginTop: 6 }}>
          {erreur}
        </Txt>
      ) : null}
    </View>
  );
}

interface ChampMultiligneProps {
  valeur: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minHeight?: number;
  style?: StyleProp<TextStyle>;
}

export function ChampMultiligne({ valeur, onChange, placeholder, minHeight = 180, style }: ChampMultiligneProps) {
  const [focus, setFocus] = useState(false);
  return (
    <TextInput
      value={valeur}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={C.texteAttenu}
      multiline
      textAlignVertical="top"
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={[styles.multiligne, { minHeight, borderColor: focus ? C.contourFort : 'transparent' }, style]}
    />
  );
}

export interface OptionSegment {
  valeur: string;
  label: string;
  disabled?: boolean;
  note?: string;
}

interface SegmenteProps {
  options: OptionSegment[];
  actif: string;
  onChange: (v: string) => void;
  style?: StyleProp<ViewStyle>;
}

export function ControleSegmenté({ options, actif, onChange, style }: SegmenteProps) {
  return (
    <View style={[styles.segmentWrap, style]}>
      {options.map((o) => {
        const on = o.valeur === actif;
        const inutilisable = o.disabled && !on;
        return (
          <Pressable
            key={o.valeur}
            onPress={() => !o.disabled && onChange(o.valeur)}
            disabled={o.disabled}
            style={[styles.segment, on && styles.segmentActif]}
          >
            <Txt
              taille={12}
              poids={600}
              couleur={on ? C.blanc : inutilisable ? C.texteAttenu : C.texteSecond}
            >
              {o.label}
            </Txt>
            {o.note ? (
              <Txt taille={8} poids={600} couleur={on ? 'rgba(255,255,255,0.7)' : C.texteAttenu}>
                {o.note}
              </Txt>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  champ: {
    height: 48,
    borderRadius: RAYON.champ,
    backgroundColor: C.elevation,
    paddingHorizontal: 14,
    fontSize: 13,
    color: C.texte,
    fontFamily: police(400),
  },
  multiligne: {
    borderRadius: RAYON.champ,
    backgroundColor: C.elevation,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 13,
    lineHeight: 20,
    color: C.texte,
    fontFamily: police(400),
    borderWidth: 1,
  },
  segmentWrap: {
    flexDirection: 'row',
    backgroundColor: C.elevation,
    borderRadius: RAYON.champ,
    padding: 3,
  },
  segment: {
    flex: 1,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  segmentActif: {
    backgroundColor: C.encre,
  },
});
