/** Coque d'écran + menu latéral — la seule navigation de premier niveau. */
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C, RAYON } from '@/theme/tokens';
import { Txt } from '@/components/txt';
import { BoutonIcone } from '@/components/boutons';
import { initiales } from '@/lib/format';
import { useStore } from '@/lib/store';
import { NomIcone } from '@/lib/matieres';

interface EntreeMenu {
  route: string;
  libelle: string;
  icone: NomIcone;
}

const ENTREES: EntreeMenu[] = [
  { route: '/', libelle: 'Accueil', icone: 'home-outline' },
  { route: '/reviser', libelle: 'Réviser', icone: 'book-outline' },
  { route: '/examens', libelle: 'Examens', icone: 'document-text-outline' },
  { route: '/progression', libelle: 'Progression', icone: 'trending-up-outline' },
  { route: '/profil', libelle: 'Profil', icone: 'person-outline' },
];

const PLUS_TARD: { libelle: string; icone: NomIcone }[] = [
  { libelle: 'Statistiques avancées', icone: 'stats-chart-outline' },
  { libelle: 'Espace classe', icone: 'people-outline' },
];

export function MenuLateral({
  visible,
  onClose,
  actif,
}: {
  visible: boolean;
  onClose: () => void;
  actif: string;
}) {
  const router = useRouter();
  const { donnees, actions } = useStore();
  const { width } = useWindowDimensions();
  const [anim] = useState(new Animated.Value(0));
  const [monte, setMonte] = useState(visible);
  const largeur = Math.min(width - 88, 312);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    if (visible) setMonte(true);
    else {
      const t = setTimeout(() => setMonte(false), 260);
      return () => clearTimeout(t);
    }
  }, [visible, anim]);

  if (!monte) return null;

  const voile = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const glisse = anim.interpolate({ inputRange: [0, 1], outputRange: [-largeur, 0] });

  const naviguer = (route: string) => {
    onClose();
    if (route !== actif) {
      setTimeout(() => router.push(route as never), 180);
    }
  };

  const deconnexion = () => {
    Alert.alert('Se déconnecter ?', 'Tes cours et ta progression resteront sur cet appareil.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Se déconnecter',
        style: 'destructive',
        onPress: () => {
          actions.fermerSession();
          onClose();
          router.replace('/bienvenue' as never);
        },
      },
    ]);
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View
        style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(23, 34, 59, 0.45)', opacity: voile }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View style={[styles.panneau, { width: largeur, transform: [{ translateX: glisse }] }]}>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          {/* Identité */}
          <Pressable style={styles.identite} onPress={() => naviguer('/profil')}>
            <View style={styles.avatar}>
              <Txt taille={15} poids={800} couleur={C.blanc}>
                {initiales(donnees.session?.nom ?? '', donnees.session?.email ?? '')}
              </Txt>
            </View>
            <View style={{ flex: 1 }}>
              <Txt taille={14} poids={700} couleur={C.texte} nbLignes={1}>
                {donnees.session?.nom || 'Mon profil'}
              </Txt>
              <Txt taille={10} poids={400} couleur={C.texteAttenu} nbLignes={1}>
                {donnees.session?.email || ''}
              </Txt>
            </View>
          </Pressable>

          {/* Navigation principale */}
          <View style={{ marginTop: 8 }}>
            {ENTREES.map((e) => {
              const on = e.route === actif;
              return (
                <Pressable
                  key={e.route}
                  onPress={() => naviguer(e.route)}
                  style={({ pressed }) => [styles.entree, (on || pressed) && styles.entreeActive]}
                >
                  <Ionicons name={e.icone} size={20} color={on ? C.encre : C.texteSecond} />
                  <Txt taille={14} poids={on ? 700 : 500} couleur={on ? C.encre : C.texteSecond}>
                    {e.libelle}
                  </Txt>
                </Pressable>
              );
            })}
          </View>

          {/* Emplacements « Plus tard » */}
          <View style={styles.plusTard}>
            {PLUS_TARD.map((p) => (
              <View key={p.libelle} style={[styles.entree, styles.entreeBloquee]}>
                <Ionicons name={p.icone} size={20} color={C.texteAttenu} />
                <Txt taille={13} poids={500} couleur={C.texteAttenu} style={{ flex: 1 }}>
                  {p.libelle}
                </Txt>
                <View style={styles.pucePlusTard}>
                  <Txt taille={8} poids={700} couleur={C.texteAttenu}>
                    PLUS TARD
                  </Txt>
                </View>
              </View>
            ))}
          </View>

          <View style={{ flex: 1 }} />

          {/* Compte */}
          <Pressable style={styles.entree} onPress={deconnexion}>
            <Ionicons name="log-out-outline" size={20} color={C.erreur} />
            <Txt taille={14} poids={700} couleur={C.erreur}>
              Déconnexion
            </Txt>
          </Pressable>
          <Txt taille={9} poids={600} couleur={C.texteAttenu} style={{ marginLeft: 16, marginBottom: 12 }}>
            ARVX 1.0.0 (1)
          </Txt>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

/** Coque standard des pages : barre supérieure, titre, contenu défilant, bouton fixé en bas. */
export function CoqueEcran({
  titre,
  actifMenu,
  surRetour,
  droite,
  sousTitre,
  defiler = true,
  pieds,
  children,
}: {
  titre?: string;
  actifMenu?: string;
  surRetour?: () => void;
  droite?: React.ReactNode;
  sousTitre?: string;
  defiler?: boolean;
  pieds?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const corps = defiler ? (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: pieds ? 110 : 32 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={{ flex: 1, paddingHorizontal: 20 }}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.ecran} edges={['top']}>
      <View style={styles.barre}>
        {surRetour ? (
          <BoutonIcone icone="chevron-back" onPress={surRetour} />
        ) : actifMenu ? (
          <BoutonIcone icone="menu" onPress={() => setMenuOuvert(true)} />
        ) : (
          <View style={{ width: 36 }} />
        )}
        <View style={{ flex: 1, alignItems: 'flex-end' }}>{droite}</View>
      </View>
      {titre ? (
        <View style={{ paddingHorizontal: 20, marginBottom: 4 }}>
          <Txt taille={19} poids={800} couleur={C.texte}>
            {titre}
          </Txt>
          {sousTitre ? (
            <Txt taille={11} poids={600} couleur={C.texteAttenu} style={{ marginTop: 3 }}>
              {sousTitre}
            </Txt>
          ) : null}
        </View>
      ) : null}
      {corps}
      {pieds ? (
        <View style={[styles.pieds, { paddingBottom: 16 }]}>{pieds}</View>
      ) : null}
      {actifMenu ? (
        <MenuLateral visible={menuOuvert} onClose={() => setMenuOuvert(false)} actif={actifMenu} />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ecran: {
    flex: 1,
    backgroundColor: C.fond,
  } as ViewStyle,
  barre: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    height: 52,
  } as ViewStyle,
  pieds: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: 'rgba(246, 247, 251, 0.96)',
    borderTopWidth: 1,
    borderTopColor: C.contour,
  } as ViewStyle,
  panneau: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: C.surface,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 8,
    shadowColor: '#17223B',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 4, height: 0 },
    overflow: 'hidden',
  } as ViewStyle,
  identite: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: C.contour,
  } as ViewStyle,
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: C.encre,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  entree: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 1,
  } as ViewStyle,
  entreeActive: {
    backgroundColor: C.elevation,
  } as ViewStyle,
  entreeBloquee: {
    opacity: 0.65,
  } as ViewStyle,
  plusTard: {
    marginTop: 14,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: C.contour,
  } as ViewStyle,
  pucePlusTard: {
    borderRadius: RAYON.puce,
    backgroundColor: C.elevation,
    paddingHorizontal: 6,
    paddingVertical: 2,
  } as ViewStyle,
});
