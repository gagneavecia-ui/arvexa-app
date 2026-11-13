'use client';

/** ARVX — Progression : agrégat honnête de Réviser + Examens. Aucun chiffre sans donnée réelle derrière. */
import React from 'react';
import { useStore } from '@/lib/arvx/store';
import { bilanProgression, etapesTerminees } from '@/lib/arvx/aggregates';
import { dureeHumaine } from '@/lib/arvx/format';
import { MATIERES } from '@/lib/arvx/tokens';
import { BarreProgres, EtatVide, Etiquette, teinte } from '@/components/arvx/partages';
import { ArrowRight, Flame, Timer, Trophy } from 'lucide-react';

export function PageProgression({ naviguer }: { naviguer: (chemin: string) => void }) {
  const { donnees } = useStore();
  const { cours, tentatives, evenements } = donnees;

  if (cours.length === 0) {
    return (
      <div className="space-y-5">
        <section>
          <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-attenu">Progression</p>
          <h1 className="mt-1 text-[24px] font-extrabold tracking-tight text-texte">Ce que tu maîtrises vraiment</h1>
        </section>
        <EtatVide
          emoji="📈"
          titre="La progression naît de tes actions"
          texte="Chaque étape acquise en Réviser et chaque examen passé alimente cette page. Ajoute un cours pour démarrer la chaîne."
          action="Ajouter un cours"
          onClick={() => naviguer('nouveau')}
        />
      </div>
    );
  }

  const bilan = bilanProgression(cours, tentatives, evenements);
  const etapes = etapesTerminees(cours);

  const chiffres = [
    {
      icone: Flame,
      valeur: String(bilan.serie),
      unite: bilan.serie > 1 ? 'jours' : 'jour',
      libelle: 'série en cours',
      couleur: '#E8873C',
      fond: 'rgba(232,135,60,0.12)',
    },
    {
      icone: Timer,
      valeur: dureeHumaine(bilan.tempsRevisSec),
      unite: 'de pas à pas',
      libelle: 'temps révisé',
      couleur: 'var(--encre)',
      fond: 'rgba(31,42,68,0.08)',
    },
    {
      icone: Trophy,
      valeur: String(bilan.examensPasses),
      unite: bilan.examensPasses > 1 ? 'examens' : 'examen',
      libelle: 'tentatives terminées',
      couleur: 'var(--succes)',
      fond: 'rgba(47,163,107,0.12)',
    },
  ];

  return (
    <div className="space-y-5">
      <section>
        <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-attenu">Progression</p>
        <h1 className="mt-1 text-[24px] font-extrabold tracking-tight text-texte">Ce que tu maîtrises vraiment</h1>
        <p className="mt-1 text-[13px] text-second">
          {etapes.faites}/{etapes.total} étapes acquises · moyennes calculées uniquement sur tes examens réels.
        </p>
      </section>

      {/* Trois chiffres */}
      <section className="grid grid-cols-3 gap-2.5">
        {chiffres.map((c) => {
          const Icone = c.icone;
          return (
            <div key={c.libelle} className="rounded-2xl border border-contour bg-white p-3.5 sm:p-4">
              <span
                className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ backgroundColor: c.fond, color: c.couleur }}
              >
                <Icone size={15} />
              </span>
              <p className="text-[19px] font-extrabold leading-tight text-encre sm:text-[22px]">{c.valeur}</p>
              <p className="mt-0.5 text-[10px] font-semibold text-attenu">
                {c.unite} · {c.libelle}
              </p>
            </div>
          );
        })}
      </section>

      {/* Par matière */}
      <section>
        <Etiquette className="mb-2.5">Par matière — révisé et testé</Etiquette>
        <div className="space-y-2.5">
          {bilan.etats.map((e) => {
            const meta = MATIERES[e.matiere];
            return (
              <button
                key={e.matiere}
                onClick={() => naviguer(`matiere/${e.matiere}`)}
                className="w-full rounded-2xl border border-contour bg-white p-4 text-left transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-bold text-texte">{meta.nom}</p>
                  <span
                    className="rounded-lg px-2.5 py-1 text-[11px] font-extrabold"
                    style={{ backgroundColor: teinte(meta.couleur, 0.12), color: meta.couleur }}
                  >
                    {e.moyenne === null ? 'pas encore testé' : `${e.moyenne}% examen`}
                  </span>
                </div>
                <div className="mt-2.5">
                  <BarreProgres pct={e.revisePct} couleur={meta.couleur} />
                </div>
                <p className="mt-1.5 text-[11px] text-attenu">
                  {e.nbCours} cours · {e.etapesFaites}/{e.etapesTotal} étapes acquises ({e.revisePct}%)
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* À renforcer */}
      <section>
        <Etiquette className="mb-2.5">Priorité du moment</Etiquette>
        {bilan.aRenforcer ? (
          <button
            onClick={() => naviguer(`cours/${bilan.aRenforcer!.cours.id}`)}
            className="flex w-full items-center gap-3 rounded-2xl border border-contour bg-white p-4 text-left transition-all hover:-translate-y-0.5"
            style={{ boxShadow: 'inset 0 3px 0 0 rgba(228,87,76,0.7)' }}
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[15px] font-extrabold"
              style={{ backgroundColor: 'rgba(228,87,76,0.10)', color: 'var(--erreur)' }}
            >
              {bilan.aRenforcer.erreurs}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-bold text-texte">{bilan.aRenforcer.cours.titre}</span>
              <span className="block text-[11px] text-attenu">
                {bilan.aRenforcer.erreurs} erreur{bilan.aRenforcer.erreurs > 1 ? 's' : ''} cumulée
                {bilan.aRenforcer.erreurs > 1 ? 's' : ''} aux examens — c’est ici que tu gagnes le plus de points.
              </span>
            </span>
            <ArrowRight size={16} className="shrink-0 text-attenu" />
          </button>
        ) : (
          <div className="rounded-2xl border border-dashed border-contour-fort bg-white/60 p-4 text-center">
            <p className="text-[13px] font-bold text-texte">Aucune faiblesse détectée pour l’instant</p>
            <p className="mt-0.5 text-[12px] text-attenu">
              Passe un examen — ARVX repérera les cours à reprendre dès la première erreur.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
