'use client';

/** ARVX — Accueil : direct, pas de surcharge. Les trois chiffres réels, reprendre, matières. */
import React from 'react';
import { useStore } from '@/lib/arvx/store';
import { chiffresAccueil, coursAReprendre, etatsMatieres, etapesTerminees } from '@/lib/arvx/aggregates';
import { dateLongue, dureeHumaine, ilYA } from '@/lib/arvx/format';
import { MATIERES } from '@/lib/arvx/tokens';
import { BarreProgres, CarteAppel, EtatVide, Etiquette, PuceMatiere, teinte } from '@/components/arvx/partages';

export function PageAccueil({ naviguer }: { naviguer: (chemin: string) => void }) {
  const { donnees } = useStore();
  const { session, cours, tentatives, evenements } = donnees;

  const chiffres = chiffresAccueil(cours, tentatives, evenements);
  const reprendre = coursAReprendre(cours);
  const matieres = etatsMatieres(cours, tentatives).slice(0, 3);
  const etapes = etapesTerminees(cours);
  const examensRecents = tentatives
    .filter((t) => t.statut === 'termine')
    .sort((a, b) => (a.completedAt ?? '') < (b.completedAt ?? '') ? 1 : -1)
    .slice(0, 2);

  const heure = new Date().getHours();
  const salut = heure < 12 ? 'Bonjour' : heure < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <div className="space-y-5">
      {/* Salutation */}
      <section>
        <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-attenu">{dateLongue(new Date().toISOString())}</p>
        <h1 className="mt-1 text-[26px] font-extrabold tracking-tight text-texte sm:text-[30px]">
          {salut}, {session?.nom.split(' ')[0]}.
        </h1>
        <p className="mt-1 text-[13px] text-second">
          {cours.length === 0
            ? 'Ton premier cours ouvre toutes les fonctions d’ARVX.'
            : `${etapes.faites} étape${etapes.faites > 1 ? 's' : ''} acquise${etapes.faites > 1 ? 's' : ''} sur ${etapes.total} — continue comme ça.`}
        </p>
      </section>

      {/* Trois chiffres réels */}
      <section className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {[
          { valeur: String(chiffres.nbCours), libelle: 'cours ajoutés', cible: () => naviguer('reviser') },
          { valeur: String(chiffres.revisions7j), libelle: 'révisions · 7 j', cible: () => naviguer('progression') },
          {
            valeur: chiffres.moyenne === null ? '—' : `${chiffres.moyenne}%`,
            libelle: 'moyenne examens',
            cible: () => naviguer('examens'),
          },
        ].map((c) => (
          <button
            key={c.libelle}
            onClick={c.cible}
            className="rounded-2xl border border-contour bg-white p-3.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-14px_rgba(31,42,68,0.25)] sm:p-4"
          >
            <p className="text-[22px] font-extrabold text-encre sm:text-[26px]">{c.valeur}</p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-attenu sm:text-[11px]">
              {c.libelle}
            </p>
          </button>
        ))}
      </section>

      {/* Reprendre ou appel au premier cours */}
      <section>
        <Etiquette className="mb-2.5">{reprendre ? 'Reprendre' : 'Bien démarrer'}</Etiquette>
        {reprendre ? (
          <button
            onClick={() => naviguer(`cours/${reprendre.id}`)}
            className="group w-full rounded-2xl border border-contour bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-16px_rgba(31,42,68,0.3)] sm:p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <PuceMatiere id={reprendre.matiere} petit />
                <p className="mt-2 truncate text-[15px] font-bold text-texte">{reprendre.titre}</p>
                <p className="mt-0.5 text-[12px] text-attenu">
                  {reprendre.etapes.filter((e) => e.etat === 'done').length}/{reprendre.etapes.length} étapes acquises
                  · consulté {ilYA(reprendre.analyzedAt)}
                </p>
              </div>
              <span className="shrink-0 rounded-xl bg-encre px-4 py-2 text-[12px] font-bold text-white transition-transform group-hover:scale-105">
                Continuer →
              </span>
            </div>
            <div className="mt-3">
              <BarreProgres
                pct={
                  reprendre.etapes.length > 0
                    ? (reprendre.etapes.filter((e) => e.etat === 'done').length / reprendre.etapes.length) * 100
                    : 0
                }
                couleur={MATIERES[reprendre.matiere].couleur}
              />
            </div>
          </button>
        ) : (
          <CarteAppel
            titre="Ajoute ton premier cours"
            texte="Colle ton cours (leçon, notes, chapitre). ARVX détecte la matière, rédige le résumé, découpe le pas à pas et prépare tes examens."
            action="Ajouter un cours"
            onClick={() => naviguer('nouveau')}
          />
        )}
      </section>

      {/* Matières */}
      {matieres.length > 0 && (
        <section>
          <div className="mb-2.5 flex items-center justify-between">
            <Etiquette>Tes matières</Etiquette>
            <button onClick={() => naviguer('reviser')} className="text-[12px] font-bold text-encre hover:underline">
              Tout voir
            </button>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-3">
            {matieres.map((m) => (
              <button
                key={m.matiere}
                onClick={() => naviguer(`matiere/${m.matiere}`)}
                className="rounded-2xl border border-contour bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-14px_rgba(31,42,68,0.25)]"
                style={{ boxShadow: `inset 0 3px 0 0 ${teinte(MATIERES[m.matiere].couleur, 0.8)}` }}
              >
                <p className="text-[13px] font-bold text-texte">{MATIERES[m.matiere].nom}</p>
                <p className="mt-0.5 text-[11px] text-attenu">
                  {m.nbCours} cours · {m.moyenne === null ? 'pas d’examen' : `${m.moyenne}% d’examen`}
                </p>
                <div className="mt-2.5">
                  <BarreProgres pct={m.revisePct} couleur={MATIERES[m.matiere].couleur} />
                  <p className="mt-1 text-[10px] font-semibold text-attenu">{m.revisePct}% révisé</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Examens récents */}
      {examensRecents.length > 0 && (
        <section>
          <div className="mb-2.5 flex items-center justify-between">
            <Etiquette>Examens récents</Etiquette>
            <button onClick={() => naviguer('examens')} className="text-[12px] font-bold text-encre hover:underline">
              Tous les examens
            </button>
          </div>
          <div className="space-y-2">
            {examensRecents.map((t) => (
              <button
                key={t.id}
                onClick={() => naviguer(`resultats/${t.id}`)}
                className="flex w-full items-center gap-3 rounded-2xl border border-contour bg-white p-3.5 text-left transition-all hover:-translate-y-0.5"
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[13px] font-extrabold"
                  style={{
                    backgroundColor: (t.scorePct ?? 0) >= 60 ? 'rgba(47,163,107,0.12)' : 'rgba(228,87,76,0.10)',
                    color: (t.scorePct ?? 0) >= 60 ? 'var(--succes)' : 'var(--erreur)',
                  }}
                >
                  {t.scorePct}%
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold text-texte">{t.titre}</span>
                  <span className="block text-[11px] text-attenu">
                    {t.bonnes}/{t.questions.length} · {dureeHumaine(t.dureeSec)} · {t.completedAt ? ilYA(t.completedAt) : ''}
                  </span>
                </span>
                <span className="text-attenu">›</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Appel examens — quand il y a déjà des cours */}
      {cours.length > 0 && (
        <CarteAppel
          titre={`ARVX peut te tester dès maintenant`}
          texte={`${cours.length} cours en banque : prépare un examen ciblé sur une matière, ou un examen global mélangé — avec chrono si tu veux.`}
          action="Préparer un examen"
          couleur="var(--succes)"
          onClick={() => naviguer('examens')}
        />
      )}

      {cours.length === 0 && tentatives.length === 0 && (
        <EtatVide
          emoji="📚"
          titre="Trois minutes pour installer ta première matière"
          texte="Colle n'importe quel cours — maths, histoire, anglais, informatique, peu importe le niveau. ARVX fait le reste en quelques secondes, sans réseau."
          action="Ajouter mon cours"
          onClick={() => naviguer('nouveau')}
        />
      )}
    </div>
  );
}
