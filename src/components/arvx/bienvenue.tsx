'use client';

/** ARVX — écran de bienvenue (première visite). Référence AXIA : héros clair, un seul appel. */
import React, { useState } from 'react';
import { useStore } from '@/lib/arvx/store';
import { Logo } from '@/components/arvx/partages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const PILIERS = [
  { emoji: '📥', titre: 'Ajoute ton cours', texte: 'Colle ton cours — n’importe quel niveau, n’importe quelle matière. ARVX reconnaît la matière tout seul.' },
  { emoji: '🪜', titre: 'Révise pas à pas', texte: 'Résumé clair, étapes cochables, banque de questions : tu avances à ton rythme, jamais noyé.' },
  { emoji: '🎯', titre: 'Passe tes examens', texte: 'Des examens ciblés ou globaux, fabriqués uniquement avec TES cours. Progression honnête incluse.' },
];

export function Bienvenue() {
  const { donnees, actions } = useStore();
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [erreur, setErreur] = useState('');

  const demarrer = () => {
    const n = nom.trim();
    if (n.length < 2) {
      setErreur('Ton prénom (ou ton pseudo) sert à te saluer — 2 caractères minimum.');
      return;
    }
    actions.ouvrirSession({
      nom: n,
      email: email.trim(),
      createdAt: new Date().toISOString(),
    });
  };

  if (!donnees.pret) return null;

  return (
    <div className="min-h-screen bg-fond">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 py-6 sm:px-6">
        <header className="flex items-center justify-between">
          <Logo />
          <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-second shadow-sm">
            Écosystème ARVEXA
          </span>
        </header>

        <main className="flex flex-1 flex-col justify-center py-10">
          <div className="text-center">
            <span
              className="inline-block rounded-full px-4 py-1.5 text-[12px] font-bold"
              style={{ backgroundColor: 'rgba(111, 107, 240, 0.10)', color: '#6F6BF0' }}
            >
              ✦ Pour les élèves de tous niveaux
            </span>
            <h1 className="mt-5 text-[38px] font-extrabold leading-[1.1] tracking-tight text-texte sm:text-[52px]">
              Ton cours entre,
              <br />
              <span className="text-encre">ARVX s’occupe du reste.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-second">
              Colle ton cours : ARVX le transforme en résumé, explication pas à pas, banque de questions,
              examens et progression honnête. Aucun compte externe, rien n’est envoyé — tes cours restent
              sur ton appareil.
            </p>
          </div>

          <div className="mx-auto mt-8 w-full max-w-md rounded-2xl border border-contour bg-white p-5 shadow-[0_10px_40px_-18px_rgba(31,42,68,0.25)]">
            <p className="text-[13px] font-bold text-texte">On commence par un prénom</p>
            <p className="mt-0.5 text-[12px] text-attenu">Juste pour te saluer — c’est tout.</p>
            <div className="mt-4 space-y-3">
              <div>
                <label htmlFor="nom" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-attenu">
                  Prénom ou pseudo
                </label>
                <Input
                  id="nom"
                  value={nom}
                  onChange={(e) => {
                    setNom(e.target.value);
                    setErreur('');
                  }}
                  placeholder="Ex. Aïcha"
                  className="h-11 bg-white"
                  maxLength={30}
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-attenu">
                  E-mail (facultatif)
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pour t’y retrouver plus tard"
                  className="h-11 bg-white"
                  maxLength={80}
                />
              </div>
              {erreur && <p className="text-[12px] font-semibold text-erreur">{erreur}</p>}
              <Button
                onClick={demarrer}
                className="h-12 w-full rounded-xl bg-encre text-[14px] font-bold text-white hover:bg-encre/90"
              >
                Commencer avec ARVX →
              </Button>
            </div>
          </div>

          <div className="mx-auto mt-10 grid w-full max-w-3xl gap-3 sm:grid-cols-3">
            {PILIERS.map((p) => (
              <div key={p.titre} className="rounded-2xl border border-contour bg-white p-4">
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-elevation text-lg">
                  {p.emoji}
                </div>
                <p className="text-[13px] font-bold text-texte">{p.titre}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-second">{p.texte}</p>
              </div>
            ))}
          </div>
        </main>

        <footer className="pb-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[1.2px] text-attenu">
            ARVX v1.0.0 · privé et hors ligne · tes cours restent chez toi
          </p>
        </footer>
      </div>
    </div>
  );
}
