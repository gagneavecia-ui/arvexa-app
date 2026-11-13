'use client';

/** ARVX — menu latéral conservé (les futures fonctions s'y ajouteront). */
import React from 'react';
import { useStore } from '@/lib/arvx/store';
import { initiales } from '@/lib/arvx/format';
import { Logo, Etiquette } from '@/components/arvx/partages';
import { BarChart3, BookOpen, Home, LogOut, User, ClipboardList } from 'lucide-react';

const ENTREES = [
  { vue: 'accueil', nom: 'Accueil', icone: Home, desc: 'Ta journée, en un coup d’œil' },
  { vue: 'reviser', nom: 'Réviser', icone: BookOpen, desc: 'Tes cours, pas à pas' },
  { vue: 'examens', nom: 'Examens', icone: ClipboardList, desc: 'Des tests faits de tes cours' },
  { vue: 'progression', nom: 'Progression', icone: BarChart3, desc: 'Ce que tu maîtrises vraiment' },
  { vue: 'profil', nom: 'Profil', icone: User, desc: 'Compte et données' },
];

export function MenuLateral({
  naviguer,
  vue,
}: {
  naviguer: (chemin: string) => void;
  vue: string;
}) {
  const { donnees, actions } = useStore();
  const session = donnees.session;

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-contour px-5 py-4">
        <Logo />
        <p className="mt-1 text-[11px] font-semibold text-attenu">Écosystème ARVEXA</p>
      </div>

      <div className="flex-1 overflow-y-auto sc-arvx px-3 py-4">
        <Etiquette className="px-2 pb-2">Navigation</Etiquette>
        <div className="space-y-1">
          {ENTREES.map((e) => {
            const actif = vue === e.vue || (vue === 'nouveau' && e.vue === 'reviser') || (vue === 'matiere' && e.vue === 'reviser') || (vue === 'cours' && e.vue === 'reviser') || (vue === 'examen' && e.vue === 'examens') || (vue === 'resultats' && e.vue === 'examens');
            const Icone = e.icone;
            return (
              <button
                key={e.vue}
                onClick={() => naviguer(e.vue)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  actif ? 'bg-elevation' : 'hover:bg-elevation/60'
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    actif ? 'bg-encre text-white' : 'bg-elevation text-second'
                  }`}
                >
                  <Icone className="h-4.5 w-4.5" size={17} />
                </span>
                <span className="flex-1">
                  <span className={`block text-[13px] font-bold ${actif ? 'text-encre' : 'text-texte'}`}>
                    {e.nom}
                  </span>
                  <span className="block text-[11px] text-attenu">{e.desc}</span>
                </span>
              </button>
            );
          })}
        </div>

        <Etiquette className="px-2 pb-2 pt-6">À venir</Etiquette>
        <div className="space-y-1">
          {['Mode focus (minuteur)', 'Flashcards', 'Mode aninka'].map((f) => (
            <div key={f} className="flex items-center gap-3 rounded-xl px-3 py-2.5 opacity-55">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-dashed border-contour-fort text-attenu">
                ✦
              </span>
              <span>
                <span className="block text-[13px] font-bold text-second">{f}</span>
                <span className="block text-[11px] text-attenu">prochaine version</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-contour p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-encre text-[13px] font-extrabold text-white">
            {session ? initiales(session.nom, session.email) : 'AR'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-bold text-texte">{session?.nom}</p>
            <p className="truncate text-[11px] text-attenu">{session?.email || 'sans e-mail'}</p>
          </div>
          <button
            onClick={() => actions.fermerSession()}
            className="rounded-lg p-2 text-attenu transition-colors hover:bg-erreur/10 hover:text-erreur"
            aria-label="Se déconnecter"
          >
            <LogOut size={16} />
          </button>
        </div>
        <p className="mt-3 text-center text-[10px] font-semibold text-attenu">
          ARVX v1.0.0 · tes cours restent sur ton appareil
        </p>
      </div>
    </div>
  );
}
