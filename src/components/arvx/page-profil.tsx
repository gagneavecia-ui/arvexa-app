'use client';

/** ARVX — Profil : compte local, données réelles, export et remise à zéro. */
import React from 'react';
import { useStore } from '@/lib/arvx/store';
import { initiales } from '@/lib/arvx/format';
import { Etiquette } from '@/components/arvx/partages';
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
import { Download, LogOut, ShieldCheck, Trash2 } from 'lucide-react';

export function PageProfil({ naviguer }: { naviguer: (chemin: string) => void }) {
  const { donnees, actions } = useStore();
  const { session, cours, tentatives } = donnees;

  const nbQuestions = cours.reduce((s, c) => s + c.questions.length, 0);

  const exporter = () => {
    const data = {
      app: 'ARVX',
      version: '1.0.0-web',
      exporte: new Date().toISOString(),
      session,
      cours,
      tentatives,
      evenements: donnees.evenements,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arvx-donnees-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Données exportées', description: 'Ton fichier JSON est téléchargé.' });
  };

  const effacer = () => {
    actions.effacerTout();
    toast({ title: 'Données effacées', description: 'ARVX repart de zéro, sur ton appareil.' });
    naviguer('accueil');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Compte */}
      <section className="rounded-2xl border border-contour bg-white p-5">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-encre text-[18px] font-extrabold text-white">
            {session ? initiales(session.nom, session.email) : 'AR'}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[19px] font-extrabold tracking-tight text-texte">{session?.nom}</h1>
            <p className="truncate text-[12px] text-attenu">{session?.email || 'sans e-mail'}</p>
          </div>
        </div>
        <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-elevation/70 p-3">
          <ShieldCheck size={16} className="mt-0.5 shrink-0 text-succes" />
          <p className="text-[12px] leading-relaxed text-second">
            <span className="font-bold text-texte">Compte local.</span> ARVX n’a pas de serveur de comptes : ton profil
            et tes cours vivent uniquement dans le stockage de cet appareil. Rien n’est envoyé, rien n’est vendu.
          </p>
        </div>
      </section>

      {/* Données */}
      <section className="rounded-2xl border border-contour bg-white p-5">
        <Etiquette>Tes données</Etiquette>
        <div className="mt-3 grid grid-cols-3 gap-2.5">
          {[
            { v: String(cours.length), l: 'cours' },
            { v: String(nbQuestions), l: 'questions' },
            { v: String(tentatives.filter((t) => t.statut === 'termine').length), l: 'examens' },
          ].map((x) => (
            <div key={x.l} className="rounded-xl bg-elevation/70 p-3 text-center">
              <p className="text-[20px] font-extrabold text-encre">{x.v}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-attenu">{x.l}</p>
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          onClick={exporter}
          className="mt-4 h-11 w-full rounded-xl border-contour-fort bg-white text-[13px] font-bold text-encre hover:bg-elevation"
        >
          <Download size={15} className="mr-2" />
          Exporter mes données (JSON)
        </Button>
      </section>

      {/* Session */}
      <section className="rounded-2xl border border-contour bg-white p-5">
        <Etiquette>Session</Etiquette>
        <div className="mt-3 space-y-2">
          <Button
            variant="outline"
            onClick={() => actions.fermerSession()}
            className="h-11 w-full rounded-xl border-contour-fort bg-white text-[13px] font-bold text-second hover:bg-elevation"
          >
            <LogOut size={15} className="mr-2" />
            Se déconnecter
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="h-11 w-full rounded-xl border-erreur/40 bg-white text-[13px] font-bold text-erreur hover:bg-erreur/10">
                <Trash2 size={15} className="mr-2" />
                Effacer toutes les données
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tout effacer ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tous tes cours, tes examens et ta progression seront supprimés de cet appareil — définitivement.
                  Pense à exporter tes données avant.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction className="bg-erreur text-white hover:bg-erreur/90" onClick={effacer}>
                  Tout effacer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>

      {/* À propos */}
      <section className="rounded-2xl border border-contour bg-white p-5 text-center">
        <p className="text-[14px] font-extrabold text-encre">ARVX v1.0.0 — web</p>
        <p className="mt-1 text-[12px] leading-relaxed text-second">
          Écosystème ARVEXA · modèle « apporte ton cours » · moteur d’analyse embarqué, aucun réseau requis.
          <br />
          La version APK de cette même expérience est publiée sur le dépôt GitHub.
        </p>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-[1.2px] text-attenu">
          privé et hors ligne · tes cours restent chez toi
        </p>
      </section>
    </div>
  );
}
