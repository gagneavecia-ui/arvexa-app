'use client';

/** ARVX — Examens : fabriqués uniquement à partir des cours fournis. Ciblé (matière/cours) ou global, avec chrono. */
import React, { useMemo, useState } from 'react';
import { useStore } from '@/lib/arvx/store';
import { ilYA } from '@/lib/arvx/format';
import { MATIERES, MatiereId } from '@/lib/arvx/tokens';
import { EtatVide, Etiquette, PuceMatiere, teinte } from '@/components/arvx/partages';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Play } from 'lucide-react';

type Mode = 'cible' | 'global';

const CHOIX_NB = [5, 10, 15];
const CHOIX_TEMPS: Array<number | null> = [null, 5, 10, 20];

function Bascule<T extends string | number | null>({
  options,
  valeur,
  onChange,
  libeller,
}: {
  options: T[];
  valeur: T;
  onChange: (v: T) => void;
  libeller: (v: T) => string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const actif = o === valeur;
        return (
          <button
            key={String(o)}
            onClick={() => onChange(o)}
            className={`rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-all ${
              actif ? 'bg-encre text-white' : 'bg-elevation text-second hover:bg-contour'
            }`}
          >
            {libeller(o)}
          </button>
        );
      })}
    </div>
  );
}

export function PageExamens({ naviguer }: { naviguer: (chemin: string) => void }) {
  const { donnees, actions } = useStore();
  const { cours, tentatives } = donnees;

  const [mode, setMode] = useState<Mode>('cible');
  const [matiere, setMatiere] = useState<MatiereId | ''>('');
  const [coursChoisis, setCoursChoisis] = useState<string[]>([]);
  const [nb, setNb] = useState(10);
  const [limiteMin, setLimiteMin] = useState<number | null>(null);

  const matieres = useMemo(() => {
    const vues = new Set<MatiereId>();
    cours.forEach((c) => vues.add(c.matiere));
    return [...vues];
  }, [cours]);

  const coursCibles = useMemo(() => {
    if (mode === 'global') return cours;
    if (coursChoisis.length > 0) return cours.filter((c) => coursChoisis.includes(c.id));
    if (matiere) return cours.filter((c) => c.matiere === matiere);
    return [];
  }, [mode, cours, coursChoisis, matiere]);

  const banque = useMemo(() => coursCibles.reduce((s, c) => s + c.questions.length, 0), [coursCibles]);
  const nbEffectif = Math.min(nb, banque);

  const historique = [...tentatives]
    .filter((t) => t.statut === 'termine')
    .sort((a, b) => ((a.completedAt ?? '') < (b.completedAt ?? '') ? 1 : -1));

  if (cours.length === 0) {
    return (
      <div className="space-y-5">
        <section>
          <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-attenu">Examens</p>
          <h1 className="mt-1 text-[24px] font-extrabold tracking-tight text-texte">Testé sur ce que TU as apporté</h1>
        </section>
        <EtatVide
          emoji="🎯"
          titre="Les examens naissent de tes cours"
          texte="ARVX ne fabrique des examens qu’avec les cours que tu as fournis. Ajoute ton premier cours — la banque de questions se constitue toute seule."
          action="Ajouter un cours"
          onClick={() => naviguer('nouveau')}
        />
      </div>
    );
  }

  const lancer = () => {
    if (nbEffectif < 1) {
      toast({ title: 'Banque trop petite', description: 'Les cours choisis ne contiennent pas encore de questions.' });
      return;
    }
    const questions = coursCibles
      .flatMap((c) => c.questions)
      .map((v) => ({ valeur: v, r: Math.random() }))
      .sort((a, b) => a.r - b.r)
      .map((x) => x.valeur)
      .slice(0, nbEffectif);
    const titre =
      mode === 'global'
        ? 'Examen global — tous tes cours'
        : coursChoisis.length > 0
          ? `Examen ciblé — ${coursChoisis.length} cours`
          : `Examen ciblé — ${MATIERES[matiere as MatiereId].nom}`;
    const t = actions.creerTentative({
      titre,
      mode,
      courseIds: coursCibles.map((c) => c.id),
      questionsDemandees: nbEffectif,
      limiteMin,
      questions,
    });
    naviguer(`examen/${t.id}`);
  };

  return (
    <div className="space-y-5">
      <section>
        <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-attenu">Examens</p>
        <h1 className="mt-1 text-[24px] font-extrabold tracking-tight text-texte">Testé sur ce que TU as apporté</h1>
        <p className="mt-1 text-[13px] text-second">
          {cours.length} cours · {cours.reduce((s, c) => s + c.questions.length, 0)} questions en banque — ARVX n’invente rien.
        </p>
      </section>

      {/* Configuration */}
      <section className="rounded-2xl border border-contour bg-white p-5">
        <Etiquette>1 · Le périmètre</Etiquette>
        <div className="mt-2.5 flex gap-1.5">
          {[
            { id: 'cible' as Mode, nom: 'Ciblé', desc: 'une matière ou des cours précis' },
            { id: 'global' as Mode, nom: 'Global', desc: 'tout mélanger' },
          ].map((m) => {
            const actif = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setMode(m.id);
                  setCoursChoisis([]);
                }}
                className={`flex-1 rounded-xl border p-3 text-left transition-all ${
                  actif ? 'border-encre bg-elevation' : 'border-contour bg-white hover:bg-elevation/50'
                }`}
              >
                <p className={`text-[13px] font-bold ${actif ? 'text-encre' : 'text-texte'}`}>{m.nom}</p>
                <p className="mt-0.5 text-[11px] text-attenu">{m.desc}</p>
              </button>
            );
          })}
        </div>

        {mode === 'cible' && (
          <div className="mt-4 space-y-3">
            <label className="block text-[11px] font-bold uppercase tracking-wide text-attenu">
              {coursChoisis.length > 0 ? 'Cours sélectionnés (la matière est ignorée)' : 'Choisis une matière…'}
            </label>
            <Select
              value={coursChoisis.length > 0 ? '' : matiere}
              onValueChange={(v) => {
                setMatiere(v as MatiereId);
                setCoursChoisis([]);
              }}
              disabled={coursChoisis.length > 0}
            >
              <SelectTrigger className="h-11 w-full bg-white sm:max-w-xs">
                <SelectValue placeholder="Toute la matière…" />
              </SelectTrigger>
              <SelectContent>
                {matieres.map((m) => (
                  <SelectItem key={m} value={m}>
                    {MATIERES[m].nom} ({cours.filter((c) => c.matiere === m).length} cours)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-attenu">
                …ou coche des cours précis
              </p>
              <div className="grid max-h-52 gap-1.5 overflow-y-auto sc-arvx pr-1 sm:grid-cols-2">
                {cours.map((c) => {
                  const coche = coursChoisis.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() =>
                        setCoursChoisis((prev) =>
                          coche ? prev.filter((x) => x !== c.id) : [...prev, c.id]
                        )
                      }
                      className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition-all ${
                        coche ? 'border-encre bg-elevation' : 'border-contour bg-white'
                      }`}
                    >
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[11px] font-extrabold text-white"
                        style={{
                          backgroundColor: coche ? 'var(--encre)' : 'transparent',
                          borderColor: coche ? 'var(--encre)' : 'var(--contour-fort)',
                        }}
                      >
                        {coche ? '✓' : ''}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12px] font-bold text-texte">{c.titre}</span>
                        <span className="block text-[10px] text-attenu">
                          {c.questions.length} questions · {MATIERES[c.matiere].nom}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Etiquette className="mb-2">2 · Nombre de questions</Etiquette>
            <Bascule options={CHOIX_NB} valeur={nb} onChange={setNb} libeller={(v) => `${v}`} />
            {banque < nb && (
              <p className="mt-1.5 text-[11px] font-semibold text-attenu">
                Banque limitée à {banque} — l’examen en prendra {nbEffectif}.
              </p>
            )}
          </div>
          <div>
            <Etiquette className="mb-2">3 · Le temps</Etiquette>
            <Bascule options={CHOIX_TEMPS} valeur={limiteMin} onChange={setLimiteMin} libeller={(v) => (v === null ? 'Sans chrono' : `${v} min`)} />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-contour pt-4 sm:flex-row sm:items-center">
          <div className="flex-1 text-[12px] text-second">
            {coursCibles.length > 0 ? (
              <>
                <span className="font-bold text-encre">{nbEffectif} questions</span> issues de{' '}
                <span className="font-bold text-encre">{coursCibles.length} cours</span>
                {limiteMin !== null && <> · chrono {limiteMin} min</>}
              </>
            ) : (
              'Choisis une matière ou des cours pour continuer.'
            )}
          </div>
          <Button
            onClick={lancer}
            disabled={coursCibles.length === 0 || nbEffectif < 1}
            className="h-12 rounded-xl bg-encre px-6 text-[14px] font-bold text-white hover:bg-encre/90 disabled:opacity-40"
          >
            <Play size={16} className="mr-2" />
            Commencer l’examen
          </Button>
        </div>
      </section>

      {/* Historique */}
      {historique.length > 0 && (
        <section>
          <Etiquette className="mb-2.5">Tes examens passés</Etiquette>
          <div className="space-y-2">
            {historique.map((t) => {
              const reussi = (t.scorePct ?? 0) >= 60;
              return (
                <button
                  key={t.id}
                  onClick={() => naviguer(`resultats/${t.id}`)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-contour bg-white p-3.5 text-left transition-all hover:-translate-y-0.5"
                >
                  <span
                    className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl text-[14px] font-extrabold"
                    style={{
                      backgroundColor: reussi ? 'rgba(47,163,107,0.12)' : 'rgba(228,87,76,0.10)',
                      color: reussi ? 'var(--succes)' : 'var(--erreur)',
                    }}
                  >
                    {t.scorePct}%
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-bold text-texte">{t.titre}</span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-attenu">
                      <span>
                        {t.bonnes}/{t.questions.length} bonnes
                      </span>
                      {t.questions[0] && <PuceMatiere id={t.questions[0].matiere} petit />}
                      <span>· {t.completedAt ? ilYA(t.completedAt) : ''}</span>
                    </span>
                  </span>
                  <span className="shrink-0 text-attenu">›</span>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
