/** Écran 13 — Profil et réglages : identité, langue, thème, Premium (réservé), déconnexion. */
import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { C } from '@/theme/tokens';
import { Txt } from '@/components/txt';
import { BoutonDestructif } from '@/components/boutons';
import { CoqueEcran } from '@/components/coque';
import { Badge, Carte, EtiquetteSection } from '@/components/affichage';
import { initiales } from '@/lib/format';
import { useStore } from '@/lib/store';

function LigneReglage({
  icone,
  libelle,
  valeur,
  actif,
  disabled,
  badge,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  libelle: string;
  valeur?: string;
  actif?: boolean;
  disabled?: boolean;
  badge?: string;
}) {
  return (
    <View style={styles.ligne}>
      <Ionicons name={icone} size={18} color={disabled ? C.texteAttenu : C.encre} />
      <Txt taille={13} poids={600} couleur={disabled ? C.texteAttenu : C.texte} style={{ flex: 1 }}>
        {libelle}
      </Txt>
      {badge ? <Badge type={disabled ? 'avenir' : 'ok'} libelle={badge} /> : null}
      {valeur ? (
        <Txt taille={11} poids={600} couleur={actif ? C.encre : C.texteSecond}>
          {valeur}
        </Txt>
      ) : null}
    </View>
  );
}

export default function Profil() {
  const router = useRouter();
  const { donnees, actions } = useStore();
  const session = donnees.session;
  const version = Constants.default?.expoConfig?.version ?? '1.0.0';

  if (!session) return null;

  const deconnexion = () => {
    Alert.alert('Se déconnecter ?', 'Tes cours et ta progression resteront sur cet appareil.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Se déconnecter',
        style: 'destructive',
        onPress: () => {
          actions.fermerSession();
          router.replace('/bienvenue' as never);
        },
      },
    ]);
  };

  return (
    <CoqueEcran actifMenu="/profil" titre="Profil" sousTitre="Identité, réglages, compte">
      <View style={{ gap: 16, marginTop: 8 }}>
        {/* identité */}
        <Carte style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={styles.avatar}>
            <Txt taille={16} poids={800} couleur={C.blanc}>
              {initiales(session.nom, session.email)}
            </Txt>
          </View>
          <View style={{ flex: 1 }}>
            <Txt taille={15} poids={700} couleur={C.texte} nbLignes={1}>
              {session.nom}
            </Txt>
            <Txt taille={11} poids={400} couleur={C.texteSecond} nbLignes={1}>
              {session.email}
            </Txt>
          </View>
          <Badge type="acontinuer" libelle="Gratuit" />
        </Carte>

        {/* réglages */}
        <Carte>
          <EtiquetteSection texte="Réglages" />
          <LigneReglage icone="language-outline" libelle="Langue" valeur="Français" actif badge="fr" />
          <View style={styles.separateur} />
          <LigneReglage icone="language-outline" libelle="Aninka" disabled badge="à venir" />
          <View style={styles.separateur} />
          <LigneReglage icone="sunny-outline" libelle="Thème" valeur="Clair" actif badge="encre claire" />
          <View style={styles.separateur} />
          <LigneReglage icone="moon-outline" libelle="Thème sombre" disabled badge="à venir" />
        </Carte>

        {/* compte */}
        <Carte>
          <EtiquetteSection texte="Compte" />
          <LigneReglage icone="diamond-outline" libelle="Premium" disabled badge="à venir" />
        </Carte>

        <BoutonDestructif label="Déconnexion" onPress={deconnexion} />

        <Txt taille={9} poids={600} couleur={C.texteAttenu} align="center">
          ARVX {version} (1) · tes cours restent sur ton appareil
        </Txt>
      </View>
    </CoqueEcran>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.encre,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ligne: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  separateur: {
    height: 1,
    backgroundColor: C.contour,
  },
});
