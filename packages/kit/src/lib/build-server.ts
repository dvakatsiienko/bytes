import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { promisify } from 'node:util';
// through the package's own name: vite loads this file with plain node, which wants an extension, and an app's tsconfig refuses `.ts` in a path
import type { Build, Other } from '@ui/kit/lib/build';
import { BUILD_PATH, OTHERS_PATH } from '@ui/kit/lib/build';

import type { IncomingMessage, ServerResponse } from 'node:http';

const run = promisify(execFile);
const git = async (...args: string[]) =>
  (await run('git', args, { cwd: process.cwd() })).stdout.trim();

/** a worktree's dev servers run at base + its offset; `worktree:seed` writes the offset, 0 in the main checkout */
const offsetOf = (): number => Number(process.env.PORT_OFFSET ?? 0) || 0;
/** how long a sibling server gets to answer before it counts as down */
const PROBE_MS = 300;

/**
 * The branch and short sha of the checkout this dev server serves from. Read
 * on every request, so a pull shows without a restart. `isDev`: a worktree,
 * not the main checkout.
 */
export const readBuild = async (): Promise<Build> => {
  const [branch, sha] = await Promise.all([
    git('rev-parse', '--abbrev-ref', 'HEAD'),
    git('rev-parse', '--short=8', 'HEAD'),
  ]);
  return { app: appOf(), branch, isDev: offsetOf() > 0, sha };
};

/** a dev server runs from its app's folder */
const appOf = () => basename(process.cwd());

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

/** a build of this same app — the next apps share a base port, so another app may answer it */
export const isSameApp = (value: unknown): value is Build =>
  typeof value === 'object' &&
  value !== null &&
  (value as Record<string, unknown>).app === appOf() &&
  typeof (value as Record<string, unknown>).branch === 'string' &&
  typeof (value as Record<string, unknown>).sha === 'string';

/**
 * The same app running from this repo's other worktrees right now: each
 * tree's port is this server's base plus the tree's offset, and only a server
 * that answers its `/api/build` in time is listed. Asked server-side, since a
 * page cannot read another port's api.
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
          await fetch(`http://localhost:${port}${BUILD_PATH}`, {
            signal: AbortSignal.timeout(PROBE_MS),
          })
        ).json();
        if (!isSameApp(answer)) return null;
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

/**
 * The two endpoints on a vite dev server. `apply: 'serve'` keeps the plugin
 * out of `vite build`, so a production bundle has no endpoint to answer.
 * Typed by shape rather than through `vite`, which kit does not depend on.
 */
export const buildBadgeVite = () => ({
  apply: 'serve' as const,
  configureServer: (server: {
    middlewares: { use: (handler: Middleware) => void };
  }) => {
    server.middlewares.use((req, res, next) => {
      const path = req.url?.split('?')[0];
      if (req.method !== 'GET' || (path !== BUILD_PATH && path !== OTHERS_PATH))
        return next();
      const answer = path === BUILD_PATH ? readBuild() : readOthers();
      answer
        .then((body) => {
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify(body));
        })
        .catch((error: unknown) => {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: String(error) }));
        });
    });
  },
  name: 'build-badge',
});

/**
 * The two endpoints as next route handlers. They answer 404 in production: a
 * vercel deploy has no git checkout behind it.
 */
export const getBuild = () => answerNext(readBuild);
export const getBuildOthers = () => answerNext(readOthers);

const answerNext = async (read: () => Promise<unknown>) => {
  if (process.env.NODE_ENV === 'production')
    return new Response(null, { status: 404 });
  try {
    return Response.json(await read());
  } catch (error) {
    return Response.json({ error: String(error) }, { status: 500 });
  }
};

/* Types */

type Tree = ReturnType<typeof otherTrees>[number];

type Middleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void,
) => void;
