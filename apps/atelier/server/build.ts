import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { appRoot } from './takes.ts';

const run = promisify(execFile);
const git = async (...args: string[]) =>
  (await run('git', args, { cwd: appRoot })).stdout.trim();

/**
 * The branch and short sha of the checkout this server serves from. Read on
 * every request, so a pull shows without a restart; vite serves the files on
 * disk, so this is what runs.
 */
export const readBuild = async (): Promise<Build> => {
  const [branch, sha] = await Promise.all([
    git('rev-parse', '--abbrev-ref', 'HEAD'),
    git('rev-parse', '--short=8', 'HEAD'),
  ]);
  return { branch, sha };
};

/* Types */

export interface Build {
  /** `HEAD` on a detached checkout */
  branch: string;
  sha: string;
}
