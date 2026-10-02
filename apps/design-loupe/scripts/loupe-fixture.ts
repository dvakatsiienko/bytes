import {
  cpSync,
  existsSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

const usage = `loupe:fixture [<take project dir>] — the test job, made from real boards

  copies a studio take's boards into fixtures/speak/boards (gitignored) and plants the pins
  fixtures/speak/asks.json points at: ask-1 and ask-2 get an element, ask-3 gets none, so it
  reads «target moved». the studio files are never touched. it also clears answers.json, so
  every run starts from three open asks.

  default dir: ~/projects/studio/jobs/speak/takes/merge/project`;

/** [board, the exact markup to find, the pin to plant on it] */
const pins = [
  ['Main.dc.html', '<footer class="chrome">', 'ask-1'],
  ['admin-1728.dc.html', '<header class="chrome hdr">', 'ask-2'],
] as const;

const [, , arg] = process.argv;
if (arg === '--help' || arg === '-h') {
  console.log(usage);
  process.exit(0);
}
const source = resolve(
  arg ?? join(homedir(), 'projects/studio/jobs/speak/takes/merge/project'),
);
if (!existsSync(join(source, 'canvas.json'))) {
  console.error(`loupe:fixture: no canvas.json in ${source}`);
  process.exit(2);
}

const job = resolve(import.meta.dirname, '../fixtures/speak');
const boards = join(job, 'boards');
rmSync(boards, { force: true, recursive: true });
cpSync(source, boards, { recursive: true });
rmSync(join(job, 'answers.json'), { force: true });

for (const [board, anchor, id] of pins) {
  const file = join(boards, board);
  const html = readFileSync(file, 'utf8');
  if (html.split(anchor).length !== 2) {
    console.error(`loupe:fixture: ${board} must hold «${anchor}» exactly once`);
    process.exit(2);
  }
  writeFileSync(
    file,
    html.replace(anchor, anchor.replace('>', ` id="${id}">`)),
  );
}
console.log(
  `loupe:fixture: ${boards} — ${pins.length} pins planted, answers cleared`,
);
