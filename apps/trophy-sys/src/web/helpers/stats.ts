import type { ArchivedTrophy, Game, TrophyCounts } from '../../shared/types.ts';

const countTotal = (counts: TrophyCounts) =>
  counts.bronze + counts.silver + counts.gold + counts.platinum;

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
