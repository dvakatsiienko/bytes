import type { AlmostFeed, GameTrophy } from '../shared/types.ts';
import { gamesFetch, trophiesFetch } from './psn.ts';

const SCAN_LIMIT = 30;

/**
 * Every unearned trophy you have started but not finished, across the library,
 * ranked by how close it is. Only PS5 titles report incremental progress, and
 * only unfinished ones can contribute, so both are filtered out before the
 * scan — each surviving title still costs two PSN calls.
 */
export const almostFetch = async (): Promise<AlmostFeed> => {
  const games = (await gamesFetch(SCAN_LIMIT)).filter(
    (game) => game.platform.includes('PS5') && game.progress < 100,
  );

  const trophies: GameTrophy[] = [];

  for (const game of games) {
    // Sequential on purpose: PSN rate-limits, and each title costs two calls.
    // biome-ignore lint/performance/noAwaitInLoops: throttling is the point
    const set = await trophiesFetch(game);

    for (const trophy of set) {
      if (trophy.earned || !trophy.progress || trophy.progress.current === 0)
        continue;

      trophies.push({
        ...trophy,
        gameIconUrl: game.iconUrl,
        gameId: game.id,
        gameName: game.name,
      });
    }
  }

  trophies.sort((a, b) => (b.progress?.rate ?? 0) - (a.progress?.rate ?? 0));
  return { scanned: games.length, trophies };
};
