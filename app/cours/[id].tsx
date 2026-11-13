/** Écran 8 — Détail d'un cours : résumé, pas à pas dépliable, lien vers Examens. */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { C } from '@/theme/tokens';
import { Txt } from '@/components/txt';
import { BoutonPrincipal, BoutonSecondaire, BoutonDestructif, BoutonIcone } from '@/components/boutons';
import { Champ } from '@/components/formes';
import { CoqueEcran } from '@/components/coque';
import { Badge, Carte, EtiquetteSection, PuceMatiere } from '@/components/affichage';
import { useStore } from '@/lib/store';

const ETATS: { id: 'todo' | 'doing' | 'done'; libelle: string }[] = [
  { id: 'todo', libelle: 'À faire' },
  { id: 'doing', libelle: 'En cours' },
  { id: 'done', libelle: 'Compris' },
];

export default function DetailCours() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id ?? '';
  const { donnees, actions } = useStore();
  const [ouvertes, setOuvertes] = useState<number[]>([]);
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [renommerOuvert, setRenommerOuvert] = useState(false);
  const [nouveauTitre, setNouveauTitre] = useState('');

  const cours = useMemo(() => donnees.cours.find((c) => c.id === id), [donnees.cours, id]);

  /* reprise : dernière étape non comprise + temps réel passé */
  const premiereNonFaites = cours ? Math.max(0, cours.etapes.findIndex((e) => e.etat !== 'done')) : 0;
  useEffect(() => {
    if (!cours) return;
    actions.noterConsultation(cours.id, premiereNonFaites, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cours?.id]);

  const depart = useRef<number>(Date.now());
  const secondesAccumulees = useRef<number>(0);
  useEffect(() => {
    depart.current = Date.now();
    const t = setInterval(() => {
      const delta = Math.floor((Date.now() - depart.current) / 1000);
      if (delta >= 5) {
        secondesAccumulees.current += delta;
        depart.current = Date.now();
        if (cours) actions.noterConsultation(cours.id, premiereNonFaites, delta);
      }
    }, 5000);
    return () => {
      clearInterval(t);
      const delta = Math.floor((Date.now() - depart.current) / 1000);
      if (delta > 0 && cours) actions.noterConsultation(cours.id, premiereNonFaites, delta);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cours?.id, premiereNonFaites]);

  if (!cours) {
    return (
      <CoqueEcran surRetour={() => router.back()} titre="Cours introuvable">
        <View style={{ paddingTop: 60, alignItems: 'center' }}>
          <Txt taille={13} couleur={C.texteSecond}>
            Ce cours a été supprimé.
          </Txt>
        </View>
      </CoqueEcran>
    );
  }

  const faitees = cours.etapes.filter((e) => e.etat === 'done').length;

  const marquer = (index: number, etat: 'todo' | 'doing' | 'done') => {
    actions.marquerEtape(cours.id, index, etat);
    if (etat === 'done') {
      setOuvertes((o) => o.filter((x) => x !== index));
    }
  };

  const supprimer = () => {
    Alert.alert('Supprimer le cours ?', `« ${cours.titre} » quittera Réviser. Les examens passés gardent leurs scores.`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          actions.supprimerCours(cours.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <CoqueEcran
        surRetour={() => router.back()}
        droite={<BoutonIcone icone="ellipsis-horizontal" onPress={() => setMenuOuvert(true)} />}
        defiler
        pieds={
          <BoutonPrincipal
            label="Lancer un examen sur ce cours"
            onPress={() => router.push({ pathname: '/examens', params: { cours: cours.id } } as never)}
          />
        }
      >
        <View style={{ gap: 14, paddingTop: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <PuceMatiere matiere={cours.matiere} />
            <Badge type="ok" />
          </View>

          <Txt taille={16} poids={700} couleur={C.texte}>
            {cours.titre}
          </Txt>

          <Carte>
            <EtiquetteSection texte="Résumé" />
            <Txt taille={12} poids={400} couleur={C.texteSecond} style={{ lineHeight: 19 }}>
              {cours.resume}
            </Txt>
          </Carte>

          <View>
            <EtiquetteSection
              texte={`Explication pas à pas — ${faitees}/${cours.etapes.length} comprises`}
            />
            <View style={{ gap: 8 }}>
              {cours.etapes.map((etape, i) => {
                const ouverte = ouvertes.includes(i);
                const fait = etape.etat === 'done';
                return (
                  <Carte key={etape.id} style={{ padding: 14 }}>
                    <Pressable
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
                      onPress={() =>
                        setOuvertes((o) => (o.includes(i) ? o.filter((x) => x !== i) : [...o, i]))
                      }
                    >
                      <View
                        style={[
                          styles.numero,
                          fait && styles.numeroFait,
                          etape.etat === 'doing' && styles.numeroEnCours,
                        ]}
                      >
                        <Txt taille={12} poids={800} couleur={fait ? C.blanc : C.encre}>
                          {i + 1}
                        </Txt>
                      </View>
                      <Txt
                        taille={12}
                        poids={ouverte ? 700 : 500}
                        couleur={fait ? C.texteAttenu : C.texte}
                        style={{ flex: 1 }}
                        nbLignes={ouverte ? undefined : 2}
                      >
                        {etape.texte}
                      </Txt>
                    </Pressable>
                    {ouverte ? (
                      <View style={{ marginTop: 12, flexDirection: 'row', gap: 8 }}>
                        {ETATS.map((s) => {
                          const on = etape.etat === s.id;
                          return (
                            <Pressable
                              key={s.id}
                              onPress={() => marquer(i, s.id)}
                              style={[styles.etatPuce, on && styles.etatPuceActif]}
                            >
                              <Txt taille={10} poids={on ? 700 : 500} couleur={on ? C.encre : C.texteSecond}>
                                {s.libelle}
                              </Txt>
                            </Pressable>
                          );
                        })}
                      </View>
                    ) : null}
                  </Carte>
                );
              })}
            </View>
            {faitees === cours.etapes.length && cours.etapes.length > 0 ? (
              <Txt taille={11} poids={700} couleur={C.succes} style={{ marginTop: 10 }}>
                Pas à pas terminé — Progression compte cette matière comme révisée.
              </Txt>
            ) : null}
          </View>
        </View>
      </CoqueEcran>

      {/* menu « … » : renommer, supprimer */}
      <Modal visible={menuOuvert} transparent animationType="fade" onRequestClose={() => setMenuOuvert(false)}>
        <View style={styles.voile} onTouchStart={() => setMenuOuvert(false)}>
          <View style={styles.modale}>
            <Txt taille={15} poids={700} couleur={C.texte}>
              Actions du cours
            </Txt>
            <BoutonSecondaire
              label="Renommer"
              onPress={() => {
                setMenuOuvert(false);
                setNouveauTitre(cours.titre);
                setRenommerOuvert(true);
              }}
              style={{ marginTop: 12 }}
            />
            <BoutonSecondaire label="Annuler" onPress={() => setMenuOuvert(false)} style={{ marginTop: 8 }} />
            <BoutonDestructif
              label="Supprimer le cours"
              onPress={() => {
                setMenuOuvert(false);
                supprimer();
              }}
              style={{ marginTop: 8 }}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={renommerOuvert} transparent animationType="fade" onRequestClose={() => setRenommerOuvert(false)}>
        <View style={styles.voile}>
          <View style={styles.modale}>
            <Txt taille={15} poids={700} couleur={C.texte}>
              Renommer le cours
            </Txt>
            <Champ valeur={nouveauTitre} onChange={setNouveauTitre} placeholder="Nouveau titre" style={{ marginTop: 12 }} />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <BoutonPrincipal
                label="Valider"
                onPress={() => {
                  if (nouveauTitre.trim().length >= 2) {
                    actions.majCours(cours.id, { titre: nouveauTitre.trim() });
                  }
                  setRenommerOuvert(false);
                }}
                style={{ flex: 1 }}
              />
              <BoutonSecondaire label="Annuler" onPress={() => setRenommerOuvert(false)} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  numero: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.elevation,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numeroFait: {
    backgroundColor: C.succes,
  },
  numeroEnCours: {
    backgroundColor: C.encreTeinteForte,
  },
  etatPuce: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.contour,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: C.surface,
  },
  etatPuceActif: {
    borderColor: C.encre,
    backgroundColor: C.encreTeinte,
  },
  voile: {
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
