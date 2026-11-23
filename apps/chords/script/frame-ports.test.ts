import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, expect, it } from 'vitest';

import { readFramePorts } from './frame-ports.ts';

const fourDigits = /\d{4}/u;
let hotkeys: string;
let daemon: string;

beforeEach(() => {
  hotkeys = mkdtempSync(join(tmpdir(), 'chords-ports-'));
  daemon = join(hotkeys, 'live.ts');
  writeFileSync(daemon, '');
});

afterEach(() => {
  rmSync(hotkeys, { recursive: true });
});

const writePorts = (text: string) =>
  writeFileSync(join(hotkeys, 'ports.ts'), text);

it('reads the pair beside the daemon', async () => {
  writePorts(
    'export const chordsPort = 7901; export const chordsDevPort = 7902;',
  );

  expect(await readFramePorts(daemon)).toEqual({
    chordsDevPort: 7902,
    chordsPort: 7901,
  });
});

it('says which file is missing', async () => {
  await expect(readFramePorts(daemon)).rejects.toThrow(
    `no ports.ts beside ${daemon}`,
  );
  await expect(readFramePorts(join(hotkeys, 'gone.ts'))).rejects.toThrow(
    `no daemon at ${join(hotkeys, 'gone.ts')}`,
  );
});

it.each([
  ['a missing port', 'export const chordsPort = 7901;'],
  [
    'a port that is not a number',
    'export const chordsPort = Number("x"); export const chordsDevPort = 7902;',
  ],
  [
    'a port out of range',
    'export const chordsPort = 7901; export const chordsDevPort = 70000;',
  ],
])('refuses %s', async (_, text) => {
  writePorts(text);

  await expect(readFramePorts(daemon)).rejects.toThrow('names no port pair');
});

it('the dev script takes its port from frame and holds none of its own', () => {
  const manifest = new URL('../package.json', import.meta.url);
  const { dev } = JSON.parse(readFileSync(manifest, 'utf8')).scripts;

  expect(dev).not.toMatch(fourDigits);

  writePorts(
    'export const chordsPort = 7901; export const chordsDevPort = 7902;',
  );

  const printed = execFileSync(
    process.execPath,
    [join(import.meta.dirname, 'dev-port.ts')],
    { encoding: 'utf8', env: { ...process.env, CHORDS_DAEMON: daemon } },
  );

  expect(printed).toBe('7902\n');
});
