/** Écrans 4 & 5 — Réviser : état vide (contrat en une phrase) puis grille des matières dynamiques. */
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '@/theme/tokens';
import { Txt } from '@/components/txt';
import { BoutonPrincipal, BoutonIcone } from '@/components/boutons';
import { Champ } from '@/components/formes';
import { CoqueEcran } from '@/components/coque';
import { Carte, EtatVide, Fab } from '@/components/affichage';
import { useStore } from '@/lib/store';
import { etatsMatieres } from '@/lib/aggregates';
import { matiereCouleur, matiereNom } from '@/lib/matieres';
import { dateCourte } from '@/lib/format';

export default function Reviser() {
  const router = useRouter();
  const { donnees } = useStore();
  const [recherche, setRecherche] = useState<string | null>(null);

  const etats = useMemo(() => etatsMatieres(donnees.cours, donnees.tentatives), [donnees.cours, donnees.tentatives]);
  const filtres = useMemo(() => {
    if (!recherche || recherche.trim().length === 0) return etats;
    const q = recherche.trim().toLowerCase();
    return etats.filter((e) => matiereNom(e.matiere).toLowerCase().includes(q));
  }, [etats, recherche]);

  return (
    <View style={{ flex: 1 }}>
      <CoqueEcran
        actifMenu="/reviser"
        titre="Réviser"
        sousTitre={
          donnees.cours.length > 0 ? `${donnees.cours.length} cours · ${etats.length} matière${etats.length > 1 ? 's' : ''}` : undefined
        }
        droite={
          donnees.cours.length > 0 ? (
            <BoutonIcone icone={recherche === null ? 'search' : 'close'} onPress={() => setRecherche(recherche === null ? '' : null)} />
          ) : undefined
        }
      >
        {donnees.cours.length === 0 ? (
          <View style={styles.videWrap}>
            <EtatVide
              icone="sparkles-outline"
              titre="Ton cours entre ici"
              texte="Ajoute ton cours avec son titre — ARVX détecte la matière, rédige le résumé, construit l'explication pas à pas et fabrique les examens."
              action={
                <BoutonPrincipal
                  label="Ajouter mon premier cours"
                  onPress={() => router.push('/cours/nouveau' as never)}
                />
              }
            />
          </View>
        ) : (
          <View>
            {recherche !== null ? (
              <Champ
                valeur={recherche}
                onChange={setRecherche}
                placeholder="Chercher une matière…"
                style={{ marginBottom: 14 }}
              />
            ) : null}
            <View style={styles.grille}>
              {filtres.map((e) => (
                <Carte
                  key={e.matiere}
                  style={{ flex: 1, minWidth: '47%' }}
                  onPress={() => router.push(`/matiere/${e.matiere}` as never)}
                >
                  <View style={[styles.point, { backgroundColor: matiereCouleur(e.matiere) }]} />
                  <Txt taille={14} poids={700} couleur={C.texte} style={{ marginTop: 10 }}>
                    {matiereNom(e.matiere)}
                  </Txt>
                  <Txt taille={10} poids={600} couleur={C.texteAttenu} style={{ marginTop: 3 }}>
                    {e.nbCours} cours
                  </Txt>
                  {e.dernierAjoutIso ? (
                    <Txt taille={9} poids={600} couleur={C.texteAttenu}>
                      dernière le {dateCourte(e.dernierAjoutIso)}
                    </Txt>
                  ) : null}
                </Carte>
              ))}
            </View>
            {filtres.length === 0 ? (
              <Txt taille={12} poids={400} couleur={C.texteAttenu} align="center" style={{ marginTop: 24 }}>
                Aucune matière ne correspond.
              </Txt>
            ) : null}
          </View>
        )}
      </CoqueEcran>
      {donnees.cours.length > 0 ? <Fab onPress={() => router.push('/cours/nouveau' as never)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  videWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 40,
  },
  grille: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  point: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
