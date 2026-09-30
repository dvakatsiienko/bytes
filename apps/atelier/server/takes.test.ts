import { mkdir, mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, expect, test } from 'vitest';

import { defaults } from '../src/stage/settings.ts';
import {
  listTakes,
  promoteTake,
  resolveTakeId,
  saveTake,
  updateTake,
} from './takes.ts';

const webp = Buffer.from('not really a webp');

beforeEach(async () => {
  process.env.ATELIER_TAKES_DIR = await mkdtemp(
    join(tmpdir(), 'atelier-takes-'),
  );
});

const shoot = (time: 'day' | 'night', note = '') =>
  saveTake({
    frames: 1,
    note,
    piece: 'market',
    settings: defaults,
    time,
    webp,
  });

test('a take folder is named by its index, its time and its note', async () => {
  await shoot('day');
  const take = await shoot('night', 'Warmer shop windows!');

  expect(take.id).toBe('02-night-warmer-shop-windows');
});

test('a take folder holds the webp, the settings and the record', async () => {
  const take = await shoot('day');

  const files = await readdir(
    join(process.env.ATELIER_TAKES_DIR ?? '', 'market', take.id),
  );

  expect(files.sort()).toEqual(['settings.json', 'shot.webp', 'take.json']);
});

test('a take saved before bake became shot lists with its image', async () => {
  const dir = join(process.env.ATELIER_TAKES_DIR ?? '', 'market', '01-day');
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'bake.webp'), webp);
  await writeFile(join(dir, 'settings.json'), JSON.stringify(defaults));
  await writeFile(
    join(dir, 'take.json'),
    JSON.stringify({
      bakedAt: '2026-09-25T14:29:12.813Z',
      files: ['bake.webp'],
      frames: 1,
      note: '',
      piece: 'market',
      seed: 1,
      sourceHash: 'abc',
      stash: null,
      time: 'day',
    }),
  );

  const [take] = (await listTakes('market')).takes;

  expect(take?.shotAt).toBe('2026-09-25T14:29:12.813Z');
  expect(take?.files).toEqual(['shot.webp']);
  expect(await readFile(join(dir, 'shot.webp'))).toEqual(webp);
});

test('the first take of a time becomes its current take', async () => {
  const first = await shoot('day');
  await shoot('day');

  expect((await listTakes('market')).current.day).toBe(first.id);
});

test('promote makes a take the current one for its time', async () => {
  await shoot('day');
  const second = await shoot('day');

  await promoteTake('market', second.id);

  expect((await listTakes('market')).current.day).toBe(second.id);
});

test('a stash keeps both reasons', async () => {
  const take = await shoot('night');

  const stashed = await updateTake('market', take.id, {
    stash: { good: 'the glow', notYet: 'too dark for a readme' },
  });

  expect(stashed.stash).toEqual({
    good: 'the glow',
    notYet: 'too dark for a readme',
  });
});

test('a take id that climbs out of the folder resolves to nothing', async () => {
  await shoot('day');

  expect(await resolveTakeId('market', '../../package.json')).toBeNull();
});

test('the takes list is newest first', async () => {
  await shoot('day');
  await shoot('night');

  expect((await listTakes('market')).takes.map((take) => take.id)).toEqual([
    '02-night',
    '01-day',
  ]);
});

test('the take after 99 is 100, not a second 100', async () => {
  for (let index = 0; index < 101; index += 1) {
    // biome-ignore lint/performance/noAwaitInLoops: each take's number depends on the one before
    await shoot('day');
  }

  const ids = (await listTakes('market')).takes.map((take) => take.id);

  expect(ids.slice(0, 2)).toEqual(['101-day', '100-day']);
});

test('a take whose record does not parse is left out, the rest still list', async () => {
  const good = await shoot('day');
  const broken = await shoot('night');
  await writeFile(
    join(process.env.ATELIER_TAKES_DIR ?? '', 'market', broken.id, 'take.json'),
    '<<<<<<< HEAD',
  );

  expect((await listTakes('market')).takes.map((take) => take.id)).toEqual([
    good.id,
  ]);
});

test('two takes saved at the same moment get two folders', async () => {
  const [a, b] = await Promise.all([shoot('day'), shoot('day')]);

  expect(a.id).not.toBe(b.id);
});
