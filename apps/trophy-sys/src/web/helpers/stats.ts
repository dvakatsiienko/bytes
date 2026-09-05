import type {
  ArchivedTrophy,
  Game,
  TrophyCounts,
  TrophyGrade,
} from '../../shared/types.ts';
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

/**
 * 🕔 The gaming day ends at 05:00 local, not at midnight.
 *
 * The trick, and the number: subtract five hours before reading the date, so
 * everything earned before 05:00 counts towards the evening it came from. An
 * evening that runs 22:00 → 00:38 is one sitting to the person who played it,
 * and a midnight boundary filed half of it under the next day's header.
 *
 * 📌 The split, and it is deliberate. On this key: /log, and `trophyStreaks` —
 * both answer "how many days did you play", where a 22:00 → 02:00 session is
 * one. On plain `dayKey`: the contribution heatmap, because a square in a
 * calendar grid is a claim about the calendar and moving it would put a trophy
 * on a date its own timestamp denies.
 */
export const gamingDayKey = (date: Date) =>
  dayKey(new Date(date.getTime() - DAY_ROLLOVER_HOURS * 60 * 60 * 1000));

/** Exported so the page's own copy states the same hour the buckets use. */
export const DAY_ROLLOVER_HOURS = 5;
/**
 * Newest first, and on an identical instant the higher grade first.
 *
 * 📌 The tie is not an edge case, it is the rule: PSN stamps a platinum at the
 * same second as the trophy that triggered it, and every one of the 34
 * platinums in this archive shares its timestamp — not one pops alone. So equal
 * instants need an order, and only one reads correctly: the closing trophy is
 * the last thing that happened, which puts it at the top of a newest-first
 * list. The same holds a grade down, where a silver "did it well" trophy fires
 * off the bronze that completed the task.
 *
 * `Array.sort` is stable, so anything still tied keeps the archive's own order.
 */
export const trophyOrder = (a: ArchivedTrophy, b: ArchivedTrophy) =>
  b.at.localeCompare(a.at) || GRADE_RANK[b.grade] - GRADE_RANK[a.grade];

const GRADE_RANK: Record<TrophyGrade, number> = {
  bronze: 0,
  gold: 2,
  platinum: 3,
  silver: 1,
};

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
