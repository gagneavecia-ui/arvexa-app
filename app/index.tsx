/** Écran 2 — Accueil : directe, sans surcharge. Reprendre · trois chiffres · deux actions. */
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '@/theme/tokens';
import { Txt } from '@/components/txt';
import { BoutonPrincipal, BoutonSecondaire } from '@/components/boutons';
import { CoqueEcran } from '@/components/coque';
import { Carte, Compteur, EtatVide } from '@/components/affichage';
import { initiales } from '@/lib/format';
import { useStore } from '@/lib/store';
import { chiffresAccueil, coursAReprendre } from '@/lib/aggregates';

function Avatar({ nom, email, onPress }: { nom: string; email: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.avatar, pressed && { opacity: 0.85 }]}>
      <Txt taille={13} poids={800} couleur={C.blanc}>
        {initiales(nom, email)}
      </Txt>
    </Pressable>
  );
}

export default function Accueil() {
  const router = useRouter();
  const { donnees, actions } = useStore();

  useEffect(() => {
    if (donnees.pret && !donnees.session) {
      router.replace('/bienvenue' as never);
    }
  }, [donnees.pret, donnees.session, router]);

  if (!donnees.session) return null;

  const prenom = (donnees.session.nom || 'toi').split(' ')[0];
  const prenomFormatte = prenom.charAt(0).toUpperCase() + prenom.slice(1);
  const chiffres = chiffresAccueil(donnees.cours, donnees.tentatives, donnees.evenements);
  const reprise = coursAReprendre(donnees.cours);

  const ouvrirReprise = () => {
    if (!reprise) return;
    actions.noterConsultation(reprise.id, reprise.lastStepSeen, 0);
    router.push(`/cours/${reprise.id}` as never);
  };

  return (
    <CoqueEcran
      actifMenu="/"
      titre={`Bonjour, ${prenomFormatte}`}
      sousTitre="Prêt à avancer ?"
      droite={
        <Avatar
          nom={donnees.session.nom}
          email={donnees.session.email}
          onPress={() => router.push('/profil' as never)}
        />
      }
    >
      {chiffres.nbCours === 0 ? (
        <View style={styles.videWrap}>
          <EtatVide
            icone="book-outline"
            titre="Ajoute ton premier cours"
            texte="Ton cours, son titre — ARVX détecte la matière, résume, explique pas à pas et fabrique les examens."
            action={
              <BoutonPrincipal label="Ajouter mon premier cours" onPress={() => router.push('/cours/nouveau' as never)} />
            }
          />
        </View>
      ) : (
        <View style={{ gap: 16 }}>
          {reprise ? (
            <Carte style={{ backgroundColor: C.encreTeinte, borderColor: C.encreTeinteForte }}>
              <Txt taille={11} poids={700} couleur={C.encre} espacement={1.2}>
                REPRENDRE
              </Txt>
              <Txt taille={14} poids={700} couleur={C.texte} style={{ marginTop: 6 }} nbLignes={1}>
                {reprise.titre}
              </Txt>
              <Txt taille={10} poids={600} couleur={C.texteSecond} style={{ marginTop: 3 }}>
                Étape {Math.min(reprise.lastStepSeen + 1, Math.max(reprise.etapes.length, 1))} /{' '}
                {Math.max(reprise.etapes.length, 1)}
              </Txt>
              <BoutonSecondaire
                label="Continuer"
                onPress={ouvrirReprise}
                style={{ marginTop: 12, alignSelf: 'flex-start' }}
              />
            </Carte>
          ) : null}

          <View style={styles.chiffres}>
            <Carte style={{ flex: 1, alignItems: 'center' }}>
              <Compteur valeur={String(chiffres.nbCours)} libelle="Cours ajoutés" />
            </Carte>
            <Carte style={{ flex: 1, alignItems: 'center' }}>
              <Compteur valeur={String(chiffres.revisions7j)} libelle="Révisions · 7 j" />
            </Carte>
            <Carte style={{ flex: 1, alignItems: 'center' }}>
              <Compteur
                valeur={chiffres.moyenne === null ? '—' : `${chiffres.moyenne}%`}
                libelle="Moyenne examens"
              />
            </Carte>
          </View>

          <BoutonPrincipal label="+ Ajouter un cours" onPress={() => router.push('/cours/nouveau' as never)} />
          <BoutonSecondaire
            label="Nouvel examen"
            icone="document-text-outline"
            onPress={() => router.push('/examens' as never)}
          />
        </View>
      )}
    </CoqueEcran>
  );
}

const styles = StyleSheet.create({
  videWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 40,
  },
  chiffres: {
    flexDirection: 'row',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.encre,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
});
