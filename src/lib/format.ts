/** Aides de formatage FR — sans Intl (compatibilité Hermes stricte). */

const MOIS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

export function dateCourte(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${d.getDate()} ${MOIS[d.getMonth()]}`;
}

export function dateLongue(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  return `${jours[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]}`;
}

export function dateAjout(iso: string): string {
  return `Ajouté le ${dateCourte(iso)}`;
}

export function ilYA(iso: string, maintenant = Date.now()): string {
  const t = new Date(iso).getTime();
  if (isNaN(t)) return '';
  const diff = Math.max(0, maintenant - t);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min === 1) return 'il y a 1 min';
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h === 1) return 'il y a 1 h';
  if (h < 24) return `il y a ${h} h`;
  const j = Math.floor(h / 24);
  if (j === 1) return 'hier';
  if (j < 30) return `il y a ${j} jours`;
  return dateCourte(iso);
}

/** Chronomètre mm:ss (jusqu'à 99 min). */
export function chrono(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m >= 100) return `${Math.floor(s / 3600)} h ${Math.floor((s % 3600) / 60)} min`;
  return `${m}:${String(r).padStart(2, '0')}`;
}

/** Temps révisé : 1 h 24 min / 43 min / — si nul. */
export function dureeHumaine(sec: number): string {
  if (!sec || sec < 60) return sec > 0 ? '< 1 min' : '—';
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}

export function initiales(nom: string, email: string): string {
  const n = nom.trim();
  if (n.length >= 2) return n.slice(0, 2).toUpperCase();
  if (n.length === 1) return n.toUpperCase();
  const e = email.trim();
  return e ? e.slice(0, 2).toUpperCase() : 'AR';
}

export function uuid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export function melange<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
