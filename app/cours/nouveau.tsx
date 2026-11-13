/** Écran 6 — Ajout d'un cours : titre, source, analyse, confirmation de la matière. */
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { C, MATIERES, MatiereId } from '@/theme/tokens';
import { Txt } from '@/components/txt';
import { BoutonPrincipal } from '@/components/boutons';
import { Champ, ChampMultiligne, ControleSegmenté } from '@/components/formes';
import { CoqueEcran } from '@/components/coque';
import { Carte, EtiquetteSection, PuceMatiere } from '@/components/affichage';
import { uuid } from '@/lib/format';
import { useStore } from '@/lib/store';
import { analyserCours, AnalyseResultat, fabriquerQuestions, libelleConfiance } from '@/lib/analyseur';
import { MATIERES_ORDREES, matiereNom } from '@/lib/matieres';

const ETAPES_ANALYSE = [
  'Extraction du texte',
  'Détection de la matière',
  'Rédaction du résumé',
  'Construction du pas à pas',
  'Fabrication des questions',
];

const attente = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export default function NouveauCours() {
  const router = useRouter();
  const params = useLocalSearchParams<{ matiere?: string }>();
  const matiereSuggeree = (params.matiere as MatiereId | undefined) ?? null;
  const { actions } = useStore();

  const [titre, setTitre] = useState('');
  const [contenu, setContenu] = useState('');
  const [phase, setPhase] = useState<'formulaire' | 'analyse' | 'resultat'>('formulaire');
  const [etapeCourante, setEtapeCourante] = useState(0);
  const [analyse, setAnalyse] = useState<AnalyseResultat | null>(null);
  const [matiereChoisie, setMatiereChoisie] = useState<MatiereId | null>(null);
  const [erreurs, setErreurs] = useState<{ titre?: string; contenu?: string }>({});
  const annule = useRef(false);

  useEffect(() => {
    return () => {
      annule.current = true;
    };
  }, []);

  const lancerAnalyse = async () => {
    const e: { titre?: string; contenu?: string } = {};
    if (titre.trim().length < 2) e.titre = 'Le titre du cours est obligatoire.';
    if (contenu.trim().length < 80) e.contenu = 'Le contenu est trop court — colle au moins quelques phrases du cours.';
    setErreurs(e);
    if (Object.keys(e).length > 0) return;

    setPhase('analyse');
    setEtapeCourante(0);
    await attente(550);
    if (annule.current) return;
    const resultat = analyserCours(contenu);
    for (let i = 1; i < ETAPES_ANALYSE.length; i++) {
      await attente(560);
      if (annule.current) return;
      setEtapeCourante(i);
    }
    setAnalyse(resultat);
    setMatiereChoisie(resultat.detection.matiere);
    setPhase('resultat');
  };

  const enregistrer = () => {
    if (!analyse || !matiereChoisie) return;
    const id = uuid();
    const questions = fabriquerQuestions(id, titre.trim(), matiereChoisie, contenu);
    actions.ajouterCours({
      id,
      titre: titre.trim(),
      matiere: matiereChoisie,
      source: 'texte',
      contenu: contenu.trim(),
      resume: analyse.resume,
      etapes: analyse.etapes.map((texte) => ({ id: uuid(), texte, etat: 'todo' as const })),
      questions,
      analyzedAt: new Date().toISOString(),
    });
    router.replace(`/cours/${id}` as never);
  };

  return (
    <CoqueEcran
      surRetour={() => router.back()}
      titre="Ajouter un cours"
      sousTitre="Le titre ne sera jamais deviné — c'est toi qui le donnes."
    >
      {phase === 'formulaire' ? (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ gap: 16 }}>
          {matiereSuggeree ? (
            <Carte style={{ backgroundColor: C.encreTeinte, borderColor: C.encreTeinteForte }}>
              <Txt taille={11} poids={600} couleur={C.encre}>
                Matière suggérée : {matiereNom(matiereSuggeree)} — la détection du contenu reste la règle.
              </Txt>
            </Carte>
          ) : null}

          <View>
            <EtiquetteSection texte="Titre du cours" />
            <Champ
              valeur={titre}
              onChange={setTitre}
              placeholder="Titre du cours…"
              erreur={erreurs.titre}
              autoCapitalize="sentences"
            />
          </View>

          <View>
            <EtiquetteSection texte="Source" />
            <ControleSegmenté
              actif="texte"
              onChange={() => undefined}
              options={[
                { valeur: 'texte', label: 'Texte' },
                { valeur: 'photo', label: 'Photo', disabled: true, note: 'à venir' },
                { valeur: 'pdf', label: 'PDF', disabled: true, note: 'à venir' },
              ]}
            />
            <Txt taille={10} poids={600} couleur={C.texteAttenu} style={{ marginTop: 8 }}>
              Le texte extrait par le moyen adapté — pour l'instant, colle ou saisis le texte du cours.
            </Txt>
          </View>

          <View>
            <EtiquetteSection texte="Contenu" />
            <ChampMultiligne
              valeur={contenu}
              onChange={setContenu}
              placeholder="Colle ou saisis ici le texte de ton cours…"
              minHeight={220}
              style={erreurs.contenu ? { borderColor: C.erreur, borderWidth: 1.5 } : undefined}
            />
            {erreurs.contenu ? (
              <Txt taille={10} poids={600} couleur={C.erreur} style={{ marginTop: 6 }}>
                {erreurs.contenu}
              </Txt>
            ) : null}
          </View>

          <BoutonPrincipal label="Analyser mon cours" onPress={() => void lancerAnalyse()} />
        </KeyboardAvoidingView>
      ) : phase === 'analyse' ? (
        <View style={{ paddingTop: 30, gap: 14 }}>
          {ETAPES_ANALYSE.map((libelle, i) => (
            <View key={libelle} style={styles.etapeAnalyse}>
              <Txt taille={22} poids={800} couleur={i <= etapeCourante ? C.encre : C.contourFort}>
                {i < etapeCourante ? '✓' : String(i + 1)}
              </Txt>
              <Txt
                taille={13}
                poids={i <= etapeCourante ? 700 : 400}
                couleur={i <= etapeCourante ? C.texte : C.texteAttenu}
              >
                {libelle}
                {i === etapeCourante ? '…' : ''}
              </Txt>
            </View>
          ))}
          <Txt taille={10} poids={600} couleur={C.texteAttenu} style={{ marginTop: 10 }}>
            Tout se joue sur ton appareil — aucun cours ne quitte ton téléphone.
          </Txt>
        </View>
      ) : analyse && matiereChoisie ? (
        <View style={{ gap: 16 }}>
          <Carte>
            <EtiquetteSection texte="Matière détectée" />
            <Txt taille={15} poids={700} couleur={C.texte}>
              {matiereNom(analyse.detection.matiere)}{' '}
              <Txt taille={11} poids={600} couleur={C.texteAttenu}>
                ({libelleConfiance(analyse.detection.confiance)}) — corrigeable avant enregistrement
              </Txt>
            </Txt>
            <View style={styles.chips}>
              {MATIERES_ORDREES.map((m) => {
                const on = m === matiereChoisie;
                return (
                  <Pressable
                    key={m}
                    onPress={() => setMatiereChoisie(m)}
                    style={[styles.chip, on && styles.chipActif]}
                  >
                    <View style={[styles.pointChip, { backgroundColor: MATIERES[m].couleur }]} />
                    <Txt taille={10} poids={on ? 700 : 500} couleur={on ? C.encre : C.texteSecond}>
                      {matiereNom(m)}
                    </Txt>
                  </Pressable>
                );
              })}
            </View>
          </Carte>

          <Carte>
            <EtiquetteSection texte="Résumé généré" />
            <Txt taille={12} poids={400} couleur={C.texteSecond}>
              {analyse.resume}
            </Txt>
          </Carte>

          <Carte>
            <EtiquetteSection texte="Produit de l'analyse" />
            <Txt taille={12} poids={400} couleur={C.texte}>
              {analyse.etapes.length} étapes d'explication pas à pas · banque de questions prête pour Examens.
            </Txt>
          </Carte>

          <BoutonPrincipal label="Enregistrer le cours" onPress={enregistrer} />
        </View>
      ) : null}
    </CoqueEcran>
  );
}

const styles = StyleSheet.create({
  etapeAnalyse: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.contour,
    backgroundColor: C.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipActif: {
    borderColor: C.encre,
    backgroundColor: C.encreTeinte,
  },
  pointChip: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
