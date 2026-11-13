/** Écrans 10 & 11 — Examen en cours (immersif) puis résultats : la boucle se referme. */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C, RAYON } from '@/theme/tokens';
import { Txt } from '@/components/txt';
import { BoutonPrincipal, BoutonSecondaire, BoutonIcone } from '@/components/boutons';
import { Badge, AnneauScore, BarreProgression, Carte, PuceMatiere } from '@/components/affichage';
import { useStore } from '@/lib/store';
import { chrono } from '@/lib/format';
import { matiereCouleur } from '@/lib/matieres';

export default function PassageExamen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id ?? '';
  const { donnees, actions } = useStore();

  const tentative = useMemo(() => donnees.tentatives.find((t) => t.id === id), [donnees.tentatives, id]);

  const [idx, setIdx] = useState(0);
  const [reponses, setReponses] = useState<(number | null)[]>([]);
  const [revelations, setRevelations] = useState<boolean[]>([]);
  const [chronoSec, setChronoSec] = useState(0);
  const [montrerCorrections, setMontrerCorrections] = useState(false);
  const chronoRef = useRef(0);
  const depassementRef = useRef(false);

  /* reprise d'une tentative en cours */
  useEffect(() => {
    if (tentative && tentative.statut === 'en_cours') {
      setReponses(tentative.reponses);
      setRevelations(tentative.revelations);
      const premiere = tentative.revelations.findIndex((r) => !r);
      setIdx(premiere === -1 ? tentative.questions.length - 1 : premiere);
    }
  }, [tentative?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  /* chronomètre — indicatif : le dépassement ne coupe jamais l'examen */
  useEffect(() => {
    if (!tentative || tentative.statut !== 'en_cours') return;
    const t = setInterval(() => {
      chronoRef.current += 1;
      setChronoSec(chronoRef.current);
      if (tentative.limiteMin !== null && !depassementRef.current && chronoRef.current > tentative.limiteMin * 60) {
        depassementRef.current = true;
        actions.majTentative(tentative.id, { depassement: true });
      }
    }, 1000);
    return () => clearInterval(t);
  }, [tentative?.id, tentative?.statut]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!tentative) {
    return (
      <SafeAreaView style={styles.ecran}>
        <View style={{ paddingTop: 80, alignItems: 'center', gap: 12 }}>
          <Txt taille={15} poids={700} couleur={C.texte}>
            Tentative introuvable
          </Txt>
          <BoutonSecondaire label="Retour aux examens" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  if (tentative.statut === 'termine') {
    return <VueResultats tentativeId={tentative.id} />;
  }

  const question = tentative.questions[idx];
  const total = tentative.questions.length;
  const restant = tentative.limiteMin === null ? null : tentative.limiteMin * 60 - chronoSec;
  const choisis = reponses[idx] ?? null;
  const revele = revelations[idx] ?? false;

  const choisir = (choix: number) => {
    if (revele) return;
    setReponses((r) => {
      const n = [...r];
      n[idx] = n[idx] === choix ? null : choix;
      return n;
    });
  };

  const valider = () => {
    if (choisis === null) return;
    const nr = [...revelations];
    nr[idx] = true;
    setRevelations(nr);
    actions.majTentative(tentative.id, { reponses, revelations: nr });
  };

  const suivant = () => {
    if (idx + 1 >= total) {
      actions.terminerTentative(tentative.id, reponses, chronoRef.current, depassementRef.current);
      return;
    }
    setIdx(idx + 1);
  };

  const quitter = () => {
    Alert.alert(
      'Quitter l’examen ?',
      'Tes réponses déjà validées sont conservées et compteront. Tu pourras reprendre plus tard.',
      [
        { text: 'Continuer l’examen', style: 'cancel' },
        { text: 'Quitter', style: 'destructive', onPress: () => router.back() },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.ecran}>
      {/* barre supérieure — pas de menu, une croix */}
      <View style={styles.barreHaut}>
        <BoutonIcone icone="close" onPress={quitter} />
        <Txt taille={12} poids={700} couleur={C.texteSecond}>
          Question {idx + 1} / {total}
        </Txt>
        <Txt taille={12} poids={800} couleur={restant !== null && restant < 0 ? C.erreur : C.encre}>
          {tentative.limiteMin === null
            ? chrono(chronoSec)
            : restant !== null && restant >= 0
              ? chrono(restant)
              : `+${chrono(-(restant ?? 0))}`}
        </Txt>
      </View>
      <View style={{ paddingHorizontal: 20, marginTop: 6 }}>
        <BarreProgression pct={(revelations.filter(Boolean).length / total) * 100} hauteur={6} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
        {/* la question se souvient d'où elle vient */}
        <View style={styles.origine}>
          <View style={[styles.point, { backgroundColor: matiereCouleur(question.matiere) }]} />
          <Txt taille={10} poids={700} couleur={C.texteSecond} style={{ flex: 1 }} nbLignes={1}>
            {question.courseTitre}
          </Txt>
        </View>
        <Txt taille={15} poids={700} couleur={C.texte} style={{ marginTop: 10, lineHeight: 22 }}>
          {question.prompt}
        </Txt>

        <View style={{ gap: 10, marginTop: 18 }}>
          {question.choix.map((c, i) => {
            const choisi = choisis === i;
            const correcte = i === question.reponse;
            let fond: string = C.surface;
            let bordure: string = C.contour;
            let couleurTexte: string = C.texte;
            if (revele) {
              if (correcte) {
                fond = C.succesTeinte;
                bordure = C.succes;
                couleurTexte = C.texte;
              } else if (choisi) {
                fond = C.erreurTeinte;
                bordure = C.erreur;
                couleurTexte = C.erreur;
              }
            } else if (choisi) {
              fond = C.encreTeinte;
              bordure = C.encre;
              couleurTexte = C.encre;
            }
            return (
              <Pressable
                key={`${question.id}-${i}`}
                onPress={() => choisir(i)}
                style={[styles.option, { backgroundColor: fond, borderColor: bordure }]}
              >
                <Txt taille={13} poids={choisi || (revele && correcte) ? 700 : 400} couleur={couleurTexte}>
                  {c}
                </Txt>
                {revele && correcte ? <Ionicons name="checkmark" size={18} color={C.succes} /> : null}
                {revele && choisi && !correcte ? <Ionicons name="close" size={18} color={C.erreur} /> : null}
              </Pressable>
            );
          })}
        </View>

        {revele ? (
          <Carte style={{ marginTop: 14, backgroundColor: C.encreTeinte, borderColor: C.encreTeinteForte }}>
            <Txt taille={11} poids={700} couleur={C.encre} espacement={1.2}>
              POURQUOI
            </Txt>
            <Txt taille={12} poids={400} couleur={C.texteSecond} style={{ marginTop: 6, lineHeight: 19 }}>
              {question.explication}
            </Txt>
          </Carte>
        ) : null}
      </ScrollView>

      <View style={styles.pieds}>
        {idx > 0 ? (
          <BoutonSecondaire label="Précédent" onPress={() => setIdx(idx - 1)} style={{ width: 110 }} />
        ) : null}
        {!revele ? (
          <BoutonPrincipal label="Valider" onPress={valider} disabled={choisis === null} style={{ flex: 1 }} />
        ) : (
          <BoutonPrincipal label={idx + 1 >= total ? 'Terminer' : 'Suivant'} onPress={suivant} style={{ flex: 1 }} />
        )}
      </View>
    </SafeAreaView>
  );
}

/* ───────────────────────── écran 11 — résultats ───────────────────────── */

function VueResultats({ tentativeId }: { tentativeId: string }) {
  const router = useRouter();
  const { donnees } = useStore();
  const tentative = donnees.tentatives.find((t) => t.id === tentativeId);
  const [montrerCorrections, setMontrerCorrections] = useState(false);

  if (!tentative) return null;

  const total = tentative.questions.length;
  const parCours = (() => {
    const map = new Map<string, { titre: string; erreurs: number; posees: number }>();
    for (let i = 0; i < tentative.questions.length; i++) {
      const q = tentative.questions[i];
      const cur = map.get(q.courseId) ?? { titre: q.courseTitre, erreurs: 0, posees: 0 };
      cur.posees += 1;
      if (tentative.reponses[i] !== q.reponse) cur.erreurs += 1;
      map.set(q.courseId, cur);
    }
    return [...map.values()].sort((a, b) => b.erreurs - a.erreurs);
  })();

  const coursARevoir = parCours.find((p) => p.erreurs > 0);
  const coursIdARevoir = coursARevoir
    ? tentative.questions.find((q) => q.courseTitre === coursARevoir.titre)?.courseId
    : undefined;

  return (
    <SafeAreaView style={styles.ecran}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} showsVerticalScrollIndicator={false}>
        <View style={styles.enteteResultats}>
          <AnneauScore pct={tentative.scorePct ?? 0} />
          <View style={{ alignItems: 'center', gap: 6 }}>
            <Txt taille={14} poids={700} couleur={C.texte}>
              {tentative.bonnes}/{total} points
            </Txt>
            <Txt taille={11} poids={600} couleur={C.texteAttenu}>
              Temps passé : {chrono(tentative.dureeSec)}
            </Txt>
            {tentative.depassement ? <Badge type="erreur" libelle="Temps dépassé — signalé" /> : null}
          </View>
        </View>

        <Carte>
          <Txt taille={11} poids={700} couleur={C.texteAttenu} espacement={1.2}>
            PAR COURS
          </Txt>
          <View style={{ gap: 10, marginTop: 10 }}>
            {parCours.map((p) => (
              <View key={p.titre} style={{ gap: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Txt taille={12} poids={600} couleur={C.texte} style={{ flex: 1 }} nbLignes={1}>
                    {p.titre}
                  </Txt>
                  <Txt
                    taille={11}
                    poids={700}
                    couleur={p.erreurs > 0 ? C.erreur : C.succes}
                  >
                    {p.erreurs > 0 ? `${p.erreurs} faute${p.erreurs > 1 ? 's' : ''}` : 'sans faute'}
                  </Txt>
                </View>
                <BarreProgression pct={((p.posees - p.erreurs) / Math.max(p.posees, 1)) * 100} hauteur={6} />
              </View>
            ))}
          </View>
        </Carte>

        {coursIdARevoir ? (
          <BoutonPrincipal
            label="Revoir le cours"
            onPress={() => router.push(`/cours/${coursIdARevoir}` as never)}
          />
        ) : (
          <Carte style={{ backgroundColor: C.succesTeinte, borderColor: C.succesTeinte }}>
            <Txt taille={12} poids={700} couleur={C.succes}>
              Tout est correct — bravo.
            </Txt>
          </Carte>
        )}

        <BoutonSecondaire
          label={montrerCorrections ? 'Masquer les corrections' : 'Corrections — question par question'}
          icone="list-outline"
          onPress={() => setMontrerCorrections(!montrerCorrections)}
        />

        {montrerCorrections ? (
          <View style={{ gap: 10 }}>
            {tentative.questions.map((q, i) => {
              const donne = tentative.reponses[i];
              const juste = donne === q.reponse;
              return (
                <Carte key={q.id}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={[styles.point, { backgroundColor: matiereCouleur(q.matiere) }]} />
                    <Txt taille={10} poids={700} couleur={C.texteAttenu}>
                      QUESTION {i + 1} — {q.courseTitre.toUpperCase()}
                    </Txt>
                  </View>
                  <Txt taille={12} poids={600} couleur={C.texte} style={{ marginTop: 8, lineHeight: 18 }}>
                    {q.prompt}
                  </Txt>
                  <Txt taille={12} poids={600} couleur={juste ? C.succes : C.erreur} style={{ marginTop: 8 }}>
                    {donne === null ? 'Non répondue' : `Ta réponse : ${q.choix[donne]}`}
                  </Txt>
                  {!juste ? (
                    <Txt taille={12} poids={700} couleur={C.succes} style={{ marginTop: 4 }}>
                      Bonne réponse : {q.choix[q.reponse]}
                    </Txt>
                  ) : null}
                  <Txt taille={11} poids={400} couleur={C.texteAttenu} style={{ marginTop: 8, lineHeight: 17 }}>
                    {q.explication}
                  </Txt>
                </Carte>
              );
            })}
          </View>
        ) : null}

        <BoutonPrincipal label="Nouvel examen" onPress={() => router.replace('/examens' as never)} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ecran: {
    flex: 1,
    backgroundColor: C.fond,
  },
  barreHaut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    height: 52,
  },
  origine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.contour,
    borderRadius: RAYON.puce,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  point: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  option: {
    borderRadius: RAYON.bouton,
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  pieds: {
    flexDirection: 'row',
    gap: 10,
    padding: 20,
    paddingBottom: 16,
    backgroundColor: 'rgba(246, 247, 251, 0.96)',
    borderTopWidth: 1,
    borderTopColor: C.contour,
  },
  enteteResultats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
});
