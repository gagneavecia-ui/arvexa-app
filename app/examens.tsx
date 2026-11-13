/** Écran 9 — Examens : hub connecté aux cours. Ciblé ou global, questions issues des banques de Réviser. */
import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { C } from '@/theme/tokens';
import { Txt } from '@/components/txt';
import { BoutonPrincipal } from '@/components/boutons';
import { ControleSegmenté } from '@/components/formes';
import { CoqueEcran } from '@/components/coque';
import { Badge, Carte, EtatVide, EtiquetteSection, PuceMatiere } from '@/components/affichage';
import { useStore } from '@/lib/store';
import { dateAjout, melange } from '@/lib/format';
import { Tentative } from '@/lib/types';
import { matiereCouleur } from '@/lib/matieres';

export default function Examens() {
  const router = useRouter();
  const params = useLocalSearchParams<{ cours?: string }>();
  const { donnees, actions } = useStore();

  const [modeOuvert, setModeOuvert] = useState<'aucune' | 'cible' | 'global'>('aucune');
  const [selection, setSelection] = useState<string[]>(params.cours ? [params.cours] : []);
  const [nbQuestions, setNbQuestions] = useState(10);
  const [limite, setLimite] = useState<number | null>(null);
  const [ordre, setOrdre] = useState<'melange' | 'cours'>('melange');

  const coursDisponibles = donnees.cours;
  const selectionnees = useMemo(
    () => coursDisponibles.filter((c) => selection.includes(c.id)),
    [coursDisponibles, selection]
  );
  const banqueTotale = useMemo(
    () => selectionnees.reduce((s, c) => s + c.questions.length, 0),
    [selectionnees]
  );

  const basculer = (id: string) => {
    setSelection((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const demarrer = () => {
    if (selectionnees.length === 0) {
      Alert.alert("Aucun cours sélectionné", "Choisis au moins un cours — ARVX n'évalue que ce que tu as fourni.");
      return;
    }
    if (banqueTotale === 0) {
      Alert.alert(
        'Banque de questions vide',
        "Les cours sélectionnés n'ont pas encore de questions. Retourne dans Réviser et analyse un cours."
      );
      return;
    }
    const pool = selectionnees.flatMap((c) => c.questions);
    const questions = ordre === 'melange' ? melange(pool) : pool;
    const retenues = questions.slice(0, nbQuestions);
    const tentative = actions.creerTentative({
      titre: modeOuvert === 'global' ? 'Examen global' : `Examen ciblé · ${selectionnees.length} cours`,
      mode: modeOuvert === 'global' ? 'global' : 'cible',
      courseIds: selectionnees.map((c) => c.id),
      questionsDemandees: nbQuestions,
      limiteMin: limite,
      questions: retenues,
    });
    router.push(`/examen/${tentative.id}` as never);
  };

  const ouvrirTentative = (t: Tentative) => {
    router.push(`/examen/${t.id}` as never);
  };

  if (coursDisponibles.length === 0) {
    return (
      <CoqueEcran actifMenu="/examens" titre="Examens" sousTitre="La page la plus intelligente — branchée sur tes cours">
        <View style={{ flex: 1, justifyContent: 'center', paddingTop: 40 }}>
          <EtatVide
            icone="document-text-outline"
            titre="Ajoute d'abord un cours dans Réviser"
            texte="Tes examens seront fabriqués à partir de lui — rien d'autre n'est jamais évalué."
            action={<BoutonPrincipal label="Ajouter un cours" onPress={() => router.push('/cours/nouveau' as never)} />}
          />
        </View>
      </CoqueEcran>
    );
  }

  return (
    <CoqueEcran actifMenu="/examens" titre="Examens" sousTitre="Les questions viennent uniquement de tes cours">
      <View style={{ gap: 14, marginTop: 8 }}>
        {/* Modes d'examen */}
        <Carte
          onPress={() => {
            setModeOuvert('cible');
            if (selection.length === 0 && params.cours) setSelection([params.cours]);
          }}
          style={[styles.mode, modeOuvert === 'cible' && styles.modeActif]}
        >
          <Txt taille={14} poids={700} couleur={C.texte}>
            Examen ciblé
          </Txt>
          <Txt taille={11} poids={400} couleur={C.texteSecond} style={{ marginTop: 4 }}>
            Un ou plusieurs cours choisis — la matière est rappelée à chaque question.
          </Txt>
        </Carte>
        <Carte
          onPress={() => {
            setModeOuvert('global');
            setSelection(coursDisponibles.map((c) => c.id));
          }}
          style={[styles.mode, modeOuvert === 'global' && styles.modeActif]}
        >
          <Txt taille={14} poids={700} couleur={C.texte}>
            Examen global
          </Txt>
          <Txt taille={11} poids={400} couleur={C.texteSecond} style={{ marginTop: 4 }}>
            Tous les cours disponibles présélectionnés.
          </Txt>
        </Carte>

        {/* Sélection des cours */}
        {modeOuvert === 'cible' ? (
          <View>
            <EtiquetteSection texte="Cours évalués" />
            <View style={{ gap: 8 }}>
              {coursDisponibles.map((c) => {
                const on = selection.includes(c.id);
                return (
                  <Carte
                    key={c.id}
                    onPress={() => basculer(c.id)}
                    style={[styles.ligneCours, on && { borderColor: C.encre, backgroundColor: C.encreTeinte }]}
                  >
                    <View style={[styles.point, { backgroundColor: matiereCouleur(c.matiere) }]} />
                    <View style={{ flex: 1 }}>
                      <Txt taille={13} poids={600} couleur={C.texte} nbLignes={1}>
                        {c.titre}
                      </Txt>
                      <Txt taille={9} poids={600} couleur={C.texteAttenu}>
                        {c.questions.length} questions dans la banque
                      </Txt>
                    </View>
                    <View style={[styles.case, on && styles.caseOn]}>
                      {on ? <Txt taille={12} poids={800} couleur={C.blanc}>✓</Txt> : null}
                    </View>
                  </Carte>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* Configuration */}
        {modeOuvert !== 'aucune' && selectionnees.length > 0 ? (
          <Carte>
            <EtiquetteSection texte="Configuration" />
            <Txt taille={10} poids={600} couleur={C.texteAttenu} style={{ marginBottom: 6 }}>
              NOMBRE DE QUESTIONS — {banqueTotale} DISPONIBLES
            </Txt>
            <ControleSegmenté
              actif={String(nbQuestions)}
              onChange={(v) => setNbQuestions(Number(v))}
              options={[
                { valeur: '5', label: '5' },
                { valeur: '10', label: '10' },
                { valeur: '20', label: '20' },
              ]}
            />
            <Txt taille={10} poids={600} couleur={C.texteAttenu} style={{ marginVertical: 6 }}>
              DURÉE
            </Txt>
            <ControleSegmenté
              actif={limite === null ? 'libre' : String(limite)}
              onChange={(v) => setLimite(v === 'libre' ? null : Number(v))}
              options={[
                { valeur: 'libre', label: 'Libre' },
                { valeur: '10', label: '10 min' },
                { valeur: '20', label: '20 min' },
              ]}
            />
            <Txt taille={10} poids={600} couleur={C.texteAttenu} style={{ marginVertical: 6 }}>
              ORDRE DES QUESTIONS
            </Txt>
            <ControleSegmenté
              actif={ordre}
              onChange={(v) => setOrdre(v as 'melange' | 'cours')}
              options={[
                { valeur: 'melange', label: 'Mélangé' },
                { valeur: 'cours', label: 'Cours par cours' },
              ]}
            />
            <Txt taille={10} poids={600} couleur={C.texteAttenu} style={{ marginTop: 10 }}>
              {Math.min(nbQuestions, banqueTotale)} questions seront posées sur {selectionnees.length} cours.
            </Txt>
            <BoutonPrincipal
              label="Démarrer l'examen"
              onPress={demarrer}
              style={{ marginTop: 12 }}
              disabled={banqueTotale === 0}
            />
          </Carte>
        ) : null}

        {/* Historique */}
        {donnees.tentatives.length > 0 ? (
          <View>
            <EtiquetteSection texte="Tentatives passées" />
            <View style={{ gap: 8 }}>
              {donnees.tentatives.slice(0, 12).map((t) => (
                <Carte key={t.id} onPress={() => ouvrirTentative(t)} style={styles.ligneCours}>
                  <View style={{ flex: 1 }}>
                    <Txt taille={13} poids={700} couleur={C.texte} nbLignes={1}>
                      {t.titre}
                    </Txt>
                    <Txt taille={9} poids={600} couleur={C.texteAttenu} style={{ marginTop: 3 }}>
                      {dateAjout(t.createdAt)} · {t.questions.length} questions
                    </Txt>
                  </View>
                  {t.statut === 'termine' && t.scorePct !== null ? (
                    <View style={styles.pastille}>
                      <Txt
                        taille={12}
                        poids={800}
                        couleur={t.scorePct >= 50 ? C.encre : C.erreur}
                      >
                        {t.scorePct}%
                      </Txt>
                    </View>
                  ) : (
                    <Badge type="acontinuer" />
                  )}
                </Carte>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </CoqueEcran>
  );
}

const styles = StyleSheet.create({
  mode: {
    paddingVertical: 14,
  },
  modeActif: {
    borderColor: C.encre,
    backgroundColor: C.encreTeinte,
  },
  ligneCours: {
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  point: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  case: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: C.contourFort,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caseOn: {
    backgroundColor: C.encre,
    borderColor: C.encre,
  },
  pastille: {
    minWidth: 44,
    height: 30,
    borderRadius: 15,
    backgroundColor: C.elevation,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
});
