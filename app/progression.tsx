/** Écran 12 — Progression : l'agrégateur qui connaît Réviser et Examens ; n'enregistre rien. */
import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '@/theme/tokens';
import { Txt } from '@/components/txt';
import { BoutonSecondaire } from '@/components/boutons';
import { CoqueEcran } from '@/components/coque';
import { BarreProgression, Carte, Compteur, EtatVide, EtiquetteSection } from '@/components/affichage';
import { useStore } from '@/lib/store';
import { bilanProgression } from '@/lib/aggregates';
import { matiereCouleur, matiereNom } from '@/lib/matieres';
import { dureeHumaine } from '@/lib/format';

export default function Progression() {
  const router = useRouter();
  const { donnees } = useStore();
  const bilan = useMemo(
    () => bilanProgression(donnees.cours, donnees.tentatives, donnees.evenements),
    [donnees.cours, donnees.tentatives, donnees.evenements]
  );

  if (donnees.cours.length === 0) {
    return (
      <CoqueEcran
        actifMenu="/progression"
        titre="Progression"
        sousTitre="Révisions et examens, en un coup d'œil"
      >
        <View style={{ flex: 1, justifyContent: 'center', paddingTop: 40 }}>
          <EtatVide
            icone="trending-up-outline"
            titre="Rien à mesurer — pour l'instant"
            texte="Ajoute un cours dans Réviser, révise-le, passe un examen : la progression apparaîtra d'elle-même."
          />
        </View>
      </CoqueEcran>
    );
  }

  return (
    <CoqueEcran
      actifMenu="/progression"
      titre="Progression"
      sousTitre="Lit Réviser et Examens — n'enregistre rien d'original"
    >
      <View style={{ gap: 16, marginTop: 8 }}>
        {/* compteurs */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Carte style={{ flex: 1, alignItems: 'center' }}>
            <Compteur valeur={`${bilan.serie} j`} libelle="Série active" />
          </Carte>
          <Carte style={{ flex: 1, alignItems: 'center' }}>
            <Compteur valeur={dureeHumaine(bilan.tempsRevisSec)} libelle="Temps révisé" />
          </Carte>
          <Carte style={{ flex: 1, alignItems: 'center' }}>
            <Compteur valeur={String(bilan.examensPasses)} libelle="Examens passés" />
          </Carte>
        </View>

        {/* par matière */}
        <View>
          <EtiquetteSection texte="Par matière" />
          <View style={{ gap: 10 }}>
            {bilan.etats.map((e) => (
              <Carte key={e.matiere}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[styles.point, { backgroundColor: matiereCouleur(e.matiere) }]} />
                  <Txt taille={13} poids={700} couleur={C.texte} style={{ flex: 1 }} nbLignes={1}>
                    {matiereNom(e.matiere)}
                  </Txt>
                  <Txt taille={11} poids={700} couleur={C.encre}>
                    {e.revisePct}%
                  </Txt>
                </View>
                <View style={{ marginTop: 10 }}>
                  <BarreProgression pct={e.revisePct} couleur={matiereCouleur(e.matiere)} />
                </View>
                <Txt taille={9} poids={600} couleur={C.texteAttenu} style={{ marginTop: 8 }}>
                  {e.etapesFaites}/{e.etapesTotal} étapes comprises ·{' '}
                  {e.moyenne === null ? 'examens : pas encore' : `moyenne examens : ${e.moyenne}%`}
                </Txt>
              </Carte>
            ))}
          </View>
        </View>

        {/* à renforcer — le même lien croisé que depuis les résultats */}
        <View>
          <EtiquetteSection texte="À renforcer" />
          {bilan.aRenforcer ? (
            <Carte style={{ backgroundColor: C.erreurTeinte, borderColor: 'rgba(228, 87, 76, 0.25)' }}>
              <Txt taille={11} poids={700} couleur={C.erreur} espacement={1.2}>
                LES ERREURS SE CONCENTRENT ICI
              </Txt>
              <Txt taille={14} poids={700} couleur={C.texte} style={{ marginTop: 6 }} nbLignes={1}>
                {bilan.aRenforcer.cours.titre}
              </Txt>
              <Txt taille={10} poids={600} couleur={C.texteSecond} style={{ marginTop: 3 }}>
                {bilan.aRenforcer.erreurs} erreur{bilan.aRenforcer.erreurs > 1 ? 's' : ''} accumulée
                {bilan.aRenforcer.erreurs > 1 ? 's' : ''} dans les examens
              </Txt>
              <BoutonSecondaire
                label="Réviser"
                icone="book-outline"
                onPress={() => router.push(`/cours/${bilan.aRenforcer!.cours.id}` as never)}
                style={{ marginTop: 12, alignSelf: 'flex-start' }}
              />
            </Carte>
          ) : (
            <Txt taille={11} poids={600} couleur={C.texteAttenu}>
              Passe un examen : les erreurs pointeront le cours à rouvrir.
            </Txt>
          )}
        </View>
      </View>
    </CoqueEcran>
  );
}

const styles = {
  point: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
};
