import type {
  ArchivedTrophy,
  Game,
  RemainingTrophy,
  TrophyArchive,
} from '../shared/types.ts';
import { cached } from './cache.ts';
import { gamesFetch, trophiesFetch } from './psn.ts';
import { statsLoad, statsSave } from './state.ts';

/** PSN is rate-limited, so this many titles are read at once and no more. */
const LANES = 5;

/**
 * Bumped whenever the stored shape changes in a way that makes an old archive
 * actively wrong. Purely additive optional fields do not qualify — `detail` and
 * `iconUrl` arrived without a bump, because an archive lacking them still draws
 * every chart and the log simply shows no icon until the next scan. Blanking
 * the route would have been the more disruptive answer, not the safer one.
 */
export const ARCHIVE_VERSION = 2;

const EMPTY: TrophyArchive = {
  failed: [],
  games: 0,
  remaining: [],
  syncedAt: null,
  trophies: [],
  version: ARCHIVE_VERSION,
};

const earnedCount = (game: Game) =>
  game.earned.bronze +
  game.earned.silver +
  game.earned.gold +
  game.earned.platinum;

/** Read-only, like /api/news — reading the charts never triggers a scan. */
export const statsFetch = async (): Promise<TrophyArchive> => {
  const stored = await statsLoad();
  return stored?.version === ARCHIVE_VERSION ? stored : EMPTY;
};

/**
 * The fan-out. Titles with nothing earned are skipped outright: they cost two
 * PSN calls each and contribute no rows. A title that throws is recorded rather
 * than aborting the run, because a partial archive still draws every chart.
 *
 * Unearned trophies are kept only for titles still under way — the charts that
 * read them ask what is left to do, and a finished title has nothing left.
 */
const scanRun = async (): Promise<TrophyArchive> => {
  const library = await cached('games:800', () => gamesFetch(800));
  const games = library.filter((game) => earnedCount(game) > 0);

  const trophies: ArchivedTrophy[] = [];
  const remaining: RemainingTrophy[] = [];
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
          if (trophy.earned && trophy.earnedAt) {
            trophies.push({
              at: trophy.earnedAt,
              detail: trophy.detail,
              gameId: game.id,
              grade: trophy.grade,
              iconUrl: trophy.iconUrl,
              name: trophy.name,
              rarity: trophy.rarity,
            });
            continue;
          }

          if (trophy.earned || game.progress === 100) continue;

          remaining.push({
            counter: trophy.progress
              ? {
                  current: trophy.progress.current,
                  target: trophy.progress.target,
                }
              : null,
            gameId: game.id,
            grade: trophy.grade,
            name: trophy.name,
            rarity: trophy.rarity,
          });
        }
      } catch (error) {
        // The reason travels with the id: a run that lost 14 titles used to
        // report 14 ids and nothing about why, so diagnosing meant re-running
        // the whole fan-out.
        const reason = error instanceof Error ? error.message : String(error);
        failed.push(`${game.id}: ${reason}`);
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
    remaining,
    syncedAt: new Date().toISOString(),
    trophies,
    version: ARCHIVE_VERSION,
  };

  await statsSave(archive);
  return archive;
};

/**
 * One scan at a time per instance. The rescan button disables itself while a
 * sync runs, but a second tab does not know that — and two overlapping runs
 * would spend the whole fan-out twice and let the loser's archive win.
 *
 * 📌 In-process only. Two serverless instances can still overlap; that needs a
 * lock in the shared store, which is worth it only once something other than a
 * human button can start a scan.
 */
let scanInFlight: Promise<TrophyArchive> | null = null;

export const statsSync = (): Promise<TrophyArchive> => {
  scanInFlight ??= scanRun().finally(() => {
    scanInFlight = null;
  });

  return scanInFlight;
};
