'use client';

/** ARVX — Réviser : cartes de matières dynamiques + tous les cours. Une matière peut toujours recevoir un nouveau cours. */
import React from 'react';
import { useStore } from '@/lib/arvx/store';
import { etatsMatieres } from '@/lib/arvx/aggregates';
import { dateAjout, dureeHumaine } from '@/lib/arvx/format';
import { MATIERES } from '@/lib/arvx/tokens';
import { BarreProgres, CarteAppel, EtatVide, Etiquette, PuceMatiere, teinte } from '@/components/arvx/partages';

export function PageReviser({ naviguer }: { naviguer: (chemin: string) => void }) {
  const { donnees } = useStore();
  const { cours, tentatives } = donnees;

  const etats = etatsMatieres(cours, tentatives);
  const recents = [...cours].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  if (cours.length === 0) {
    return (
      <div className="space-y-5">
        <section>
          <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-attenu">Réviser</p>
          <h1 className="mt-1 text-[24px] font-extrabold tracking-tight text-texte">Tes cours, pas à pas</h1>
          <p className="mt-1 text-[13px] text-second">
            Chaque cours ajouté devient une matière — une matière peut recevoir autant de cours que tu veux.
          </p>
        </section>
        <EtatVide
          emoji="🗂️"
          titre="Aucun cours pour l’instant"
          texte="Ajoute ton premier cours : colle le texte, donne un titre, ARVX détecte la matière et prépare tout."
          action="Ajouter un cours"
          onClick={() => naviguer('nouveau')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-attenu">Réviser</p>
          <h1 className="mt-1 text-[24px] font-extrabold tracking-tight text-texte">Tes matières</h1>
          <p className="mt-1 text-[13px] text-second">
            {cours.length} cours · {etats.length} matière{etats.length > 1 ? 's' : ''} installée
            {etats.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => naviguer('nouveau')}
          className="shrink-0 rounded-xl bg-encre px-4 py-2.5 text-[12px] font-bold text-white transition-transform hover:scale-105"
        >
          + Ajouter
        </button>
      </section>

      {/* Cartes de matières */}
      <section className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {etats.map((m) => {
          const meta = MATIERES[m.matiere];
          return (
            <button
              key={m.matiere}
              onClick={() => naviguer(`matiere/${m.matiere}`)}
              className="group rounded-2xl border border-contour bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-14px_rgba(31,42,68,0.3)]"
            >
              <div
                className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-[16px] font-extrabold"
                style={{ backgroundColor: teinte(meta.couleur, 0.14), color: meta.couleur }}
              >
                {meta.nom.slice(0, 2)}
              </div>
              <p className="text-[14px] font-bold text-texte">{meta.nom}</p>
              <p className="mt-0.5 text-[11px] text-attenu">
                {m.nbCours} cours · {m.moyenne === null ? 'aucun examen' : `${m.moyenne}% aux examens`}
              </p>
              <div className="mt-3">
                <BarreProgres pct={m.revisePct} couleur={meta.couleur} />
                <div className="mt-1 flex items-center justify-between text-[10px] font-semibold text-attenu">
                  <span>{m.revisePct}% révisé</span>
                  <span>
                    {m.etapesFaites}/{m.etapesTotal} étapes
                  </span>
                </div>
              </div>
              <p className="mt-2 text-[11px] font-bold text-encre opacity-0 transition-opacity group-hover:opacity-100">
                Ouvrir et ajouter un cours →
              </p>
            </button>
          );
        })}
      </section>

      {/* Tous les cours */}
      <section>
        <Etiquette className="mb-2.5">Tous tes cours</Etiquette>
        <div className="space-y-2">
          {recents.map((c) => {
            const faites = c.etapes.filter((e) => e.etat === 'done').length;
            return (
              <button
                key={c.id}
                onClick={() => naviguer(`cours/${c.id}`)}
                className="flex w-full items-center gap-3 rounded-2xl border border-contour bg-white p-3.5 text-left transition-all hover:-translate-y-0.5"
              >
                <span
                  className="h-10 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: MATIERES[c.matiere].couleur }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold text-texte">{c.titre}</span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-attenu">
                    <PuceMatiere id={c.matiere} petit />
                    <span>{dateAjout(c.createdAt)}</span>
                    {c.tempsPasseSec > 0 && <span>· {dureeHumaine(c.tempsPasseSec)} révisées</span>}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-[12px] font-extrabold text-encre">
                    {c.etapes.length > 0 ? `${Math.round((faites / c.etapes.length) * 100)}%` : '—'}
                  </span>
                  <span className="block text-[10px] text-attenu">révisé</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <CarteAppel
        titre="Une nouvelle leçon ?"
        texte="Chaque cours ajouté enrichit la matière : plus tu fournis, plus les examens deviennent justes."
        action="Ajouter un cours"
        onClick={() => naviguer('nouveau')}
      />
    </div>
  );
}
