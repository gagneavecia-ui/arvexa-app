'use client';

/** ARVX — Passage d’examen : une question à la fois, « réponds puis révèle », chrono honnête. */
import React, { useEffect, useState } from 'react';
import { useStore } from '@/lib/arvx/store';
import { chrono } from '@/lib/arvx/format';
import { MATIERES } from '@/lib/arvx/tokens';
import { BarreProgres, Etiquette, PuceMatiere } from '@/components/arvx/partages';
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
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';

export function PagePassage({ naviguer, tentativeId }: { naviguer: (chemin: string) => void; tentativeId: string }) {
  const { donnees, actions } = useStore();
  const tentative = donnees.tentatives.find((t) => t.id === tentativeId);

  const [idx, setIdx] = useState(0);
  const [reponses, setReponses] = useState<(number | null)[]>(() => tentative?.questions.map(() => null) ?? []);
  const [choix, setChoix] = useState<number | null>(null);
  const [revele, setRevele] = useState(false);
  const [ecoule, setEcoule] = useState(0);

  /* Chronomètre. */
  useEffect(() => {
    const t = setInterval(() => setEcoule((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  if (!tentative) {
    return (
      <div className="p-6 text-center">
        <p className="text-[14px] font-bold text-texte">Cet examen n’existe plus.</p>
        <Button variant="outline" className="mt-3 bg-white" onClick={() => naviguer('examens')}>
          Retour aux examens
        </Button>
      </div>
    );
  }

  const total = tentative.questions.length;
  const limiteSec = tentative.limiteMin !== null ? tentative.limiteMin * 60 : null;
  const depasse = limiteSec !== null && ecoule > limiteSec;
  const question = tentative.questions[idx];
  const meta = MATIERES[question.matiere];

  const valider = () => {
    if (choix === null) return;
    const suivant = [...reponses];
    suivant[idx] = choix;
    setReponses(suivant);
    setRevele(true);
  };

  const avancer = () => {
    if (idx + 1 < total) {
      setIdx(idx + 1);
      setChoix(reponses[idx + 1] ?? null);
      setRevele(false);
    } else {
      actions.terminerTentative(tentative.id, reponses, ecoule, depasse);
      naviguer(`resultats/${tentative.id}`);
    }
  };

  const abandonner = () => {
    actions.supprimerTentative(tentative.id);
    naviguer('examens');
  };

  const correcte = question.reponse;
  const bonneReponse = choix === correcte;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* En-tête examen */}
      <div className="flex items-center justify-between gap-3">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="inline-flex items-center gap-1.5 text-[12px] font-bold text-second hover:text-encre">
              <ArrowLeft size={14} /> Quitter
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Abandonner cet examen ?</AlertDialogTitle>
              <AlertDialogDescription>
                Les réponses déjà données seront perdues. La tentative ne sera pas comptée dans ta progression.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Continuer l’examen</AlertDialogCancel>
              <AlertDialogAction className="bg-erreur text-white hover:bg-erreur/90" onClick={abandonner}>
                Abandonner
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div className="flex items-center gap-2">
          {depasse && (
            <span className="rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ backgroundColor: 'rgba(228,87,76,0.10)', color: 'var(--erreur)' }}>
              temps dépassé
            </span>
          )}
          <span
            className="rounded-full px-3 py-1.5 text-[13px] font-extrabold tabular-nums"
            style={{
              backgroundColor: limiteSec !== null && !depasse ? 'rgba(31,42,68,0.08)' : 'var(--elevation)',
              color: 'var(--encre)',
            }}
          >
            {chrono(ecoule)}
            {limiteSec !== null && <span className="font-semibold text-attenu"> / {chrono(limiteSec)}</span>}
          </span>
        </div>
      </div>

      <div>
        <p className="truncate text-center text-[12px] font-bold text-second">{tentative.titre}</p>
        <p className="mt-0.5 text-center text-[11px] font-semibold text-attenu">
          Question {idx + 1} sur {total} · {reponses.filter((r) => r !== null).length} répondue
          {reponses.filter((r) => r !== null).length > 1 ? 's' : ''}
        </p>
        <div className="mt-2.5">
          <BarreProgres pct={((idx + (revele ? 1 : 0)) / total) * 100} couleur={meta.couleur} />
        </div>
      </div>

      {/* Question */}
      <section className="rounded-2xl border border-contour bg-white p-5">
        <div className="flex items-center justify-between gap-2">
          <PuceMatiere id={question.matiere} petit />
          <span className="text-[10px] font-semibold text-attenu">issu de « {question.courseTitre} »</span>
        </div>
        <p className="mt-3 text-[15px] font-bold leading-relaxed text-texte">{question.prompt}</p>

        {!revele && <p className="mt-2 text-[11px] font-semibold text-attenu">Réponds dans ta tête, puis choisis.</p>}

        <div className="mt-4 space-y-2">
          {question.choix.map((c, i) => {
            if (!revele) {
              const actif = choix === i;
              return (
                <button
                  key={i}
                  onClick={() => setChoix(i)}
                  className={`w-full rounded-xl border-2 p-3.5 text-left text-[13px] font-semibold transition-all ${
                    actif ? 'border-encre bg-elevation text-encre' : 'border-contour bg-white text-texte hover:border-contour-fort'
                  }`}
                >
                  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-elevation text-[11px] font-extrabold text-second">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {c}
                </button>
              );
            }
            const estBonne = i === correcte;
            const estChoisie = i === choix;
            return (
              <div
                key={i}
                className="w-full rounded-xl border-2 p-3.5 text-left text-[13px] font-semibold"
                style={{
                  borderColor: estBonne ? 'var(--succes)' : estChoisie ? 'var(--erreur)' : 'var(--contour)',
                  backgroundColor: estBonne ? 'rgba(47,163,107,0.08)' : estChoisie ? 'rgba(228,87,76,0.06)' : 'white',
                  opacity: estBonne || estChoisie ? 1 : 0.65,
                }}
              >
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-elevation text-[11px] font-extrabold text-second">
                  {String.fromCharCode(65 + i)}
                </span>
                {c}
                {estBonne && <CheckCircle2 size={15} className="ml-2 inline text-succes" />}
                {estChoisie && !estBonne && <XCircle size={15} className="ml-2 inline text-erreur" />}
              </div>
            );
          })}
        </div>

        {revele && (
          <div
            className="mt-4 rounded-xl p-3.5"
            style={{ backgroundColor: bonneReponse ? 'rgba(47,163,107,0.08)' : 'rgba(228,87,76,0.06)' }}
          >
            <p className="text-[13px] font-extrabold" style={{ color: bonneReponse ? 'var(--succes)' : 'var(--erreur)' }}>
              {bonneReponse ? 'Bonne réponse !' : `Raté — la bonne réponse était « ${question.choix[correcte]} »`}
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-second">{question.explication}</p>
          </div>
        )}
      </section>

      {/* Actions */}
      <div>
        {!revele ? (
          <Button
            onClick={valider}
            disabled={choix === null}
            className="h-12 w-full rounded-xl bg-encre text-[14px] font-bold text-white hover:bg-encre/90 disabled:opacity-40"
          >
            Valider ma réponse
          </Button>
        ) : (
          <Button
            onClick={avancer}
            className="h-12 w-full rounded-xl text-[14px] font-bold text-white"
            style={{ backgroundColor: meta.couleur }}
          >
            {idx + 1 < total ? 'Question suivante →' : 'Voir mon score →'}
          </Button>
        )}
      </div>
    </div>
  );
}
