'use client';

/** ARVX — Détail de cours : résumé, pas à pas cochable avec temps réel, test ciblé, suppression. */
import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/arvx/store';
import { dateAjout, dureeHumaine, melange } from '@/lib/arvx/format';
import { MATIERES } from '@/lib/arvx/tokens';
import { EtatEtape } from '@/lib/arvx/types';
import { Etiquette, PuceMatiere, teinte } from '@/components/arvx/partages';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Check, ChevronRight, Trash2, Zap } from 'lucide-react';

export function PageCours({ naviguer, coursId }: { naviguer: (chemin: string) => void; coursId: string }) {
  const { donnees, actions } = useStore();
  const cours = donnees.cours.find((c) => c.id === coursId);

  const [etapeCourante, setEtapeCourante] = useState<number | null>(null);
  const [secondes, setSecondes] = useState(0);
  const cumul = useRef({ secondes: 0, etape: null as number | null });

  /* Chronomètre : cumule le temps réellement passé sur le pas à pas. */
  useEffect(() => {
    if (etapeCourante === null) return;
    const t = setInterval(() => {
      cumul.current.secondes += 1;
      setSecondes(cumul.current.secondes);
    }, 1000);
    return () => clearInterval(t);
  }, [etapeCourante]);

  /* À la sortie du cours : le temps cumulé est journalisé une seule fois. */
  useEffect(() => {
    const idLocal = coursId;
    return () => {
      const { secondes: s, etape } = cumul.current;
      if (s > 0 && etape !== null && idLocal) {
        actions.noterConsultation(idLocal, etape, s);
        cumul.current.secondes = 0;
      }
    };
  }, [coursId, actions]);

  if (!cours) {
    return (
      <div className="p-6 text-center">
        <p className="text-[14px] font-bold text-texte">Ce cours n’existe plus.</p>
        <Button variant="outline" className="mt-3 bg-white" onClick={() => naviguer('reviser')}>
          Retour à Réviser
        </Button>
      </div>
    );
  }

  const meta = MATIERES[cours.matiere];
  const faites = cours.etapes.filter((e) => e.etat === 'done').length;

  const viderTemps = () => {
    const { secondes: s, etape } = cumul.current;
    if (s > 0 && etape !== null) {
      actions.noterConsultation(cours.id, etape, s);
      cumul.current.secondes = 0;
      setSecondes(0);
    }
  };

  const ouvrirEtape = (i: number) => {
    if (etapeCourante === i) return;
    viderTemps();
    cumul.current.etape = i;
    setEtapeCourante(i);
    actions.majCours(cours.id, { lastStepSeen: i });
    if (cours.etapes[i].etat === 'todo') {
      actions.marquerEtape(cours.id, i, 'doing');
    }
  };

  const validerEtape = (i: number) => {
    actions.marquerEtape(cours.id, i, 'done');
    actions.journaliser('reviser', cours.id, cours.matiere);
    toast({ title: 'Étape acquise', description: `Étape ${i + 1}/${cours.etapes.length} validée. Continue !` });
    if (i + 1 < cours.etapes.length) ouvrirEtape(i + 1);
    else {
      viderTemps();
      cumul.current.etape = null;
      setEtapeCourante(null);
    }
  };

  const supprimer = () => {
    actions.supprimerCours(cours.id);
    toast({ title: 'Cours supprimé', description: `« ${cours.titre} » a été retiré.` });
    naviguer(`matiere/${cours.matiere}`);
  };

  const cycle = (i: number) => {
    const etat = cours.etapes[i].etat;
    if (etat === 'done') return;
    ouvrirEtape(i);
  };

  const statutStyle = (etat: EtatEtape) => {
    switch (etat) {
      case 'done':
        return { bg: 'rgba(47,163,107,0.10)', fg: 'var(--succes)', libelle: 'Acquis' };
      case 'doing':
        return { bg: teinte(meta.couleur, 0.12), fg: meta.couleur, libelle: 'En cours' };
      default:
        return { bg: 'var(--elevation)', fg: 'var(--attenu)', libelle: 'À voir' };
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => naviguer(`matiere/${cours.matiere}`)}
        className="inline-flex items-center gap-1.5 text-[12px] font-bold text-second hover:text-encre"
      >
        <ArrowLeft size={14} /> {meta.nom}
      </button>

      {/* En-tête du cours */}
      <section className="rounded-2xl border border-contour bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <PuceMatiere id={cours.matiere} petit />
            <h1 className="mt-2 text-[20px] font-extrabold tracking-tight text-texte">{cours.titre}</h1>
            <p className="mt-1 text-[11px] text-attenu">
              {dateAjout(cours.createdAt)} · {cours.questions.length} questions en banque
              {cours.tempsPasseSec > 0 ? ` · ${dureeHumaine(cours.tempsPasseSec)} passées sur ce cours` : ''}
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0 text-attenu hover:bg-erreur/10 hover:text-erreur" aria-label="Supprimer ce cours">
                <Trash2 size={16} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer « {cours.titre} » ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Le cours, son pas à pas et ses {cours.questions.length} questions seront retirés de la banque
                  d’examens. Cette action est définitive.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Conserver</AlertDialogCancel>
                <AlertDialogAction className="bg-erreur text-white hover:bg-erreur/90" onClick={supprimer}>
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-elevation">
            <div className="h-full rounded-full transition-all" style={{ width: `${(faites / Math.max(1, cours.etapes.length)) * 100}%`, backgroundColor: meta.couleur }} />
          </div>
          <span className="text-[11px] font-extrabold text-encre">{faites}/{cours.etapes.length}</span>
        </div>
      </section>

      {/* Résumé */}
      <section className="rounded-2xl border border-contour bg-white p-5">
        <Etiquette>Résumé</Etiquette>
        <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed text-texte">{cours.resume}</p>
      </section>

      {/* Pas à pas */}
      <section>
        <div className="mb-2.5 flex items-center justify-between">
          <Etiquette>Pas à pas</Etiquette>
          {secondes > 0 && etapeCourante !== null && (
            <span className="rounded-full bg-elevation px-2.5 py-1 text-[11px] font-bold text-second tabular-nums">
              étape ouverte depuis {dureeHumaine(secondes) !== '—' ? dureeHumaine(secondes) : `${secondes} s`}
            </span>
          )}
        </div>
        <div className="space-y-2.5">
          {cours.etapes.map((e, i) => {
            const st = statutStyle(e.etat);
            const ouverte = etapeCourante === i;
            return (
              <div
                key={e.id}
                className={`rounded-2xl border bg-white transition-all ${ouverte ? 'shadow-[0_8px_24px_-14px_rgba(31,42,68,0.3)]' : ''}`}
                style={{ borderColor: ouverte ? teinte(meta.couleur, 0.5) : 'var(--contour)' }}
              >
                <button onClick={() => cycle(i)} className="flex w-full items-start gap-3 p-4 text-left">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-extrabold"
                    style={{ backgroundColor: st.bg, color: st.fg }}
                  >
                    {e.etat === 'done' ? <Check size={14} /> : i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-[13px] leading-relaxed ${e.etat === 'done' ? 'text-attenu line-through decoration-contour-fort' : 'text-texte'}`}>
                      {e.texte}
                    </span>
                    <span className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ backgroundColor: st.bg, color: st.fg }}>
                      {st.libelle}
                    </span>
                  </span>
                  {e.etat !== 'done' && <ChevronRight size={16} className="mt-1 shrink-0 text-attenu" />}
                </button>
                {ouverte && e.etat !== 'done' && (
                  <div className="border-t border-contour px-4 pb-3 pt-3">
                    <Button
                      onClick={() => validerEtape(i)}
                      className="h-10 w-full rounded-xl text-[13px] font-bold text-white"
                      style={{ backgroundColor: meta.couleur }}
                    >
                      <Check size={15} className="mr-1.5" />
                      Je maîtrise cette étape
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {etapeCourante === null && faites < cours.etapes.length && (
          <Button
            onClick={() => ouvrirEtape(cours.lastStepSeen > 0 ? Math.min(cours.lastStepSeen, cours.etapes.length - 1) : 0)}
            className="mt-3 h-11 w-full rounded-xl bg-encre text-[13px] font-bold text-white hover:bg-encre/90"
          >
            {cours.lastStepSeen > 0 ? 'Reprendre le pas à pas' : 'Commencer le pas à pas'}
          </Button>
        )}
      </section>

      {/* Test ciblé */}
      <section className="rounded-2xl border border-contour bg-white p-5">
        <Etiquette>Se tester</Etiquette>
        <p className="mt-1.5 text-[13px] text-second">
          {cours.questions.length} questions issues uniquement de ce cours — correction immédiate, score enregistré.
        </p>
        <Button
          onClick={() => {
            if (cours.questions.length < 1) return;
            const questions = melange(cours.questions).slice(0, Math.min(10, cours.questions.length));
            const t = actions.creerTentative({
              titre: `Test — ${cours.titre}`,
              mode: 'cible',
              courseIds: [cours.id],
              questionsDemandees: questions.length,
              limiteMin: null,
              questions,
            });
            naviguer(`examen/${t.id}`);
          }}
          disabled={cours.questions.length < 1}
          className="mt-3 h-11 w-full rounded-xl text-[13px] font-bold text-white hover:opacity-90 disabled:opacity-40 sm:w-auto sm:px-6"
          style={{ backgroundColor: meta.couleur }}
        >
          <Zap size={15} className="mr-1.5" />
          Tester sur ce cours ({Math.min(cours.questions.length, 10)} questions)
        </Button>
        {cours.questions.length < 1 && (
          <p className="mt-2 text-[11px] font-semibold text-attenu">
            Pas encore de questions sur ce cours — ajoute un cours plus fourni.
          </p>
        )}
      </section>
    </div>
  );
}
