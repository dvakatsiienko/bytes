import { readFileSync, writeFileSync } from 'node:fs';
import { Redis } from '@upstash/redis';

import type { TrophyArchive } from '../shared/types.ts';

const STATE_FILE = new URL('../../.trophy-state.json', import.meta.url);
const STATE_KEY = 'trophy-sys:baseline';

const STATS_FILE = new URL('../../.trophy-stats.json', import.meta.url);
const STATS_KEY = 'trophy-sys:stats';

export interface GameBaseline {
  defined: number;
  trophies: number[];
  version: string;
}

export type TrophyState = Record<string, GameBaseline>;

/**
 * The baseline lives in Upstash when the KV credentials are present, and in a
 * local JSON file otherwise. Serverless filesystems are read-only, so the file
 * alone cannot work in production; the fallback keeps `pnpm dev` and the CLI
 * usable with no network store attached.
 */
const redis =
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
    ? new Redis({
        token: process.env.KV_REST_API_TOKEN,
        url: process.env.KV_REST_API_URL,
      })
    : null;

export const stateBackend = redis ? 'kv' : 'file';

/**
 * The file backend cannot write on a serverless host. Callers check this before
 * starting work, so a misconfigured deploy fails immediately instead of running
 * the whole PSN scan and then dying on EROFS.
 */
export const isStateWritable = stateBackend === 'kv' || !process.env.VERCEL;

/**
 * The baseline used to be a bare array of earned trophy ids per game. Entries
 * in that shape are widened here, with an empty version so the first read after
 * the upgrade reports no drift rather than flagging every game at once.
 */
const stateMigrate = (
  raw: Record<string, GameBaseline | number[]>,
): TrophyState =>
  Object.fromEntries(
    Object.entries(raw).map(([gameId, entry]) => [
      gameId,
      Array.isArray(entry)
        ? { defined: 0, trophies: entry, version: '' }
        : entry,
    ]),
  );

/**
 * Absent and unreadable are different answers. A missing file is a legitimate
 * empty — first run, or a fresh checkout. Damaged JSON is not: swallowing it
 * would report an empty baseline, which reads as seed mode, and the next save
 * would overwrite the very data that failed to parse.
 */
const storeRead = async <T>(key: string, file: URL): Promise<T | null> => {
  if (redis) return (await redis.get<T>(key)) ?? null;

  let raw: string;
  try {
    raw = readFileSync(file, 'utf-8');
  } catch {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    throw new Error(
      `${file.pathname} holds invalid JSON — refusing to treat a damaged store as empty`,
      { cause: error },
    );
  }
};

const storeWrite = async (key: string, file: URL, value: unknown) => {
  if (redis) {
    await redis.set(key, value);
    return;
  }

  writeFileSync(file, JSON.stringify(value, null, 2));
};

export const stateLoad = async (): Promise<TrophyState> =>
  stateMigrate(
    (await storeRead<Record<string, GameBaseline | number[]>>(
      STATE_KEY,
      STATE_FILE,
    )) ?? {},
  );

export const stateSave = (state: TrophyState) =>
  storeWrite(STATE_KEY, STATE_FILE, state);

/**
 * The trophy fan-out's output, written only by an explicit sync. Separate key
 * from the baseline: the baseline answers "what is new", this answers "what has
 * ever been earned, and when", and a snapshot must never disturb the second.
 */
export const statsLoad = () => storeRead<TrophyArchive>(STATS_KEY, STATS_FILE);

export const statsSave = (archive: TrophyArchive) =>
  storeWrite(STATS_KEY, STATS_FILE, archive);
