import type { Game, TrophyCounts, TrophyGrade } from '../../shared/types.ts';
export const countTotal = (counts: TrophyCounts) =>
  counts.bronze + counts.silver + counts.gold + counts.platinum;
/** Rarest grade last, which is the order every stack and legend reads in. */
export const GRADE_ORDER = [
  'bronze',
  'silver',
  'gold',
  'platinum',
] as const satisfies readonly TrophyGrade[];
export const gameLookup = (games: Game[]) =>
  new Map(games.map((game) => [game.id, game]));
/**
 * The local calendar day an instant falls on. Every date bucket on this route
 * is wall-clock — "what day did you play" is not a UTC question, and the two
 * disagree for every trophy earned after 01:00 local.
 */
export const dayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
/** Sorts ascending and takes the middle value; 0 for an empty list. */
export const median = (values: number[]) => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const low = sorted[middle - 1] ?? 0;
  const high = sorted[middle] ?? 0;
  return sorted.length % 2 === 0 ? (low + high) / 2 : high;
};
