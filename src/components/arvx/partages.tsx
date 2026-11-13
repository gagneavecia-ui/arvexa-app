'use client';

/**
 * ARVX web — briques partagées du design system « Encre claire ».
 * Référence produit AXIA : surfaces blanches, teintes pastel, étiquettes uppercase.
 */
import React from 'react';
import { MATIERES, MatiereId } from '@/lib/arvx/tokens';

/** Convertit un hex en rgba — pour les teintes pastel des matières. */
export function teinte(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Étiquette uppercase — section titles (AXIA « HOW IT WORKS »). */
export function Etiquette({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-[11px] font-bold uppercase tracking-[1.2px] text-attenu ${className}`}>{children}</p>
  );
}

/** Puce de matière — pastille colorée. */
export function PuceMatiere({ id, petit = false }: { id: MatiereId; petit?: boolean }) {
  const m = MATIERES[id];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${
        petit ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'
      }`}
      style={{ backgroundColor: teinte(m.couleur, 0.12), color: m.couleur }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: m.couleur }} />
      {m.nom}
    </span>
  );
}

/** Barre de progression fine. */
export function BarreProgres({ pct, couleur = 'var(--encre)' }: { pct: number; couleur?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: 'var(--elevation)' }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%`, backgroundColor: couleur }}
      />
    </div>
  );
}

/** Grande carte d'appel — teinte pastel douce (style AXIA). */
export function CarteAppel({
  titre,
  texte,
  action,
  couleur = 'var(--encre)',
  onClick,
}: {
  titre: string;
  texte: string;
  action: string;
  couleur?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group w-full rounded-2xl border p-5 text-left transition-all hover:shadow-[0_8px_28px_-12px_rgba(31,42,68,0.18)] hover:-translate-y-0.5"
      style={{
        background: `linear-gradient(135deg, ${teinte('#FFFFFF', 1)} 0%, ${teinte('#F6F7FB', 1)} 100%)`,
        borderColor: teinte('#1F2A44', 0.1),
        boxShadow: `inset 0 0 0 1px ${teinte('#1F2A44', 0.02)}`,
      }}
    >
      <p className="text-[15px] font-bold text-texte">{titre}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-second">{texte}</p>
      <span
        className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-bold text-white transition-transform group-hover:scale-[1.02]"
        style={{ backgroundColor: couleur }}
      >
        {action}
        <span aria-hidden>→</span>
      </span>
    </button>
  );
}

/** État vide — icône + message + action. */
export function EtatVide({
  emoji,
  titre,
  texte,
  action,
  onClick,
  teinteCarte = 'rgba(47, 163, 107, 0.08)',
}: {
  emoji: string;
  titre: string;
  texte: string;
  action?: string;
  onClick?: () => void;
  teinteCarte?: string;
}) {
  return (
    <div
      className="rounded-2xl border border-dashed p-8 text-center"
      style={{ backgroundColor: teinteCarte, borderColor: teinte('#1F2A44', 0.14) }}
    >
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
        {emoji}
      </div>
      <p className="text-[15px] font-bold text-texte">{titre}</p>
      <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-second">{texte}</p>
      {action && onClick && (
        <button
          onClick={onClick}
          className="mt-4 rounded-xl bg-encre px-5 py-2.5 text-[13px] font-bold text-white transition-transform hover:scale-[1.02]"
        >
          {action}
        </button>
      )}
    </div>
  );
}

/** Logo ARVX — carré encre + point coloré. */
export function Logo({ taille = 'md' }: { taille?: 'sm' | 'md' }) {
  const dim = taille === 'sm' ? 'h-7 w-7 rounded-lg text-[12px]' : 'h-9 w-9 rounded-xl text-[15px]';
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`inline-flex items-center justify-center font-extrabold text-white ${dim}`}
        style={{ backgroundColor: 'var(--encre)', letterSpacing: '0.5px' }}
      >
        A
      </span>
      <span className={`font-extrabold text-encre ${taille === 'sm' ? 'text-[14px]' : 'text-[17px]'}`}>
        ARVX
      </span>
    </span>
  );
}
