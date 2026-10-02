/**
 * worktree-seed [path] — makes a fresh git worktree of bytes runnable.
 *
 * A worktree carries only what git tracks. This copies what git ignores and a
 * dev server needs — every app's `.env*`, `.claude/settings.local.json`,
 * trophy-sys's local caches, design-loupe's canvas runtime — from the main
 * checkout, installs with `CI=1` so lefthook cannot rewrite the shared hooks,
 * and writes `.worktree-offset` so `script/with-port.ts` moves every dev port
 * clear of every other tree.
 *
 * ⚠️ Production kv never reaches a tree: `STAND_INS` blanks trophy-sys's
 * Vercel-pulled `.env.local`. The live NPSSO and grant are still copied, so a
 * tree's library works (dima's call, 2026-09-28, «until we find out the optimal
 * way» — a verify run drives PSN with his own token).
 *
 * Callers: cc's EnterWorktree hook (`~/.claude/shelf/hooks/worktree-seed.sh`)
 * and a human after `camp`: `pnpm worktree:seed ../bytes-<slug>`.
 */
import { execFileSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const trees = execFileSync('git', ['worktree', 'list', '--porcelain'], {
  cwd: process.cwd(),
  encoding: 'utf8',
})
  .split('\n')
  .filter((l) => l.startsWith('worktree '))
  .map((l) => l.slice('worktree '.length));
const [main] = trees;
if (!main) throw new Error('not inside a git worktree');
// no path: the tree you stand in, or — from the main checkout — the newest one
// (`camp … && pnpm worktree:seed` is the whole move)
const cwd = process.cwd();
const cwdTree = trees.find((t) => cwd === t || cwd.startsWith(`${t}/`));
const target = resolve(
  process.argv[2] ??
    (cwdTree && cwdTree !== main ? cwdTree : (trees.at(-1) ?? main)),
);
const index = trees.indexOf(target);
if (index === -1) throw new Error(`${target} is not a worktree of ${main}`);
if (index === 0) {
  console.log('main checkout — nothing to seed');
  process.exit(0);
}

const SEEDS = ['.claude/settings.local.json'];
const APP_SEEDS = [/^\.env(\..+)?$/, /^\.trophy-.*\.json$/];
const APP_FILES = ['.claude/settings.local.json', '.runtime/dc-runtime.js'];

function ignored(file: string): boolean {
  try {
    execFileSync('git', ['check-ignore', '-q', file], {
      cwd: main,
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
}

const ENV_LINE = /^([A-Z0-9_]+)=.*$/gm;

/** Files written transformed instead of copied. */
const STAND_INS: Record<string, (text: string) => string> = {
  // Vercel-pulled production credentials only: prod kv and its oidc token,
  // every value blanked, every key kept.
  'apps/trophy-sys/.env.local': (text) =>
    text.replace(ENV_LINE, (_line, key: string) => `${key}=`),
};

const copied: string[] = [];
function seed(rel: string) {
  const from = join(main, rel);
  const to = join(target, rel);
  if (!existsSync(from) || existsSync(to) || !ignored(rel)) return;
  mkdirSync(dirname(to), { recursive: true });

  const standIn = STAND_INS[rel];
  if (standIn) writeFileSync(to, standIn(readFileSync(from, 'utf8')));
  else copyFileSync(from, to);
  copied.push(standIn ? `${rel} (stand-in)` : rel);
}

/**
 * The lowest multiple of 10 no other tree's `.worktree-offset` holds. The old
 * `10 × list index` shifted when a tree sorted in before another, and a new
 * tree took a live tree's ports (both got 20, 2026-09-28). A re-seed keeps the
 * tree's own offset while nobody else holds it.
 */
function offsetPick(): number {
  const read = (tree: string) => {
    const file = join(tree, '.worktree-offset');
    return existsSync(file) ? Number(readFileSync(file, 'utf8').trim()) : null;
  };
  const held = new Set(
    trees
      .filter((tree) => tree !== target && tree !== main)
      .map(read)
      .filter((found) => found !== null),
  );

  const own = read(target);
  if (own && !held.has(own)) return own;

  let free = 10;
  while (held.has(free)) free += 10;
  return free;
}

for (const rel of SEEDS) seed(rel);
for (const app of readdirSync(join(main, 'apps'), { withFileTypes: true })) {
  if (!app.isDirectory()) continue;
  const dir = join(main, 'apps', app.name);
  for (const entry of readdirSync(dir))
    if (APP_SEEDS.some((re) => re.test(entry)))
      seed(relative(main, join(dir, entry)));
  for (const file of APP_FILES) seed(relative(main, join(dir, file)));
}

const offset = offsetPick();
writeFileSync(join(target, '.worktree-offset'), `${offset}\n`);
execFileSync('pnpm', ['install'], {
  cwd: target,
  env: { ...process.env, CI: '1' },
  stdio: 'inherit',
});

console.log(`seeded ${target}`);
console.log(`  copied: ${copied.length ? copied.join(', ') : 'nothing new'}`);
console.log(
  `  ports: +${offset} (trophy-sys ${5177 + offset}/${5178 + offset}, sketchbook ${5179 + offset}, atelier ${5180 + offset}, space-explorer ${5173 + offset}/${4000 + offset}, next apps ${3000 + offset})`,
);
