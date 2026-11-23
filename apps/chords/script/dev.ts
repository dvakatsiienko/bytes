// The one run script: the page's dev server, and frame's daemon with it when none serves the api.
import { type ChildProcess, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

import { chordsDevPort, chordsPort } from '../ports.ts';
import { apiHolder } from './api-holder.ts';

const daemonPath =
  process.env.CHORDS_DAEMON ?? join(homedir(), 'frame/hotkeys/live.ts');
const startDeadlineMs = 15_000;
const children: ChildProcess[] = [];

const stop = (code: number) => {
  for (const child of children) child.kill();
  process.exit(code);
};

const fail = (message: string) => {
  console.error(`chords: ${message}`);
  stop(1);
};

// either half ending ends the other: a page with no api, or an api left behind, is a half-started app
const start = (
  name: string,
  command: string,
  args: string[],
  env: NodeJS.ProcessEnv = process.env,
) => {
  const child = spawn(command, args, { env, stdio: 'inherit' });

  child.on('error', (error) =>
    fail(`${name} did not start — ${error.message}`),
  );
  child.on('exit', (code) => {
    console.error(`chords: ${name} ended`);
    stop(code ?? 1);
  });
  children.push(child);
};

const startDaemon = async () => {
  if (!existsSync(daemonPath)) return fail(`no daemon at ${daemonPath}`);

  console.log(`chords: nothing on ${chordsPort}, starting ${daemonPath}`);
  // the daemon takes writes only from origins it knows, so it is told this page's port
  start('the daemon', process.execPath, [daemonPath, '--watch'], {
    ...process.env,
    CHORDS_DEV_PORT: String(chordsDevPort),
    CHORDS_PORT: String(chordsPort),
  });

  if (!(await answersBy(Date.now() + startDeadlineMs))) {
    fail(`the daemon did not answer on ${chordsPort}`);
  }
};

const answersBy = async (deadline: number): Promise<boolean> => {
  if ((await apiHolder(chordsPort)) === 'daemon') return true;
  if (Date.now() > deadline) return false;

  await sleep(200);
  return answersBy(deadline);
};

for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP'] as const) {
  process.on(signal, () => stop(0));
}

const holder = await apiHolder(chordsPort);

if (holder === 'other') {
  fail(`something that is not the hotkey daemon holds ${chordsPort}`);
}
if (holder === 'none') await startDaemon();
if (holder === 'daemon') {
  console.log(
    `chords: the api is already served on ${chordsPort}, starting the page alone`,
  );
}

start('the page', 'vite', []);
