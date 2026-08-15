import type { GameDrift, GameTrophy, NewsFeed } from '../shared/types.ts';
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
  const drifted: GameDrift[] = [];

  for (const game of games) {
    // Sequential on purpose: PSN rate-limits, and each title costs two calls.
    // biome-ignore lint/performance/noAwaitInLoops: throttling is the point
    const { trophies, version } = await trophiesFetch(game);
    const earned = trophies.filter((trophy) => trophy.earned);
    const previous = state[game.id];
    const seen = new Set(previous?.trophies ?? []);

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

      // An empty stored version means the entry predates version tracking.
      // Flagging those would report drift for every game at once, exactly once.
      if (previous?.version && previous.version !== version) {
        drifted.push({
          added: trophies.length - previous.defined,
          gameIconUrl: game.iconUrl,
          gameId: game.id,
          gameName: game.name,
        });
      }
    }

    state[game.id] = {
      defined: trophies.length,
      trophies: earned.map((trophy) => trophy.id),
      version,
    };
  }

  if (commit) await stateSave(state);

  fresh.sort((a, b) => (b.earnedAt ?? '').localeCompare(a.earnedAt ?? ''));
  return { drifted, isBaseline, trophies: fresh };
};
