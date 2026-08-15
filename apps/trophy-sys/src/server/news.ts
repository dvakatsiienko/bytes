import type { GameTrophy, NewsFeed } from '../shared/types.ts';
import { gamesFetch, trophiesFetch } from './psn.ts';
import { stateLoad, stateSave } from './state.ts';

const SCAN_LIMIT = 15;

export const newsFetch = async ({
  commit,
}: {
  commit: boolean;
}): Promise<NewsFeed> => {
  const state = await stateLoad();
  const isBaseline = Object.keys(state).length === 0;
  const games = await gamesFetch(SCAN_LIMIT);
  const fresh: GameTrophy[] = [];

  for (const game of games) {
    // Sequential on purpose: PSN rate-limits, and each title costs two calls.
    // biome-ignore lint/performance/noAwaitInLoops: throttling is the point
    const trophies = await trophiesFetch(game);
    const earned = trophies.filter((trophy) => trophy.earned);
    const seen = new Set(state[game.id] ?? []);

    if (!isBaseline) {
      for (const trophy of earned.filter(
        (candidate) => !seen.has(candidate.id),
      )) {
        fresh.push({
          ...trophy,
          gameIconUrl: game.iconUrl,
          gameId: game.id,
          gameName: game.name,
        });
      }
    }

    state[game.id] = earned.map((trophy) => trophy.id);
  }

  if (commit) await stateSave(state);

  fresh.sort((a, b) => (b.earnedAt ?? '').localeCompare(a.earnedAt ?? ''));
  return { isBaseline, trophies: fresh };
};
