import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Time } from '../art/time.ts';
import type { Settings } from '../src/stage/settings.ts';

export const appRoot = fileURLToPath(new URL('..', import.meta.url));
/** `ATELIER_TAKES_DIR` points a test or a verifier round at a scratch folder, never at the real takes */
const takesRoot = () => process.env.ATELIER_TAKES_DIR ?? join(appRoot, 'takes');

/** the art a bake reads: a change to any of these files changes the hash */
const sourceRoots = ['art', 'src/stage'];

const TAKE_ID = /^\d{2,}-[a-z0-9-]+$/;
export const TAKE_FILES = ['bake.webp', 'piece.svg'] as const;

const readJson = async (path: string): Promise<unknown> =>
  JSON.parse(await readFile(path, 'utf8'));

const writeJson = (path: string, value: unknown) =>
  writeFile(path, `${JSON.stringify(value, null, 2)}\n`);

const listFiles = async (dir: string): Promise<string[]> => {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name));
};

/** sha-256 over every source file of the art, path and content, first 12 hex */
export const sourceHash = async () => {
  const hash = createHash('sha256');
  const files = (
    await Promise.all(sourceRoots.map((dir) => listFiles(join(appRoot, dir))))
  )
    .flat()
    .sort();
  const contents = await Promise.all(files.map((file) => readFile(file)));
  files.forEach((file, index) => {
    hash.update(relative(appRoot, file));
    hash.update(contents[index] ?? '');
  });
  return hash.digest('hex').slice(0, 12);
};

const slugOf = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .split('-')
    .slice(0, 4)
    .join('-');

const readCurrent = async (piece: string): Promise<Current> => {
  try {
    const raw = await readJson(join(takesRoot(), piece, 'current.json'));
    const record =
      typeof raw === 'object' && raw !== null
        ? (raw as Record<string, unknown>)
        : {};
    return {
      day: typeof record.day === 'string' ? record.day : null,
      night: typeof record.night === 'string' ? record.night : null,
    };
  } catch {
    return { day: null, night: null };
  }
};

const takeIds = async (piece: string) => {
  try {
    return (
      (await readdir(join(takesRoot(), piece)))
        .filter((name) => TAKE_ID.test(name))
        // by number: as text, `100-day` sorts before `99-day`
        .sort((a, b) => Number.parseInt(a, 10) - Number.parseInt(b, 10))
    );
  } catch {
    return [];
  }
};

const readTake = async (piece: string, id: string): Promise<Take> => {
  const dir = join(takesRoot(), piece, id);
  const meta = (await readJson(join(dir, 'take.json'))) as Omit<
    Take,
    'id' | 'settings'
  >;
  const settings = (await readJson(join(dir, 'settings.json'))) as Settings;
  return { ...meta, id, settings };
};

/** a take id that exists for this piece, or null: the only way a request reaches the disk */
export const resolveTakeId = async (piece: string, id: string) =>
  TAKE_ID.test(id) && (await takeIds(piece)).includes(id) ? id : null;

export const takeFile = (piece: string, id: string, file: TakeFile) =>
  join(takesRoot(), piece, id, file);

export const listTakes = async (piece: string): Promise<TakeList> => {
  const ids = await takeIds(piece);
  const results = await Promise.allSettled(
    ids.map((id) => readTake(piece, id)),
  );
  const takes = results.flatMap((result, index) => {
    if (result.status === 'fulfilled') return [result.value];
    // one unreadable take (a merge conflict in its json) must not hide the others
    console.warn(
      `atelier: skipped take ${piece}/${ids[index]}: ${String(result.reason)}`,
    );
    return [];
  });
  return { current: await readCurrent(piece), takes: takes.reverse() };
};

/** writes `takes/<piece>/<nn>-<time>[-note]/`; the first take of a time becomes current */
let saving: Promise<unknown> = Promise.resolve();

/** saves run one after another, so two bakes landing together never read the same next number */
export const saveTake = (input: NewTake): Promise<Take> => {
  const run = saving.then(() => writeTake(input));
  saving = run.catch(() => undefined);
  return run;
};

/**
 * Claims the next free number with a plain mkdir, which fails when the folder
 * exists: a take is never written over, even by a second process baking at
 * the same moment.
 */
const claimFolder = async (piece: string, time: Time, note: string) => {
  await mkdir(join(takesRoot(), piece), { recursive: true });
  const last = (await takeIds(piece)).at(-1);
  const first = last ? Number.parseInt(last, 10) + 1 : 1;
  for (let index = first; index < first + 50; index += 1) {
    const id = [String(index).padStart(2, '0'), time, slugOf(note)]
      .filter(Boolean)
      .join('-');
    try {
      // biome-ignore lint/performance/noAwaitInLoops: each attempt depends on the one before failing
      await mkdir(join(takesRoot(), piece, id));
      return id;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
    }
  }
  throw new Error(`no free take number for ${piece} after ${first + 49}`);
};

const writeTake = async (input: NewTake): Promise<Take> => {
  const note = input.note.trim();
  const id = await claimFolder(input.piece, input.time, note);
  const dir = join(takesRoot(), input.piece, id);
  const meta = {
    bakedAt: new Date().toISOString(),
    files: input.svg ? ['bake.webp', 'piece.svg'] : ['bake.webp'],
    note,
    piece: input.piece,
    seed: input.settings.seed,
    sourceHash: await sourceHash(),
    stash: null,
    time: input.time,
  } satisfies Omit<Take, 'id' | 'settings'>;
  await writeFile(join(dir, 'bake.webp'), input.webp);
  if (input.svg) await writeFile(join(dir, 'piece.svg'), input.svg);
  await writeJson(join(dir, 'settings.json'), input.settings);
  await writeJson(join(dir, 'take.json'), meta);
  const current = await readCurrent(input.piece);
  if (!current[input.time])
    await writeJson(join(takesRoot(), input.piece, 'current.json'), {
      ...current,
      [input.time]: id,
    });
  return { ...meta, id, settings: input.settings };
};

export const updateTake = async (
  piece: string,
  id: string,
  patch: TakePatch,
) => {
  const dir = join(takesRoot(), piece, id);
  const meta = (await readJson(join(dir, 'take.json'))) as Record<
    string,
    unknown
  >;
  const next = { ...meta, ...patch };
  await writeJson(join(dir, 'take.json'), next);
  return readTake(piece, id);
};

export const promoteTake = async (piece: string, id: string) => {
  const take = await readTake(piece, id);
  const current = await readCurrent(piece);
  await writeJson(join(takesRoot(), piece, 'current.json'), {
    ...current,
    [take.time]: id,
  });
};

/* Types */

export type TakeFile = (typeof TAKE_FILES)[number];

export interface Stash {
  /** what is good about it */
  good: string;
  /** why it does not fit yet */
  notYet: string;
}

export interface Take {
  bakedAt: string;
  files: TakeFile[];
  id: string;
  note: string;
  piece: string;
  seed: number;
  settings: Settings;
  sourceHash: string;
  stash: Stash | null;
  time: Time;
}

export interface Current {
  day: string | null;
  night: string | null;
}

export interface TakeList {
  current: Current;
  /** newest first */
  takes: Take[];
}

export interface TakePatch {
  note?: string;
  stash?: Stash | null;
}

interface NewTake {
  note: string;
  piece: string;
  settings: Settings;
  svg?: string;
  time: Time;
  webp: Buffer;
}
