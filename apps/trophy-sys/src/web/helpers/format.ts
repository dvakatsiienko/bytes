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

/**
 * Shown wherever playtimeFormat returns its dash, so the gap reads as a known
 * limit rather than a zero or a defect.
 */
export const PLAYTIME_MISSING_HINT =
  'No playtime — PSN serves it from a separate endpoint, joined to trophies by name, and this name found no match.';

/** `—` when the playtime name-join found no match for this title. */
export const playtimeFormat = (seconds: number | null) => {
  if (seconds === null) return '—';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
};

/** Coarser than playtimeFormat, and in hours — what an axis and a dot want. */
export const hoursFormat = (hours: number) =>
  hours < 1 ? `${Math.round(hours * 60)}m` : `${Math.round(hours)}h`;

/**
 * Two colours only. Platinum is carried by the ◆ beside the title — a metre
 * cannot answer "how far along" and "did you platinum" at once, and the
 * three-colour version had to be explained to be read.
 */
export const progressTone = (progress: number) =>
  progress === 100 ? 'text-green' : 'text-yellow';

export const barRender = (percent: number, width = 20) => {
  const filled = Math.round(
    (Math.min(100, Math.max(0, percent)) / 100) * width,
  );
  return '█'.repeat(filled) + '░'.repeat(width - filled);
};
