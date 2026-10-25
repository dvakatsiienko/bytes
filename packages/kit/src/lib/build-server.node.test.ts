import { execFileSync } from 'node:child_process';
import { afterEach, expect, test, vi } from 'vitest';

import { getBuild, isSameApp, otherTrees, readBuild } from './build-server';

const gitHere = (...args: string[]) =>
  execFileSync('git', args, { encoding: 'utf8' }).trim();

afterEach(() => {
  vi.unstubAllEnvs();
});

test('names the branch and the 8-character sha of the checkout it serves from', async () => {
  const build = await readBuild();
  expect({ branch: build.branch, sha: build.sha }).toEqual({
    branch: gitHere('rev-parse', '--abbrev-ref', 'HEAD'),
    sha: gitHere('rev-parse', '--short=8', 'HEAD'),
  });
});

test('lists every worktree but its own, detached ones included', () => {
  const porcelain = [
    'worktree /repo',
    'HEAD 2a407e1f',
    'branch refs/heads/main',
    '',
    'worktree /repo/.claude/worktrees/a',
    'HEAD d6307974',
    'branch refs/heads/coder/a',
    '',
    'worktree /repo/.claude/worktrees/v',
    'HEAD d6307974',
    'detached',
    '',
  ].join('\n');
  expect(otherTrees(porcelain, '/repo/.claude/worktrees/a')).toEqual([
    { isMain: true, path: '/repo' },
    { isMain: false, path: '/repo/.claude/worktrees/v' },
  ]);
  expect(otherTrees(porcelain, '/repo')).toEqual([
    { isMain: false, path: '/repo/.claude/worktrees/a' },
    { isMain: false, path: '/repo/.claude/worktrees/v' },
  ]);
});

test.each([
  ['10', true],
  ['0', false],
  [undefined, false],
] as const)(
  'with PORT_OFFSET %s it is dev: %s — a worktree runs above 0, main at 0 or with none',
  async (offset, isDev) => {
    vi.stubEnv('PORT_OFFSET', offset);
    expect((await readBuild()).isDev).toBe(isDev);
  },
);

test('names its app by the folder the dev server runs from', async () => {
  expect((await readBuild()).app).toBe('kit');
});

test('another app answering the shared base port is not a sibling', () => {
  const build = { branch: 'main', isDev: false, sha: '2a407e1f' };
  expect(isSameApp({ ...build, app: 'kit' })).toBe(true);
  expect(isSameApp({ ...build, app: 'x-com-chat' })).toBe(false);
});

test('the next route answers 404 in production, where no git checkout stands behind it', async () => {
  vi.stubEnv('NODE_ENV', 'production');
  expect((await getBuild()).status).toBe(404);
});
