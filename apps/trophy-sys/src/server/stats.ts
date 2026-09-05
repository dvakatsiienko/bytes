import type {
  ArchivedTrophy,
  Game,
  RemainingTrophy,
  TrophyArchive,
} from '../shared/types.ts';
import { cached } from './cache.ts';
import type { TrophySet } from './psn.ts';
import { gamesFetch, trophiesFetch } from './psn.ts';
import { isAutoWriteSafe, statsLoad, statsSave } from './state.ts';

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

/**
 * One title's contribution to the archive. Earned trophies always; unearned
 * ones only while the title is still under way, because the charts that read
 * them ask what is left to do and a finished title has nothing left.
 */
const rowsBuild = (game: Game, set: TrophySet) => {
  const trophies: ArchivedTrophy[] = [];
  const remaining: RemainingTrophy[] = [];

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
        ? { current: trophy.progress.current, target: trophy.progress.target }
        : null,
      gameId: game.id,
      grade: trophy.grade,
      name: trophy.name,
      rarity: trophy.rarity,
    });
  }

  return { remaining, trophies };
};

/**
 * What every read of the archive gets: what is stored, brought up to date
 * cheaply.
 *
 * This used to be strictly read-only, and the archive then sat still until
 * somebody pressed sync — a trophy earned an hour ago reached /library in
 * seconds and was missing from /log for days. The delta closes that gap
 * without paying for the full fan-out.
 */
export const statsFetch = async (): Promise<TrophyArchive> => {
  const stored = await statsLoad();
  const archive = stored?.version === ARCHIVE_VERSION ? stored : EMPTY;

  // No archive to update, and no delta while a full scan is mid-flight: that
  // scan is about to replace every row, and its answer has to be the one kept.
  if (!archive.syncedAt || scanInFlight) return archive;

  // A read serves the archive even when PSN does not answer. Failing the whole
  // route because the cheap refresh could not run would make /log worse than it
  // was before the refresh existed.
  return deltaSync(archive).catch(() => archive);
};

/**
 * The cheap refresh, and the reason the sync button is no longer the only way
 * the log moves.
 *
 * The question is "which titles changed since the archive was written", and PSN
 * answers it outright: `lastPlayedAt` is its `lastUpdatedDateTime`, the moment a
 * title's trophy data last moved. The library list carrying it is one call and
 * already cached, so the whole comparison is free and only the titles that
 * actually moved are re-read, at two PSN calls each, rather than all 79.
 *
 * ⚠️ `Date.parse`, never a string compare: PSN sends whole seconds
 * (`2026-09-04T21:24:30Z`) and `syncedAt` carries milliseconds, so within the
 * same second the shorter string sorts *after* the longer one.
 */
const deltaRun = async (archive: TrophyArchive): Promise<TrophyArchive> => {
  if (!archive.syncedAt) return archive;

  const library = await cached('games:800', () => gamesFetch(800));
  const writtenAt = Date.parse(archive.syncedAt);

  const storedRows = new Map<string, number>();
  for (const trophy of archive.trophies)
    storedRows.set(trophy.gameId, (storedRows.get(trophy.gameId) ?? 0) + 1);

  const drifted = library.filter((game) => {
    if (earnedCount(game) === 0) return false;
    if (Date.parse(game.lastPlayedAt) > writtenAt) return true;

    /**
     * The repair clause, and the only reason a count comparison survives here:
     * a title the full scan failed on carries an old timestamp, so the question
     * above answers "nothing changed" and the gap never closes. Its row count
     * still disagrees, which is what pulls it back. Measured on production
     * 2026-09-05: the two signals flagged the same single title and nothing
     * else, so this clause costs no extra fetches in the healthy case.
     */
    return earnedCount(game) !== (storedRows.get(game.id) ?? 0);
  });

  // Past the cap this is not an evening of play, it is an archive that wants a
  // real rebuild — and a fan-out on a page read is the exact cost being avoided
  // here. The sync button still does the whole job.
  if (drifted.length === 0 || drifted.length > DELTA_MAX) return archive;

  const refreshed = await Promise.all(
    drifted.map(async (game) => {
      try {
        return { game, rows: rowsBuild(game, await trophiesFetch(game)) };
      } catch {
        // A title that fails keeps the rows it already has and is retried on
        // the next read. Recording it in `failed` would leave a stale error
        // sitting in the archive long after the title answered again.
        return null;
      }
    }),
  );

  // The shrink guard: a title only gives up its stored rows to rows that
  // actually arrived. PSN answering with an empty set for a title its own
  // library says has earned trophies is a contradiction, not an erasure.
  const replace = refreshed
    .filter((entry) => entry !== null)
    .filter((entry) => entry.rows.trophies.length > 0);

  if (replace.length === 0) return archive;

  const replaced = new Set(replace.map((entry) => entry.game.id));
  const trophies = archive.trophies.filter((row) => !replaced.has(row.gameId));
  const remaining = archive.remaining.filter(
    (row) => !replaced.has(row.gameId),
  );

  for (const entry of replace) {
    trophies.push(...entry.rows.trophies);
    remaining.push(...entry.rows.remaining);
  }

  trophies.sort((a, b) => a.at.localeCompare(b.at));

  /**
   * The stamp moves only when every drifted title was actually replaced, and it
   * is what the next read compares against — so a title that failed or came
   * back empty stays newer than the archive and is picked up again. Stamping
   * regardless would file the gap as healed and forget it until the next time
   * that title was played.
   */
  const healed = replace.length === drifted.length;

  const merged: TrophyArchive = {
    ...archive,
    games: new Set(trophies.map((row) => row.gameId)).size,
    remaining,
    syncedAt: healed ? new Date().toISOString() : archive.syncedAt,
    trophies,
  };

  // Served either way — a local run still gets fresh data, it just refetches it
  // each time the 60s cache lapses rather than persisting to someone else's
  // store.
  if (isAutoWriteSafe) await statsSave(merged);
  return merged;
};

/**
 * More titles than one evening can touch. Past this the drift is staleness, not
 * news, and the full scan is the honest answer.
 */
const DELTA_MAX = 5;

/**
 * One delta at a time, for the same reason the scan has one: `cached` does not
 * dedupe concurrent misses, so two simultaneous reads of a cold key would both
 * fan out and the loser's archive would overwrite the winner's.
 */
let deltaInFlight: Promise<TrophyArchive> | null = null;

const deltaSync = (archive: TrophyArchive): Promise<TrophyArchive> => {
  deltaInFlight ??= deltaRun(archive).finally(() => {
    deltaInFlight = null;
  });

  return deltaInFlight;
};

/**
 * The full fan-out. Titles with nothing earned are skipped outright: they cost
 * two PSN calls each and contribute no rows. A title that throws is recorded
 * rather than aborting the run, because a partial archive still draws every
 * chart.
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
        const rows = rowsBuild(game, await trophiesFetch(game));
        trophies.push(...rows.trophies);
        remaining.push(...rows.remaining);
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
