/**
 * with-port <base> <cmd…> — runs a dev server on `base + PORT_OFFSET`.
 *
 * The offset makes a second worktree of the same app runnable beside the main
 * checkout: `worktree:seed` writes `.worktree-offset` at the tree root (0 for the
 * main checkout), and every dev script starts through this wrapper. Exports
 * `PORT` (base + offset) and `PORT_OFFSET` for configs that pin a second port.
 * An explicit `PORT` in the environment wins untouched — the desktop launch
 * entries set one per app.
 */
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const [base, cmd, ...args] = process.argv.slice(2);
if (!(base && cmd)) {
  console.error('usage: with-port <base-port> <command> [args…]');
  process.exit(2);
}

function offsetFromTree(dir: string): number {
  for (let d = dir; ; d = dirname(d)) {
    const file = join(d, '.worktree-offset');
    if (existsSync(file)) return Number(readFileSync(file, 'utf8').trim()) || 0;
    if (dirname(d) === d) return 0;
  }
}

const offset = Number(process.env.PORT_OFFSET ?? offsetFromTree(process.cwd()));
const port = process.env.PORT ?? String(Number(base) + offset);
const child = spawn(cmd, args, {
  env: { ...process.env, PORT: port, PORT_OFFSET: String(offset) },
  stdio: 'inherit',
});
child.on('exit', (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
