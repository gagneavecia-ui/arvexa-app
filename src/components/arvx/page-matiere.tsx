'use client';

/** ARVX — Fiche matière : tous les cours d’une matière + ajout dédié. */
import React from 'react';
import { useStore } from '@/lib/arvx/store';
import { etatsMatieres } from '@/lib/arvx/aggregates';
import { dateAjout, dureeHumaine } from '@/lib/arvx/format';
import { MATIERES, MatiereId } from '@/lib/arvx/tokens';
import { BarreProgres, EtatVide, Etiquette, PuceMatiere, teinte } from '@/components/arvx/partages';
import { ArrowLeft } from 'lucide-react';

export function PageMatiere({ naviguer, matiereId }: { naviguer: (chemin: string) => void; matiereId: MatiereId }) {
  const { donnees } = useStore();
  const { cours, tentatives } = donnees;

  const meta = MATIERES[matiereId] ?? MATIERES.autre;
  const etat = etatsMatieres(cours, tentatives).find((e) => e.matiere === matiereId);
  const mesCours = cours
    .filter((c) => c.matiere === matiereId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return (
    <div className="space-y-5">
      <button
        onClick={() => naviguer('reviser')}
        className="inline-flex items-center gap-1.5 text-[12px] font-bold text-second hover:text-encre"
      >
        <ArrowLeft size={14} /> Réviser
      </button>

      <section className="rounded-2xl border border-contour bg-white p-5" style={{ boxShadow: `inset 0 3px 0 0 ${teinte(meta.couleur, 0.8)}` }}>
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-[18px] font-extrabold"
            style={{ backgroundColor: teinte(meta.couleur, 0.14), color: meta.couleur }}
          >
            {meta.nom.slice(0, 2)}
          </div>
          <div className="flex-1">
            <h1 className="text-[22px] font-extrabold tracking-tight text-texte">{meta.nom}</h1>
            <p className="text-[12px] text-attenu">
              {etat
                ? `${etat.nbCours} cours · ${etat.etapesFaites}/${etat.etapesTotal} étapes acquises${etat.moyenne !== null ? ` · ${etat.moyenne}% aux examens` : ''}`
                : 'matière prête'}
            </p>
          </div>
        </div>
        {etat && (
          <div className="mt-4">
            <BarreProgres pct={etat.revisePct} couleur={meta.couleur} />
            <p className="mt-1.5 text-[11px] font-semibold text-attenu">{etat.revisePct}% du pas à pas acquis</p>
          </div>
        )}
      </section>

      <section>
        <Etiquette className="mb-2.5">Cours de {meta.nom}</Etiquette>
        {mesCours.length === 0 ? (
          <EtatVide
            emoji="📥"
            titre="Cette matière attend son premier cours"
            texte={`Ajoute un cours de ${meta.nom} : il rejoindra la banque de questions de la matière et nourrira tes examens ciblés.`}
            action={`Ajouter un cours de ${meta.nom}`}
            onClick={() => naviguer(`nouveau/${matiereId}`)}
            teinteCarte={teinte(meta.couleur, 0.06)}
          />
        ) : (
          <div className="space-y-2">
            {mesCours.map((c) => {
              const faites = c.etapes.filter((e) => e.etat === 'done').length;
              return (
                <button
                  key={c.id}
                  onClick={() => naviguer(`cours/${c.id}`)}
                  className="w-full rounded-2xl border border-contour bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-14px_rgba(31,42,68,0.25)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-bold text-texte">{c.titre}</p>
                      <p className="mt-0.5 text-[11px] text-attenu">
                        {dateAjout(c.createdAt)} · {c.questions.length} questions en banque
                        {c.tempsPasseSec > 0 ? ` · ${dureeHumaine(c.tempsPasseSec)} révisées` : ''}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-extrabold" style={{ backgroundColor: teinte(meta.couleur, 0.12), color: meta.couleur }}>
                      {c.etapes.length > 0 ? `${Math.round((faites / c.etapes.length) * 100)}%` : '—'}
                    </span>
                  </div>
                  <div className="mt-3">
                    <BarreProgres pct={c.etapes.length > 0 ? (faites / c.etapes.length) * 100 : 0} couleur={meta.couleur} />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <button
        onClick={() => naviguer(`nouveau/${matiereId}`)}
        className="w-full rounded-2xl border border-dashed border-contour-fort bg-white/60 p-4 text-[13px] font-bold text-encre transition-colors hover:bg-white"
        style={{ color: meta.couleur }}
      >
        + Ajouter un autre cours de {meta.nom}
      </button>
    </div>
  );
}
