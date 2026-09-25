import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { promisify } from 'node:util';

import { appRoot } from './takes.ts';

const run = promisify(execFile);
const git = async (...args: string[]) =>
  (await run('git', args, { cwd: appRoot })).stdout.trim();

/** a worktree's dev servers run at base + its offset; `worktree:seed` writes the offset, 0 in the main checkout */
const offsetOf = (): number => Number(process.env.PORT_OFFSET ?? 0) || 0;
/** how long a sibling atelier gets to answer before it counts as down */
const PROBE_MS = 300;

/**
 * The branch and short sha of the checkout this server serves from. Read on
 * every request, so a pull shows without a restart; vite serves the files on
 * disk, so this is what runs. `isDev`: a worktree, not the main checkout.
 */
export const readBuild = async (): Promise<Build> => {
  const [branch, sha] = await Promise.all([
    git('rev-parse', '--abbrev-ref', 'HEAD'),
    git('rev-parse', '--short=8', 'HEAD'),
  ]);
  return { branch, isDev: offsetOf() > 0, sha };
};

/** every worktree in `git worktree list --porcelain` but the one at `self` */
export const otherTrees = (porcelain: string, self: string) =>
  porcelain
    .split('\n')
    .filter((line) => line.startsWith('worktree '))
    .map((line) => line.slice('worktree '.length))
    .filter((tree) => tree !== self);

const treeOffset = async (tree: string) =>
  Number(
    (
      await readFile(join(tree, '.worktree-offset'), 'utf8').catch(() => '0')
    ).trim(),
  ) || 0;

const isBuild = (value: unknown): value is Build =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as Record<string, unknown>).branch === 'string' &&
  typeof (value as Record<string, unknown>).sha === 'string';

/**
 * The other ateliers running from this repo's worktrees right now: each tree's
 * port is this server's base plus the tree's offset, and only a server that
 * answers its /api/build in time is listed. Asked server-side, since a page
 * cannot read another port's api.
 */
export const readOthers = async (): Promise<Other[]> => {
  const base = Number(process.env.PORT) - offsetOf();
  if (!Number.isFinite(base)) return [];
  const [self, porcelain] = await Promise.all([
    git('rev-parse', '--show-toplevel'),
    git('worktree', 'list', '--porcelain'),
  ]);
  const found = await Promise.all(
    otherTrees(porcelain, self).map(async (tree): Promise<Other | null> => {
      const port = base + (await treeOffset(tree));
      if (port === Number(process.env.PORT)) return null;
      try {
        const answer: unknown = await (
          await fetch(`http://localhost:${port}/api/build`, {
            signal: AbortSignal.timeout(PROBE_MS),
          })
        ).json();
        if (!isBuild(answer)) return null;
        const name = answer.branch === 'HEAD' ? basename(tree) : answer.branch;
        return { ...answer, name, port };
      } catch {
        return null;
      }
    }),
  );
  return found.filter((other) => other !== null);
};

/* Types */

export interface Build {
  /** `HEAD` on a detached checkout */
  branch: string;
  isDev: boolean;
  sha: string;
}

export interface Other extends Build {
  /** the branch, or the worktree's folder when it is detached */
  name: string;
  port: number;
}
