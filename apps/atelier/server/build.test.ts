import { execFileSync } from 'node:child_process';
import { expect, test } from 'vitest';

import { readBuild } from './build.ts';

const gitHere = (...args: string[]) =>
  execFileSync('git', args, { encoding: 'utf8' }).trim();

test('names the branch and the 8-character sha of the checkout it serves from', async () => {
  expect(await readBuild()).toEqual({
    branch: gitHere('rev-parse', '--abbrev-ref', 'HEAD'),
    sha: gitHere('rev-parse', '--short=8', 'HEAD'),
  });
});
