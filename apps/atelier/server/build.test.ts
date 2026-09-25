import { execFileSync } from 'node:child_process';
import { expect, test } from 'vitest';

import { otherTrees, readBuild } from './build.ts';

const gitHere = (...args: string[]) =>
  execFileSync('git', args, { encoding: 'utf8' }).trim();

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
    '/repo',
    '/repo/.claude/worktrees/v',
  ]);
  expect(otherTrees(porcelain, '/repo')).toEqual([
    '/repo/.claude/worktrees/a',
    '/repo/.claude/worktrees/v',
  ]);
});
