import type { TrophyGrade } from '../../shared/types.ts';
import { dayKey } from './stats.ts';

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

/**
 * An instant as `YYYY.MM.DD`, on the local calendar.
 *
 * 📌 Local getters, never `toISOString()`: that formats in UTC, so a trophy
 * earned at 23:40 in any zone ahead of Greenwich printed as the next day.
 * `dayKey` already answers "which local day is this", so this is that answer
 * with the separator swapped.
 *
 * ⚠️ It takes an **instant**, never a bare `YYYY-MM-DD`. A plain date string
 * parses as UTC midnight, which is the previous day everywhere west of
 * Greenwich — a caller already holding a day key must print it directly rather
 * than send it back through a Date.
 */
export const dateFormat = (iso: string | null) =>
  iso ? dayKey(new Date(iso)).replace(/-/g, '.') : '—';

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
