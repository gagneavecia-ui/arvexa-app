/**
 * Store ARVX — local d'abord, persisté en AsyncStorage.
 * Une donnée n'est écrite que par sa page productrice ; les autres la lisent.
 *   Réviser écrit : cours, étapes, banque de questions, temps passé.
 *   Examens écrit : tentatives, scores, erreurs par cours.
 *   Profil écrit : session, préférences.
 *   Accueil et Progression ne calculent que des agrégats (voir aggregates.ts).
 */
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cours, Evenement, Etape, Prefs, Session, Tentative } from '@/lib/types';
import { MatiereId } from '@/theme/tokens';
import { uuid } from '@/lib/format';

const CLE = {
  session: 'arvx.v1.session',
  cours: 'arvx.v1.cours',
  tentatives: 'arvx.v1.tentatives',
  prefs: 'arvx.v1.prefs',
  evenements: 'arvx.v1.evenements',
} as const;

type EtatEtape = Etape['etat'];

interface Donnees {
  session: Session | null;
  cours: Cours[];
  tentatives: Tentative[];
  prefs: Prefs;
  evenements: Evenement[];
  pret: boolean;
}

const PREFS_DEFAUT: Prefs = { langue: 'fr', theme: 'clair', plan: 'gratuit' };

interface FormeTentative {
  titre: string;
  mode: 'cible' | 'global';
  courseIds: string[];
  questionsDemandees: number;
  limiteMin: number | null;
  questions: Tentative['questions'];
}

interface Actions {
  ouvrirSession: (s: Session) => void;
  fermerSession: () => void;
  majPrefs: (p: Partial<Prefs>) => void;
  ajouterCours: (c: Omit<Cours, 'id' | 'createdAt' | 'lastStepSeen' | 'tempsPasseSec'> & { id?: string }) => Cours;
  majCours: (id: string, maj: Partial<Cours>) => void;
  supprimerCours: (id: string) => void;
  marquerEtape: (courseId: string, index: number, etat: EtatEtape) => void;
  noterConsultation: (courseId: string, etapeIndex: number, secondesVues: number) => void;
  creerTentative: (t: FormeTentative) => Tentative;
  majTentative: (id: string, maj: Partial<Tentative>) => void;
  terminerTentative: (id: string, reponses: (number | null)[], dureeSec: number, depassement: boolean) => void;
  supprimerTentative: (id: string) => void;
  journaliser: (type: Evenement['type'], courseId?: string, matiere?: MatiereId) => void;
}

const Contexte = createContext<{ donnees: Donnees; actions: Actions } | null>(null);

async function lire<T>(cle: string, defaut: T): Promise<T> {
  try {
    const brut = await AsyncStorage.getItem(cle);
    if (!brut) return defaut;
    return JSON.parse(brut) as T;
  } catch {
    return defaut;
  }
}

async function ecrire(cle: string, valeur: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(cle, JSON.stringify(valeur));
  } catch {
    /* stockage indisponible : ignoré en v1 */
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [donnees, setDonnees] = useState<Donnees>({
    session: null,
    cours: [],
    tentatives: [],
    prefs: PREFS_DEFAUT,
    evenements: [],
    pret: false,
  });
  const tampon = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      const [session, cours, tentatives, prefs, evenements] = await Promise.all([
        lire<Session | null>(CLE.session, null),
        lire<Cours[]>(CLE.cours, []),
        lire<Tentative[]>(CLE.tentatives, []),
        lire<Prefs>(CLE.prefs, PREFS_DEFAUT),
        lire<Evenement[]>(CLE.evenements, []),
      ]);
      setDonnees({ session, cours, tentatives, prefs, evenements, pret: true });
    })();
  }, []);

  const maj = useMemo(() => {
    const extracteurs: Record<string, (d: Donnees) => unknown> = {
      session: (d) => d.session,
      cours: (d) => d.cours,
      tentatives: (d) => d.tentatives,
      prefs: (d) => d.prefs,
      evenements: (d) => d.evenements,
    };
    return (partials: Partial<Donnees>, cles: Array<keyof typeof CLE>) => {
      setDonnees((d) => {
        const suivant = { ...d, ...partials };
        if (tampon.current) clearTimeout(tampon.current);
        tampon.current = setTimeout(() => {
          for (const cle of cles) void ecrire(CLE[cle], extracteurs[cle](suivant));
        }, 300);
        return suivant;
      });
    };
  }, []);

  const actions: Actions = useMemo(
    () => ({
      ouvrirSession: (s) => maj({ session: s }, ['session']),

      fermerSession: () => maj({ session: null }, ['session']),

      majPrefs: (p) => {
        setDonnees((d) => {
          const suivant = { ...d, prefs: { ...d.prefs, ...p } };
          if (tampon.current) clearTimeout(tampon.current);
          tampon.current = setTimeout(() => void ecrire(CLE.prefs, suivant.prefs), 300);
          return suivant;
        });
      },

      ajouterCours: (c) => {
        const complet: Cours = {
          ...c,
          id: c.id ?? uuid(),
          createdAt: new Date().toISOString(),
          lastStepSeen: 0,
          tempsPasseSec: 0,
        };
        const evt: Evenement = {
          id: uuid(),
          type: 'cours',
          at: new Date().toISOString(),
          courseId: complet.id,
          matiere: complet.matiere,
        };
        setDonnees((d) => {
          const suivant = {
            ...d,
            cours: [complet, ...d.cours],
            evenements: [evt, ...d.evenements].slice(0, 600),
          };
          if (tampon.current) clearTimeout(tampon.current);
          tampon.current = setTimeout(() => {
            void ecrire(CLE.cours, suivant.cours);
            void ecrire(CLE.evenements, suivant.evenements);
          }, 300);
          return suivant;
        });
        return complet;
      },

      majCours: (id, m) => {
        setDonnees((d) => {
          const suivant = { ...d, cours: d.cours.map((c) => (c.id === id ? { ...c, ...m } : c)) };
          if (tampon.current) clearTimeout(tampon.current);
          tampon.current = setTimeout(() => void ecrire(CLE.cours, suivant.cours), 300);
          return suivant;
        });
      },

      supprimerCours: (id) => {
        setDonnees((d) => {
          const suivant = { ...d, cours: d.cours.filter((c) => c.id !== id) };
          if (tampon.current) clearTimeout(tampon.current);
          tampon.current = setTimeout(() => void ecrire(CLE.cours, suivant.cours), 300);
          return suivant;
        });
      },

      marquerEtape: (courseId, index, etat) => {
        setDonnees((d) => {
          const coursMaj = d.cours.map((c) =>
            c.id === courseId
              ? { ...c, etapes: c.etapes.map((e, i) => (i === index ? { ...e, etat } : e)) }
              : c
          );
          const cours = coursMaj.find((c) => c.id === courseId);
          const evt: Evenement | null =
            etat === 'done'
              ? { id: uuid(), type: 'reviser', at: new Date().toISOString(), courseId, matiere: cours?.matiere }
              : null;
          const suivant = {
            ...d,
            cours: coursMaj,
            evenements: evt ? [evt, ...d.evenements].slice(0, 600) : d.evenements,
          };
          if (tampon.current) clearTimeout(tampon.current);
          tampon.current = setTimeout(() => {
            void ecrire(CLE.cours, suivant.cours);
            void ecrire(CLE.evenements, suivant.evenements);
          }, 300);
          return suivant;
        });
      },

      noterConsultation: (courseId, etapeIndex, secondesVues) => {
        setDonnees((d) => {
          const suivant = {
            ...d,
            cours: d.cours.map((c) =>
              c.id === courseId
                ? { ...c, lastStepSeen: etapeIndex, tempsPasseSec: c.tempsPasseSec + Math.round(secondesVues) }
                : c
            ),
          };
          if (tampon.current) clearTimeout(tampon.current);
          tampon.current = setTimeout(() => void ecrire(CLE.cours, suivant.cours), 300);
          return suivant;
        });
      },

      creerTentative: (t) => {
        const tentative: Tentative = {
          id: uuid(),
          titre: t.titre,
          mode: t.mode,
          courseIds: t.courseIds,
          createdAt: new Date().toISOString(),
          completedAt: null,
          statut: 'en_cours',
          questionsDemandees: t.questionsDemandees,
          limiteMin: t.limiteMin,
          questions: t.questions,
          dureeSec: 0,
          depassement: false,
          reponses: t.questions.map(() => null),
          revelations: t.questions.map(() => false),
          scorePct: null,
          bonnes: null,
          erreursParCours: {},
        };
        setDonnees((d) => {
          const suivant = { ...d, tentatives: [tentative, ...d.tentatives] };
          if (tampon.current) clearTimeout(tampon.current);
          tampon.current = setTimeout(() => void ecrire(CLE.tentatives, suivant.tentatives), 300);
          return suivant;
        });
        return tentative;
      },

      majTentative: (id, m) => {
        setDonnees((d) => {
          const suivant = { ...d, tentatives: d.tentatives.map((t) => (t.id === id ? { ...t, ...m } : t)) };
          if (tampon.current) clearTimeout(tampon.current);
          tampon.current = setTimeout(() => void ecrire(CLE.tentatives, suivant.tentatives), 300);
          return suivant;
        });
      },

      terminerTentative: (id, reponses, dureeSec, depassement) => {
        setDonnees((d) => {
          const tentative = d.tentatives.find((t) => t.id === id);
          if (!tentative) return d;
          let bonnes = 0;
          const erreursParCours: Record<string, number> = {};
          tentative.questions.forEach((q, i) => {
            if (reponses[i] === q.reponse) bonnes += 1;
            else erreursParCours[q.courseId] = (erreursParCours[q.courseId] ?? 0) + 1;
          });
          const total = tentative.questions.length || 1;
          const complete: Tentative = {
            ...tentative,
            reponses,
            dureeSec,
            depassement,
            bonnes,
            scorePct: Math.round((bonnes / total) * 100),
            erreursParCours,
            completedAt: new Date().toISOString(),
            statut: 'termine',
          };
          const evt: Evenement = {
            id: uuid(),
            type: 'examen',
            at: complete.completedAt as string,
            matiere: complete.questions[0]?.matiere,
          };
          const suivant = {
            ...d,
            tentatives: d.tentatives.map((t) => (t.id === id ? complete : t)),
            evenements: [evt, ...d.evenements].slice(0, 600),
          };
          if (tampon.current) clearTimeout(tampon.current);
          tampon.current = setTimeout(() => {
            void ecrire(CLE.tentatives, suivant.tentatives);
            void ecrire(CLE.evenements, suivant.evenements);
          }, 300);
          return suivant;
        });
      },

      supprimerTentative: (id) => {
        setDonnees((d) => {
          const suivant = { ...d, tentatives: d.tentatives.filter((t) => t.id !== id) };
          if (tampon.current) clearTimeout(tampon.current);
          tampon.current = setTimeout(() => void ecrire(CLE.tentatives, suivant.tentatives), 300);
          return suivant;
        });
      },

      journaliser: (type, courseId, matiere) => {
        const evt: Evenement = { id: uuid(), type, at: new Date().toISOString(), courseId, matiere };
        setDonnees((d) => {
          const suivant = { ...d, evenements: [evt, ...d.evenements].slice(0, 600) };
          if (tampon.current) clearTimeout(tampon.current);
          tampon.current = setTimeout(() => void ecrire(CLE.evenements, suivant.evenements), 300);
          return suivant;
        });
      },
    }),
    [maj]
  );

  return <Contexte.Provider value={{ donnees, actions }}>{children}</Contexte.Provider>;
}

export function useStore() {
  const ctx = useContext(Contexte);
  if (!ctx) throw new Error('useStore doit être utilisé sous StoreProvider');
  return ctx;
}
