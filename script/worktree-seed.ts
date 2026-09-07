/**
 * worktree-seed [path] — makes a fresh git worktree of bytes runnable.
 *
 * A worktree carries only what git tracks. This copies what git ignores and a
 * dev server needs — every app's `.env*`, `.claude/settings.local.json`,
 * trophy-sys's local caches — from the main checkout, installs with `CI=1` so
 * lefthook cannot rewrite the shared hooks, and writes `.worktree-offset` so
 * `script/with-port.ts` moves every dev port clear of the main tree.
 *
 * Callers: cc's EnterWorktree hook (`~/.claude/shelf/hooks/worktree-seed.sh`)
 * and a human after `camp`: `pnpm worktree:seed ../bytes-<slug>`.
 */
import { execFileSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const target = resolve(process.argv[2] ?? process.cwd());
const trees = execFileSync('git', ['worktree', 'list', '--porcelain'], {
  cwd: target,
  encoding: 'utf8',
})
  .split('\n')
  .filter((l) => l.startsWith('worktree '))
  .map((l) => l.slice('worktree '.length));
const [main] = trees;
if (!main) throw new Error('not inside a git worktree');
const index = trees.indexOf(target);
if (index === -1) throw new Error(`${target} is not a worktree of ${main}`);
if (index === 0) {
  console.log('main checkout — nothing to seed');
  process.exit(0);
}

const SEEDS = ['.claude/settings.local.json'];
const APP_SEEDS = [
  /^\.env(\..+)?$/,
  /^\.trophy-.*\.json$/,
  /^\.claude\/settings\.local\.json$/,
];

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

const copied: string[] = [];
function seed(rel: string) {
  const from = join(main, rel);
  const to = join(target, rel);
  if (!existsSync(from) || existsSync(to) || !ignored(rel)) return;
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
  copied.push(rel);
}

for (const rel of SEEDS) seed(rel);
for (const app of readdirSync(join(main, 'apps'), { withFileTypes: true })) {
  if (!app.isDirectory()) continue;
  const dir = join(main, 'apps', app.name);
  for (const entry of readdirSync(dir))
    if (APP_SEEDS.some((re) => re.test(entry)))
      seed(relative(main, join(dir, entry)));
  seed(relative(main, join(dir, '.claude/settings.local.json')));
}

const offset = index * 10;
writeFileSync(join(target, '.worktree-offset'), `${offset}\n`);
execFileSync('pnpm', ['install'], {
  cwd: target,
  env: { ...process.env, CI: '1' },
  stdio: 'inherit',
});

console.log(`seeded ${target}`);
console.log(`  copied: ${copied.length ? copied.join(', ') : 'nothing new'}`);
console.log(
  `  ports: +${offset} (trophy-sys ${5177 + offset}/${5178 + offset}, proto-lab ${5179 + offset}, space-explorer ${5173 + offset}/${4000 + offset}, next apps ${3000 + offset})`,
);
