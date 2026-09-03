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

/**
 * A title with no matched playtime has no place on an hours axis, and a log
 * scale cannot hold a zero, so both are dropped rather than parked at 1.
 */
export const effortPoints = (games: Game[]): EffortPoint[] =>
  games
    .filter((game) => (game.playSeconds ?? 0) > 0)
    .map((game) => {
      const earned = countTotal(game.earned);
      const hours = (game.playSeconds ?? 0) / 3600;

      return {
        earned,
        gameId: game.id,
        hasPlatinum: game.earned.platinum > 0,
        hours,
        iconUrl: game.iconUrl,
        name: game.name,
        perTrophy: earned ? hours / earned : 0,
        progress: game.progress,
        trophies: countTotal(game.defined),
      };
    })
    // Big dots drawn first, so a small one is never buried under a large one.
    .sort((a, b) => b.trophies - a.trophies);

/**
 * Bucketed in the *browser's* local time, not UTC. The question the ring
 * answers is "what time do you play", which is a wall-clock question — the
 * archive stores instants precisely so this stays a display decision.
 */
export const circadianHours = (
  trophies: ArchivedTrophy[],
  games: Game[],
): CircadianHour[] => {
  const nameById = new Map(games.map((game) => [game.id, game.name]));
  const buckets = Array.from({ length: 24 }, () => ({
    count: 0,
    perGame: new Map<string, number>(),
  }));

  for (const trophy of trophies) {
    const bucket = buckets[new Date(trophy.at).getHours()];
    if (!bucket) continue;

    bucket.count += 1;
    bucket.perGame.set(
      trophy.gameId,
      (bucket.perGame.get(trophy.gameId) ?? 0) + 1,
    );
  }

  return buckets.map((bucket, hour) => {
    let topId: string | null = null;
    let topCount = 0;

    for (const [gameId, count] of bucket.perGame)
      if (count > topCount) {
        topCount = count;
        topId = gameId;
      }

    return {
      count: bucket.count,
      hour,
      share: trophies.length ? (bucket.count / trophies.length) * 100 : 0,
      topGame: topId ? (nameById.get(topId) ?? null) : null,
    };
  });
};

const hourFormat = (hour: number) => `${String(hour).padStart(2, '0')}:00`;

/** The span a spoke covers, which is what its tooltip and table row name. */
export const hourRangeFormat = (hour: CircadianHour) =>
  `${hourFormat(hour.hour)}–${hourFormat((hour.hour + 1) % 24)}`;

/* Types */
export interface EffortPoint {
  earned: number;
  gameId: string;
  hasPlatinum: boolean;
  hours: number;
  iconUrl: string;
  name: string;
  /** Hours spent per trophy actually earned — the grind rate. */
  perTrophy: number;
  progress: number;
  /** Trophies the title defines, which is what the dot size encodes. */
  trophies: number;
}

export interface CircadianHour {
  count: number;
  hour: number;
  /** Percent of all earned trophies. */
  share: number;
  topGame: string | null;
}
