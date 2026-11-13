/** Écran 1 — Bienvenue : hors navigation. Logo, deux champs, un bouton plein. */
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { C, RAYON } from '@/theme/tokens';
import { Txt } from '@/components/txt';
import { Champ } from '@/components/formes';
import { BoutonPrincipal } from '@/components/boutons';
import { useStore } from '@/lib/store';

export default function Bienvenue() {
  const router = useRouter();
  const { actions } = useStore();
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [erreurs, setErreurs] = useState<{ nom?: string; email?: string }>({});
  const [envoi, setEnvoi] = useState(false);

  const commencer = () => {
    const e: { nom?: string; email?: string } = {};
    if (nom.trim().length < 2) e.nom = 'Ton nom est obligatoire.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Adresse e-mail invalide.';
    setErreurs(e);
    if (Object.keys(e).length > 0) return;
    setEnvoi(true);
    actions.ouvrirSession({
      nom: nom.trim(),
      email: email.trim(),
      createdAt: new Date().toISOString(),
    });
    setTimeout(() => router.replace('/' as never), 60);
  };

  return (
    <SafeAreaView style={styles.ecran}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.corps}>
          <View style={styles.logo}>
            <Txt taille={34} poids={800} couleur={C.blanc}>
              A
            </Txt>
          </View>
          <Txt taille={24} poids={800} couleur={C.texte} align="center" style={{ marginTop: 18 }}>
            ARVX
          </Txt>
          <Txt taille={13} poids={400} couleur={C.texteSecond} align="center" style={{ marginTop: 6 }}>
            Ton cours entre, ARVX s'occupe du reste.
          </Txt>

          <View style={{ marginTop: 34, gap: 14 }}>
            <Champ
              valeur={nom}
              onChange={(v) => setNom(v)}
              placeholder="Ton nom"
              erreur={erreurs.nom}
              autoCapitalize="words"
            />
            <Champ
              valeur={email}
              onChange={(v) => setEmail(v)}
              placeholder="Ton adresse e-mail"
              erreur={erreurs.email}
              clavier="email-address"
              autoCapitalize="none"
            />
            <BoutonPrincipal label="Commencer" onPress={commencer} enCours={envoi} style={{ marginTop: 6 }} />
          </View>

          <Txt taille={10} poids={600} couleur={C.texteAttenu} align="center" style={{ marginTop: 18 }}>
            Ton profil reste sur cet appareil — la synchronisation arrive avec la version cloud.
          </Txt>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ecran: {
    flex: 1,
    backgroundColor: C.fond,
  },
  corps: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: C.encre,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
