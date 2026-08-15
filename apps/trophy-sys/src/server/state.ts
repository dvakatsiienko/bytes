import { readFileSync, writeFileSync } from 'node:fs';

const STATE_FILE = new URL('../../.trophy-state.json', import.meta.url);

/** Serverless filesystems are read-only — the baseline only persists locally. */
export const isStateWritable = !process.env.VERCEL;

export type TrophyState = Record<string, number[]>;

export const stateLoad = (): TrophyState => {
  try {
    return JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
  } catch {
    return {};
  }
};

export const stateSave = (state: TrophyState) => {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
};
