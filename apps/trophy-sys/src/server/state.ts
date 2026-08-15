import { readFileSync, writeFileSync } from 'node:fs';
import { Redis } from '@upstash/redis';

const STATE_FILE = new URL('../../.trophy-state.json', import.meta.url);
const STATE_KEY = 'trophy-sys:baseline';

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

export const stateLoad = async (): Promise<TrophyState> => {
  if (redis)
    return stateMigrate(
      (await redis.get<Record<string, GameBaseline | number[]>>(STATE_KEY)) ??
        {},
    );

  try {
    return stateMigrate(JSON.parse(readFileSync(STATE_FILE, 'utf-8')));
  } catch {
    return {};
  }
};

export const stateSave = async (state: TrophyState) => {
  if (redis) {
    await redis.set(STATE_KEY, state);
    return;
  }

  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
};
