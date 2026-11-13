/** Écran 7 — Liste des cours d'une matière : la carte n'existe que si au moins un cours l'a révélée. */
import React, { useMemo, useState } from 'react';
import { Alert, Modal, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { C } from '@/theme/tokens';
import { MatiereId } from '@/theme/tokens';
import { Txt } from '@/components/txt';
import { BoutonPrincipal, BoutonSecondaire, BoutonIcone } from '@/components/boutons';
import { Champ } from '@/components/formes';
import { CoqueEcran } from '@/components/coque';
import { Badge, Carte, EtatVide } from '@/components/affichage';
import { useStore } from '@/lib/store';
import { matiereNom } from '@/lib/matieres';
import { dateAjout } from '@/lib/format';

export default function PageMatiere() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const matiere = (params.id ?? 'autre') as MatiereId;
  const { donnees, actions } = useStore();
  const [coursARenommer, setCoursARenommer] = useState<string | null>(null);
  const [nouveauTitre, setNouveauTitre] = useState('');

  const liste = useMemo(
    () => donnees.cours.filter((c) => c.matiere === matiere).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [donnees.cours, matiere]
  );

  const supprimer = (id: string, titre: string) => {
    Alert.alert('Supprimer le cours ?', `« ${titre} » quittera Réviser. Les examens passés gardent leurs scores.`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => actions.supprimerCours(id) },
    ]);
  };

  const actionsLongues = (id: string, titre: string) => {
    Alert.alert(titre, undefined, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Renommer',
        onPress: () => {
          setCoursARenommer(id);
          setNouveauTitre(titre);
        },
      },
      { text: 'Supprimer', style: 'destructive', onPress: () => supprimer(id, titre) },
    ]);
  };

  const validerRenommage = () => {
    if (coursARenommer && nouveauTitre.trim().length >= 2) {
      actions.majCours(coursARenommer, { titre: nouveauTitre.trim() });
    }
    setCoursARenommer(null);
  };

  return (
    <View style={{ flex: 1 }}>
      <CoqueEcran
        titre={matiereNom(matiere)}
        sousTitre={liste.length > 0 ? `${liste.length} cours · le plus récent en tête` : undefined}
        surRetour={() => router.back()}
        droite={
          <BoutonIcone
            icone="add"
            onPress={() => router.push({ pathname: '/cours/nouveau', params: { matiere } } as never)}
          />
        }
      >
        {liste.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', paddingTop: 40 }}>
            <EtatVide
              titre="Aucun cours dans cette matière"
              texte="Ajoute un cours — la détection reste la règle : c'est le contenu qui décidera."
              action={
                <BoutonPrincipal
                  label="Ajouter un cours"
                  onPress={() => router.push({ pathname: '/cours/nouveau', params: { matiere } } as never)}
                />
              }
            />
          </View>
        ) : (
          <View style={{ gap: 10, marginTop: 8 }}>
            {liste.map((c) => (
              <Carte
                key={c.id}
                onPress={() => router.push(`/cours/${c.id}` as never)}
                onLongPress={() => actionsLongues(c.id, c.titre)}
                style={{ paddingVertical: 14 }}
              >
                <View style={styles.ligne}>
                  <View style={{ flex: 1 }}>
                    <Txt taille={14} poids={700} couleur={C.texte}>
                      {c.titre}
                    </Txt>
                    <Txt taille={9} poids={600} couleur={C.texteAttenu} style={{ marginTop: 3 }}>
                      {dateAjout(c.createdAt)}
                    </Txt>
                  </View>
                  <Badge type="ok" />
                </View>
              </Carte>
            ))}
          </View>
        )}
      </CoqueEcran>

      <Modal visible={coursARenommer !== null} transparent animationType="fade">
        <View style={styles.voileModale}>
          <View style={styles.modale}>
            <Txt taille={15} poids={700} couleur={C.texte}>
              Renommer le cours
            </Txt>
            <Champ valeur={nouveauTitre} onChange={setNouveauTitre} placeholder="Nouveau titre" style={{ marginTop: 12 }} />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <BoutonPrincipal label="Valider" onPress={validerRenommage} style={{ flex: 1 }} />
              <BoutonSecondaire label="Annuler" onPress={() => setCoursARenommer(null)} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  ligne: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  voileModale: {
    flex: 1,
    backgroundColor: 'rgba(23, 34, 59, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modale: {
    width: '100%',
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 18,
  },
});
