/**
 * `pnpm atelier:ship [piece…] [--write] [--to <dir>]`
 *
 * Copies each piece's current day and night take into the repo its readme
 * lives in: `<repo>/<ship path>-light|dark.<svg|webp>`. A flat piece ships its
 * svg, a lit one its webp. Without `--write` it prints the plan and touches
 * nothing; `--to` puts every repo under one scratch folder instead.
 * It never commits — the target repo's own flow does that.
 */
import { execFileSync } from 'node:child_process';
import { copyFile, mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { parseArgs } from 'node:util';

import type { Piece, Repo } from '../art/pieces.ts';
import { pieces } from '../art/pieces.ts';
import { appRoot, listTakes, takeFile } from '../server/takes.ts';

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    to: { type: 'string' },
    write: { default: false, type: 'boolean' },
  },
});

const bytesRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], {
  cwd: appRoot,
  encoding: 'utf8',
}).trim();
const repoRoots: Record<Repo, string> = {
  bytes: bytesRoot,
  frame: join(homedir(), 'frame'),
  profile: join(homedir(), 'projects/dvakatsiienko'),
};
const rootOf = (repo: Repo) =>
  values.to ? join(values.to, repo) : repoRoots[repo];

const unknown = positionals.filter(
  (id) => !pieces.some((piece) => piece.id === id),
);
if (unknown.length > 0) {
  console.error(`no such piece: ${unknown.join(', ')}`);
  process.exit(2);
}
const picked: readonly Piece[] = pieces.filter(
  (piece) => positionals.length === 0 || positionals.includes(piece.id),
);

const lists = await Promise.all(
  picked.map(async (piece) => ({ list: await listTakes(piece.id), piece })),
);
const plan = lists.flatMap(({ piece, list }) => {
  const { ship } = piece;
  if (!ship) return [];
  return (['day', 'night'] as const).flatMap((time) => {
    const take = list.takes.find(
      (candidate) => candidate.id === list.current[time],
    );
    if (!take) {
      console.log(`· ${piece.id} ${time}: no current take — bake one`);
      return [];
    }
    const file = take.files.includes('piece.svg') ? 'piece.svg' : 'bake.webp';
    const suffix = time === 'day' ? 'light' : 'dark';
    const target = join(
      rootOf(ship.repo),
      `${ship.path}-${suffix}.${file === 'piece.svg' ? 'svg' : 'webp'}`,
    );
    console.log(
      `${values.write ? '→' : '·'} ${piece.id} ${time} ${take.id} → ${target}`,
    );
    return [{ source: takeFile(piece.id, take.id, file), target }];
  });
});

if (values.write) {
  await Promise.all(
    plan.map(async ({ source, target }) => {
      await mkdir(dirname(target), { recursive: true });
      await copyFile(source, target);
    }),
  );
}

console.log(
  values.write
    ? `shipped ${plan.length} files; commit them in their repos`
    : 'plan only — add --write to copy',
);
