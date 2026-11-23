// The one run script: the page's dev server, and frame's daemon with it when none serves the api.
import { type ChildProcess, spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

import { type ApiHolder, apiHolder } from './api-holder.ts';
import { daemonPath, readFramePorts } from './frame-ports.ts';

const { chordsDevPort, chordsPort } = await readFramePorts(daemonPath);
const pagePort = Number(process.env.PORT);
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
  console.log(`chords: nothing on ${chordsPort}, starting ${daemonPath}`);
  // the daemon takes writes only from origins it knows, so it is told this page's port
  start('the daemon', process.execPath, [daemonPath, '--watch'], {
    ...process.env,
    CHORDS_DEV_PORT: String(pagePort),
    CHORDS_PORT: String(chordsPort),
  });

  const started = await holderBy(Date.now() + startDeadlineMs);

  if (started === 'outdated') fail(`${daemonPath} is older than this page`);
  if (started !== 'daemon') fail(`the daemon did not answer on ${chordsPort}`);
};

const holderBy = async (deadline: number): Promise<ApiHolder> => {
  const now = await apiHolder(chordsPort);

  if (now !== 'none' || Date.now() > deadline) return now;

  await sleep(200);
  return holderBy(deadline);
};

for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP'] as const) {
  process.on(signal, () => stop(0));
}

// `with-port` passes no signal on: when it is killed alone, this process would keep both halves and the port
const parent = process.ppid;
setInterval(() => {
  if (process.ppid !== parent) stop(1);
}, 1000).unref();

const holder = await apiHolder(chordsPort);

if (holder === 'other') {
  fail(`something that is not the hotkey daemon holds ${chordsPort}`);
}
if (holder === 'outdated') {
  fail(`the daemon on ${chordsPort} is older than this page, restart it`);
}
if (holder === 'none') await startDaemon();
if (holder === 'daemon' && process.env.CHORDS_DAEMON) {
  fail(
    `CHORDS_DAEMON names ${daemonPath}, but a daemon already serves ${chordsPort}`,
  );
}
if (holder === 'daemon') {
  console.log(
    `chords: the api is already served on ${chordsPort}, starting the page alone`,
  );
  if (pagePort !== chordsDevPort) {
    console.log(
      `chords: this page is on ${pagePort}, frame's dev port is ${chordsDevPort}: saves may answer 403`,
    );
  }
}

start('the page', 'vite', [], {
  ...process.env,
  CHORDS_PORT: String(chordsPort),
});
