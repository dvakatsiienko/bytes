import type { ArchivedTrophy, Game, TrophyArchive } from '../shared/types.ts';
import { cached } from './cache.ts';
import { gamesFetch, trophiesFetch } from './psn.ts';
import { statsLoad, statsSave } from './state.ts';

/** PSN is rate-limited, so this many titles are read at once and no more. */
const LANES = 5;

const EMPTY: TrophyArchive = {
  failed: [],
  games: 0,
  syncedAt: null,
  trophies: [],
};

const earnedCount = (game: Game) =>
  game.earned.bronze +
  game.earned.silver +
  game.earned.gold +
  game.earned.platinum;

/** Read-only, like /api/news — reading the charts never triggers a scan. */
export const statsFetch = async (): Promise<TrophyArchive> =>
  (await statsLoad()) ?? EMPTY;

/**
 * The fan-out. Titles with nothing earned are skipped outright: they cost two
 * PSN calls each and contribute no rows. A title that throws is recorded rather
 * than aborting the run, because a partial archive still draws every chart.
 */
export const statsSync = async (): Promise<TrophyArchive> => {
  const library = await cached('games:800', () => gamesFetch(800));
  const games = library.filter((game) => earnedCount(game) > 0);

  const trophies: ArchivedTrophy[] = [];
  const failed: string[] = [];
  let cursor = 0;

  const lane = async () => {
    while (cursor < games.length) {
      const game = games[cursor];
      cursor += 1;
      if (!game) return;

      try {
        // Promise.all over the library would open ~216 PSN calls at once.
        // biome-ignore lint/performance/noAwaitInLoops: the sequencing is the rate limit
        const set = await trophiesFetch(game);

        for (const trophy of set.trophies) {
          if (!(trophy.earned && trophy.earnedAt)) continue;

          trophies.push({
            at: trophy.earnedAt,
            gameId: game.id,
            grade: trophy.grade,
            rarity: trophy.rarity,
          });
        }
      } catch {
        failed.push(game.id);
      }
    }
  };

  // A worker pool, not chunks: chunking stalls on the slowest title in each
  // batch of five, this keeps all five lanes busy until the library runs out.
  await Promise.all(Array.from({ length: LANES }, lane));

  // Overwriting a good archive with nothing is the one unrecoverable outcome
  // here, so a run that read no trophies at all fails instead of saving.
  if (games.length && trophies.length === 0)
    throw new Error(
      `read no trophies from ${games.length} titles — the archive is left alone`,
    );

  trophies.sort((a, b) => a.at.localeCompare(b.at));

  const archive: TrophyArchive = {
    failed,
    games: games.length - failed.length,
    syncedAt: new Date().toISOString(),
    trophies,
  };

  await statsSave(archive);
  return archive;
};
