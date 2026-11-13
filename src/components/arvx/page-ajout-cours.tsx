'use client';

/** ARVX — Ajout d’un cours : titre + contenu → détection de matière → aperçu → enregistrement.
 *  Le moteur d’analyse est embarqué (analyseur.ts) : aucun réseau, aucune donnée envoyée. */
import React, { useMemo, useState } from 'react';
import { useStore } from '@/lib/arvx/store';
import { analyserCours } from '@/lib/arvx/analyseur';
import { uuid } from '@/lib/arvx/format';
import { MATIERES, MatiereId } from '@/lib/arvx/tokens';
import { Question } from '@/lib/arvx/types';
import { Etiquette, PuceMatiere, teinte } from '@/components/arvx/partages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Sparkles } from 'lucide-react';

const MIN_CARACTERES = 120;

interface Apercu {
  matiere: MatiereId;
  confiance: string;
  resume: string;
  etapes: string[];
  questions: Question[];
}

export function PageAjoutCours({
  naviguer,
  matierePreselection,
}: {
  naviguer: (chemin: string) => void;
  matierePreselection: MatiereId | null;
}) {
  const { actions } = useStore();
  const [titre, setTitre] = useState('');
  const [contenu, setContenu] = useState('');
  const [apercu, setApercu] = useState<Apercu | null>(null);
  const [matiereChoisie, setMatiereChoisie] = useState<MatiereId | null>(null);
  const [enAnalyse, setEnAnalyse] = useState(false);
  const [erreur, setErreur] = useState('');

  const pret = titre.trim().length >= 3 && contenu.trim().length >= MIN_CARACTERES;

  const apercuMemo = useMemo(() => apercu, [apercu]);

  const analyser = () => {
    if (!pret) {
      setErreur(
        contenu.trim().length < MIN_CARACTERES
          ? `Colle un peu plus de contenu (${MIN_CARACTERES} caractères minimum) — ARVX a besoin de matière pour travailler.`
          : 'Donne un titre à ton cours (3 caractères minimum).'
      );
      return;
    }
    setErreur('');
    setEnAnalyse(true);
    // Le moteur local est instantané : une courte pause rend le travail visible.
    setTimeout(() => {
      const r = analyserCours(contenu);
      setApercu({
        matiere: r.detection.matiere,
        confiance: r.detection.confiance,
        resume: r.resume,
        etapes: r.etapes,
        questions: r.questions,
      });
      setMatiereChoisie(matierePreselection ?? r.detection.matiere);
      setEnAnalyse(false);
    }, 900);
  };

  const enregistrer = () => {
    if (!apercuMemo || !matiereChoisie) return;
    const coursId = uuid();
    const cours = actions.ajouterCours({
      id: coursId,
      titre: titre.trim(),
      matiere: matiereChoisie,
      source: 'texte',
      contenu: contenu.trim(),
      resume: apercuMemo.resume,
      etapes: apercuMemo.etapes.map((texte, i) => ({
        id: `e${i}`,
        texte,
        etat: 'todo' as const,
      })),
      questions: apercuMemo.questions.map((q) => ({
        ...q,
        courseId: coursId,
        courseTitre: titre.trim(),
      })),
      analyzedAt: new Date().toISOString(),
    });
    toast({ title: 'Cours ajouté', description: `« ${cours.titre} » rejoint ${MATIERES[matiereChoisie].nom}.` });
    naviguer(`matiere/${matiereChoisie}`);
  };

  /* ───────────── étape 2 : aperçu de l’analyse ───────────── */
  if (apercuMemo) {
    const meta = MATIERES[matiereChoisie ?? apercuMemo.matiere];
    const exemples = apercuMemo.questions.slice(0, 2);
    return (
      <div className="space-y-4">
        <button
          onClick={() => setApercu(null)}
          className="inline-flex items-center gap-1.5 text-[12px] font-bold text-second hover:text-encre"
        >
          <ArrowLeft size={14} /> Modifier le cours
        </button>

        <section className="rounded-2xl border border-contour bg-white p-5">
          <Etiquette>Matière détectée</Etiquette>
          <div className="mt-2 flex flex-wrap items-center gap-2.5">
            <PuceMatiere id={apercuMemo.matiere} />
            <span className="text-[12px] font-semibold text-attenu">
              {apercuMemo.confiance === 'elevee'
                ? 'confiance élevée'
                : apercuMemo.confiance === 'moyenne'
                  ? 'confiance moyenne'
                  : 'confiance faible — vérifie ci-dessous'}
            </span>
          </div>
          <div className="mt-3">
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-attenu">
              Corriger si besoin
            </label>
            <Select value={matiereChoisie ?? apercuMemo.matiere} onValueChange={(v) => setMatiereChoisie(v as MatiereId)}>
              <SelectTrigger className="h-11 w-full bg-white sm:w-72">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(MATIERES).map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        <section className="rounded-2xl border border-contour bg-white p-5">
          <Etiquette>Résumé</Etiquette>
          <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed text-texte">{apercuMemo.resume}</p>
        </section>

        <section className="rounded-2xl border border-contour bg-white p-5">
          <Etiquette>Pas à pas — {apercuMemo.etapes.length} étapes</Etiquette>
          <ol className="mt-2 space-y-2">
            {apercuMemo.etapes.map((e, i) => (
              <li key={i} className="flex gap-2.5 rounded-xl bg-elevation/60 p-3">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold text-white"
                  style={{ backgroundColor: meta.couleur }}
                >
                  {i + 1}
                </span>
                <span className="text-[12.5px] leading-relaxed text-texte">{e}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border border-contour bg-white p-5">
          <Etiquette>Banque de questions</Etiquette>
          <p className="mt-1.5 text-[13px] font-bold text-texte">
            {apercuMemo.questions.length} questions prêtes pour tes examens
          </p>
          <div className="mt-2.5 space-y-2">
            {exemples.map((q) => (
              <div key={q.id} className="rounded-xl border border-contour p-3">
                <p className="text-[12px] font-semibold text-texte">{q.prompt}</p>
                <p className="mt-1 text-[11px] text-attenu">
                  {q.choix.length} choix · correction immédiate à l’examen
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-2.5 sm:flex-row">
          <Button
            onClick={enregistrer}
            className="h-12 flex-1 rounded-xl bg-encre text-[14px] font-bold text-white hover:bg-encre/90"
          >
            Enregistrer ce cours →
          </Button>
          <Button
            variant="outline"
            onClick={() => setApercu(null)}
            className="h-12 rounded-xl border-contour-fort bg-white text-[13px] font-bold text-second"
          >
            Recommencer l’analyse
          </Button>
        </div>
      </div>
    );
  }

  /* ───────────── étape 1 : formulaire ───────────── */
  return (
    <div className="space-y-4">
      <button
        onClick={() => naviguer('reviser')}
        className="inline-flex items-center gap-1.5 text-[12px] font-bold text-second hover:text-encre"
      >
        <ArrowLeft size={14} /> Réviser
      </button>

      <section>
        <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-attenu">Nouveau cours</p>
        <h1 className="mt-1 text-[24px] font-extrabold tracking-tight text-texte">Apporte ton cours</h1>
        <p className="mt-1 text-[13px] text-second">
          Colle le texte de ta leçon — n’importe quel niveau, n’importe quelle matière. Tout reste sur ton appareil.
        </p>
      </section>

      <section className="space-y-4 rounded-2xl border border-contour bg-white p-5">
        <div>
          <label htmlFor="titre" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-attenu">
            Titre du cours
          </label>
          <Input
            id="titre"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            placeholder="Ex. Le théorème de Pythagore — 4e"
            className="h-11 bg-white"
            maxLength={90}
          />
        </div>
        <div>
          <label htmlFor="contenu" className="mb-1.5 flex items-center justify-between text-[11px] font-bold uppercase tracking-wide text-attenu">
            <span>Contenu du cours</span>
            <span className={contenu.length >= MIN_CARACTERES ? 'text-succes' : ''}>
              {contenu.length} / {MIN_CARACTERES} min.
            </span>
          </label>
          <Textarea
            id="contenu"
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            placeholder="Colle ici ta leçon complète : définitions, formules, exemples, remarques du prof…"
            className="min-h-[220px] resize-y bg-white text-[13px] leading-relaxed sc-arvx"
          />
        </div>
        {erreur && <p className="text-[12px] font-semibold text-erreur">{erreur}</p>}
        <Button
          onClick={analyser}
          disabled={!pret || enAnalyse}
          className="h-12 w-full rounded-xl bg-encre text-[14px] font-bold text-white hover:bg-encre/90 disabled:opacity-40"
        >
          {enAnalyse ? (
            <>
              <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Analyse en cours…
            </>
          ) : (
            <>
              <Sparkles size={16} className="mr-2" />
              Analyser mon cours
            </>
          )}
        </Button>
        {!pret && (
          <p className="text-center text-[11px] text-attenu">
            Titre (3+ caractères) et contenu ({MIN_CARACTERES}+ caractères) — puis ARVX fait le reste.
          </p>
        )}
      </section>
    </div>
  );
}
