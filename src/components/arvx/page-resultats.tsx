'use client';

/** ARVX — Résultats d’examen : score, détail par question, « à renforcer » relié aux cours. */
import React from 'react';
import { useStore } from '@/lib/arvx/store';
import { dureeHumaine } from '@/lib/arvx/format';
import { MATIERES } from '@/lib/arvx/tokens';
import { Etiquette, PuceMatiere, teinte } from '@/components/arvx/partages';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Target, XCircle } from 'lucide-react';

export function PageResultats({ naviguer, tentativeId }: { naviguer: (chemin: string) => void; tentativeId: string }) {
  const { donnees } = useStore();
  const t = donnees.tentatives.find((x) => x.id === tentativeId);
  const { cours } = donnees;

  if (!t) {
    return (
      <div className="p-6 text-center">
        <p className="text-[14px] font-bold text-texte">Résultat introuvable.</p>
        <Button variant="outline" className="mt-3 bg-white" onClick={() => naviguer('examens')}>
          Retour aux examens
        </Button>
      </div>
    );
  }

  const total = t.questions.length;
  const score = t.scorePct ?? 0;
  const mention =
    score >= 85
      ? { libelle: 'Excellent — tu maîtrises', couleur: 'var(--succes)', fond: 'rgba(47,163,107,0.10)' }
      : score >= 60
        ? { libelle: 'Solide — continue', couleur: 'var(--succes)', fond: 'rgba(47,163,107,0.08)' }
        : score >= 40
          ? { libelle: 'À consolider', couleur: '#E8873C', fond: 'rgba(232,135,60,0.10)' }
          : { libelle: 'Reprends le pas à pas', couleur: 'var(--erreur)', fond: 'rgba(228,87,76,0.10)' };

  const coursErreurs = Object.entries(t.erreursParCours)
    .sort((a, b) => b[1] - a[1])
    .map(([id, n]) => ({ cours: cours.find((c) => c.id === id), erreurs: n }))
    .filter((x) => x.cours);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <button
        onClick={() => naviguer('examens')}
        className="inline-flex items-center gap-1.5 text-[12px] font-bold text-second hover:text-encre"
      >
        <ArrowLeft size={14} /> Examens
      </button>

      {/* Score */}
      <section className="rounded-2xl border border-contour bg-white p-6 text-center">
        <Etiquette>{t.titre}</Etiquette>
        <p className="mt-3 text-[56px] font-extrabold leading-none" style={{ color: mention.couleur }}>
          {score}
          <span className="text-[22px] font-extrabold text-attenu">%</span>
        </p>
        <p className="mt-2 inline-block rounded-full px-4 py-1.5 text-[12px] font-bold" style={{ backgroundColor: mention.fond, color: mention.couleur }}>
          {mention.libelle}
        </p>
        <div className="mt-4 flex items-center justify-center gap-6 text-[12px] font-semibold text-second">
          <span>
            <span className="font-extrabold text-encre">{t.bonnes}</span>/{total} bonnes
          </span>
          <span>
            <span className="font-extrabold text-encre">{dureeHumaine(t.dureeSec)}</span> passées
          </span>
          {t.depassement && (
            <span className="rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ backgroundColor: 'rgba(228,87,76,0.10)', color: 'var(--erreur)' }}>
              temps dépassé
            </span>
          )}
        </div>
      </section>

      {/* À renforcer */}
      {coursErreurs.length > 0 && (
        <section className="rounded-2xl border border-contour bg-white p-5">
          <Etiquette>À renforcer</Etiquette>
          <div className="mt-2.5 space-y-2">
            {coursErreurs.map(({ cours: c, erreurs }) => (
              <button
                key={c!.id}
                onClick={() => naviguer(`cours/${c!.id}`)}
                className="flex w-full items-center gap-3 rounded-xl border border-contour p-3 text-left transition-all hover:bg-elevation/50"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: teinte(MATIERES[c!.matiere].couleur, 0.12), color: MATIERES[c!.matiere].couleur }}>
                  <Target size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold text-texte">{c!.titre}</span>
                  <span className="block text-[11px] text-attenu">
                    {erreurs} erreur{erreurs > 1 ? 's' : ''} sur ce cours — revois le pas à pas
                  </span>
                </span>
                <span className="text-attenu">›</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Détail */}
      <section className="space-y-2.5">
        <Etiquette>Détail des {total} questions</Etiquette>
        {t.questions.map((q, i) => {
          const maReponse = t.reponses[i];
          const bonne = maReponse === q.reponse;
          return (
            <div key={q.id} className="rounded-2xl border border-contour bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13px] font-bold leading-relaxed text-texte">
                  <span className="mr-1.5 text-attenu">{i + 1}.</span>
                  {q.prompt}
                </p>
                {bonne ? (
                  <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-succes" />
                ) : (
                  <XCircle size={17} className="mt-0.5 shrink-0 text-erreur" />
                )}
              </div>
              <div className="mt-2 space-y-1 text-[12px]">
                <p style={{ color: bonne ? 'var(--succes)' : 'var(--erreur)' }}>
                  <span className="font-bold">Ta réponse :</span> {maReponse === null ? 'non répondue' : q.choix[maReponse]}
                </p>
                {!bonne && (
                  <p style={{ color: 'var(--succes)' }}>
                    <span className="font-bold">Attendue :</span> {q.choix[q.reponse]}
                  </p>
                )}
                <p className="pt-1 text-[11px] leading-relaxed text-attenu">{q.explication}</p>
              </div>
              <div className="mt-2">
                <PuceMatiere id={q.matiere} petit />
              </div>
            </div>
          );
        })}
      </section>

      <div className="flex flex-col gap-2.5 sm:flex-row">
        <Button onClick={() => naviguer('examens')} className="h-12 flex-1 rounded-xl bg-encre text-[14px] font-bold text-white hover:bg-encre/90">
          Nouvel examen
        </Button>
        <Button
          variant="outline"
          onClick={() => naviguer('progression')}
          className="h-12 flex-1 rounded-xl border-contour-fort bg-white text-[13px] font-bold text-second"
        >
          Voir ma progression
        </Button>
      </div>
    </div>
  );
}
