import { readFileSync, writeFileSync } from 'node:fs';
import { Redis } from '@upstash/redis';

import type { NpssoStatus, Settings, TrophyArchive } from '../shared/types.ts';
import { SETTINGS_DEFAULT } from '../shared/types.ts';

const STATE_FILE = new URL('../../.trophy-state.json', import.meta.url);
const STATE_KEY = 'trophy-sys:baseline';

const STATS_FILE = new URL('../../.trophy-stats.json', import.meta.url);
const STATS_KEY = 'trophy-sys:stats';

const HIDDEN_FILE = new URL('../../.trophy-hidden.json', import.meta.url);
const HIDDEN_KEY = 'trophy-sys:hidden';

const NPSSO_FILE = new URL('../../.trophy-npsso.json', import.meta.url);
const NPSSO_KEY = 'trophy-sys:npsso';

const SETTINGS_FILE = new URL('../../.trophy-settings.json', import.meta.url);
const SETTINGS_KEY = 'trophy-sys:settings';

const STEAM_NAMES_FILE = new URL('../../.steam-names.json', import.meta.url);
const STEAM_NAMES_KEY = 'trophy-sys:steam-names';

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
 * Whether a write **nobody asked for** may persist.
 *
 * ⚠️ `/api/stats` refreshes the archive as a side effect of being read, and a
 * dev machine loads `.env.local`, whose KV credentials point at the *shared
 * production* store. Without this guard, opening the page on localhost rewrites
 * production — measured 2026-09-05, when a local `pnpm dev` moved the live
 * archive from 2122 rows to 2126 with nobody pressing anything.
 *
 * True only when the process and the store belong together: Vercel writing KV,
 * or a local run writing its own file. Explicit writes — the sync button, the
 * snapshot — still go wherever the credentials point, because that is the thing
 * they were asked to do.
 */
export const isAutoWriteSafe = process.env.VERCEL
  ? stateBackend === 'kv'
  : stateBackend === 'file';

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

/**
 * The ids the owner has hidden from the public library. Its own key: a
 * snapshot, a stats sync or a baseline write must never disturb it.
 */
export const hiddenLoad = async (): Promise<string[]> =>
  (await storeRead<string[]>(HIDDEN_KEY, HIDDEN_FILE)) ?? [];

export const hiddenSave = (ids: string[]) =>
  storeWrite(HIDDEN_KEY, HIDDEN_FILE, ids);

/**
 * The NPSSO pasted through the admin page, which outranks the env var — the
 * token expires and a redeploy is a poor way to renew it.
 *
 * Stored as a record rather than a bare string so the app can measure how long
 * a token actually lasts. Sony publishes no lifetime; the one figure this repo
 * has is an upper bound of 25 days, from a token set 2026-08-16 and found dead
 * 2026-09-10. Each renewal adds a real sample.
 */
interface NpssoRecord {
  /** When PSN first rejected it. Null while the token still works. */
  diedAt: number | null;
  /** Observed lifetimes in ms, oldest first — one per token that has died. */
  lifetimes: number[];
  savedAt: number;
  token: string;
}

/** Tolerates the bare string written before the record shape existed. */
const npssoRecordLoad = async (): Promise<NpssoRecord | null> => {
  const stored = await storeRead<NpssoRecord | string>(NPSSO_KEY, NPSSO_FILE);
  if (!stored) return null;
  if (typeof stored === 'string')
    return { diedAt: null, lifetimes: [], savedAt: 0, token: stored };

  return stored;
};

export const npssoLoad = async () => (await npssoRecordLoad())?.token ?? null;

export const npssoSave = async (npsso: string) => {
  const previous = await npssoRecordLoad();

  // A replaced token that had already died contributes its measured lifetime.
  // A replaced token still alive contributes nothing: it was retired early, so
  // its age is a floor, not a lifetime, and mixing the two poisons the average.
  const lifetimes = [...(previous?.lifetimes ?? [])];
  if (previous?.savedAt && previous.diedAt)
    lifetimes.push(previous.diedAt - previous.savedAt);

  await storeWrite(NPSSO_KEY, NPSSO_FILE, {
    diedAt: null,
    lifetimes,
    savedAt: Date.now(),
    token: npsso,
  } satisfies NpssoRecord);
};

/**
 * Stamps the moment PSN first refused the stored token. Idempotent: every
 * failing call reaches this, and only the first one records anything.
 */
export const npssoDeathRecord = async () => {
  const record = await npssoRecordLoad();
  if (!record || record.diedAt) return;

  await storeWrite(NPSSO_KEY, NPSSO_FILE, {
    ...record,
    diedAt: Date.now(),
  } satisfies NpssoRecord);
};

export const npssoStatusLoad = async (): Promise<NpssoStatus> => {
  const record = await npssoRecordLoad();
  if (!record)
    return {
      diedAt: null,
      lifetimes: [],
      savedAt: null,
      source: process.env.NPSSO ? 'env' : 'none',
    };

  return {
    diedAt: record.diedAt,
    lifetimes: record.lifetimes,
    // 0 is the bare-string record: a token from before this was measured.
    savedAt: record.savedAt || null,
    source: 'store',
  };
};

/**
 * Spread over the defaults rather than returned raw, so a setting added later
 * reads as its default against a store written before it existed.
 */
export const settingsLoad = async (): Promise<Settings> => ({
  ...SETTINGS_DEFAULT,
  ...(await storeRead<Partial<Settings>>(SETTINGS_KEY, SETTINGS_FILE)),
});

export const settingsSave = (settings: Settings) =>
  storeWrite(SETTINGS_KEY, SETTINGS_FILE, settings);

/** appid → store name. */
export type SteamNames = Record<string, string>;

/**
 * Steam's wishlist endpoint returns bare appids, and the only name source is
 * one store call per id. A game's name does not change, so this map is grown
 * rather than refreshed: 70 calls happen once, and every later run is free.
 */
export const steamNamesLoad = async (): Promise<SteamNames> =>
  (await storeRead<SteamNames>(STEAM_NAMES_KEY, STEAM_NAMES_FILE)) ?? {};

export const steamNamesSave = (names: SteamNames) =>
  storeWrite(STEAM_NAMES_KEY, STEAM_NAMES_FILE, names);
