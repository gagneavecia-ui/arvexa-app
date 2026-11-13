/** Racine ARVX — pile de navigation, polices Inter, store, splash. */
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/inter';
import { C } from '@/theme/tokens';
import { StoreProvider, useStore } from '@/lib/store';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Pile() {
  const { donnees } = useStore();
  const [policesChargees, erreurPolices] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  const pret = donnees.pret && (policesChargees || !!erreurPolices);

  useEffect(() => {
    if (pret) SplashScreen.hideAsync().catch(() => {});
  }, [pret]);

  if (!pret) {
    return <View style={{ flex: 1, backgroundColor: C.fond }} />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: C.fond },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="bienvenue" />
      <Stack.Screen name="reviser" />
      <Stack.Screen name="matiere/[id]" />
      <Stack.Screen name="cours/nouveau" />
      <Stack.Screen name="cours/[id]" />
      <Stack.Screen name="examens" />
      <Stack.Screen name="examen/[id]" />
      <Stack.Screen name="progression" />
      <Stack.Screen name="profil" />
    </Stack>
  );
}

export default function Racine() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={C.fond} />
      <StoreProvider>
        <Pile />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
