import type { TrophyGrade } from '../../shared/types.ts';

export const GRADE_COLOR: Record<TrophyGrade, string> = {
  bronze: 'text-bronze',
  gold: 'text-gold',
  platinum: 'text-platinum',
  silver: 'text-silver',
};

export const GRADE_MARK: Record<TrophyGrade, string> = {
  bronze: '●',
  gold: '●',
  platinum: '◆',
  silver: '●',
};

export const dateFormat = (iso: string | null) => {
  if (!iso) return '—';
  return new Date(iso).toISOString().slice(0, 10).replace(/-/g, '.');
};

/** `—` when the playtime name-join found no match for this title. */
export const playtimeFormat = (seconds: number | null) => {
  if (seconds === null) return '—';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
};

/**
 * Platinum is its own finish line. A title with dlc can hold the platinum and
 * still sit at 80%, so completion alone would file it with the abandoned ones.
 */
export const progressTone = (progress: number, hasPlatinum: boolean) => {
  if (progress === 100) return 'text-green';
  return hasPlatinum ? 'text-platinum' : 'text-yellow';
};

export const barRender = (percent: number, width = 20) => {
  const filled = Math.round(
    (Math.min(100, Math.max(0, percent)) / 100) * width,
  );
  return '█'.repeat(filled) + '░'.repeat(width - filled);
};
