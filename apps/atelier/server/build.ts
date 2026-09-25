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

/** every worktree in `git worktree list --porcelain` but the one at `self`; git lists the main checkout first */
export const otherTrees = (porcelain: string, self: string) =>
  porcelain
    .split('\n')
    .filter((line) => line.startsWith('worktree '))
    .map((line, index) => ({
      isMain: index === 0,
      path: line.slice('worktree '.length),
    }))
    .filter((tree) => tree.path !== self);

/**
 * A worktree's port offset from its `.worktree-offset`. Only the main checkout
 * may go without one (it runs at the base port); a worktree without the file
 * was never seeded, and read as 0 it would pose as main.
 */
const treeOffset = async (tree: Tree) => {
  const text = await readFile(
    join(tree.path, '.worktree-offset'),
    'utf8',
  ).catch(() => null);
  if (text === null) return tree.isMain ? 0 : null;
  return Number(text.trim()) || 0;
};

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
      const offset = await treeOffset(tree);
      if (offset === null) return null;
      const port = base + offset;
      if (port === Number(process.env.PORT)) return null;
      try {
        const answer: unknown = await (
          await fetch(`http://localhost:${port}/api/build`, {
            signal: AbortSignal.timeout(PROBE_MS),
          })
        ).json();
        if (!isBuild(answer)) return null;
        const name =
          answer.branch === 'HEAD' ? basename(tree.path) : answer.branch;
        return { ...answer, name, port };
      } catch {
        return null;
      }
    }),
  );
  // two trees can claim one port (a copied offset): one link per server
  return [
    ...new Map(
      found
        .filter((other) => other !== null)
        .map((other) => [other.port, other]),
    ).values(),
  ];
};

/* Types */

type Tree = ReturnType<typeof otherTrees>[number];

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
