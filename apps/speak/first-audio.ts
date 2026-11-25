// how soon dima's last reads began to sound, off the daemon's own log: the median and the 95th percentile of each
// engine, hot and cold apart. cold is the first read after 5 idle minutes or the daemon's start; a sentence kept from
// before is left out of both, and so is what no F4 began (a preview, the socket's read).
// usage: node first-audio.ts [reads, 200] [since, «2026-11-26 09:00»]
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const IDLE_MS = 5 * 60_000;
const KINDS = ['hot', 'cold', 'kept'] as const;
const LINE =
  /^(?<day>\d{4}-\d\d-\d\d) (?<time>\d\d:\d\d:\d\d\.\d{3}) (?<says>.*)$/u;
const BEGUN = /^read \d+: chunk 1\/\d+$/u;
const ENDED = /^\S+ \S+ read \d+: ended$/mu;
const SAID = /^read \d+: /u;
const START = /^(?=\S+ \S+ daemon: )/mu;
const OVER = /^read \d+: (?:ended|stopped)$/u;
const HEARD = /^first audio: (?<engine>\w+) (?<ms>\d+) ms(?<kept>, kept)?$/u;

// one daemon's lines at a time: one from before «ended» was logged knows a read's end only by its last line
export const firstAudios = (log: string): FirstAudio[] =>
  log.split(START).flatMap(ofOneDaemon);

const ofOneDaemon = (log: string): FirstAudio[] => {
  const found: FirstAudio[] = [];
  const namesEnds = ENDED.test(log);
  let isPressed = false;
  let isRead = false;
  let isCold = true;
  let isPlaying = false;
  let quietSince = Number.NEGATIVE_INFINITY;
  for (const line of log.split('\n')) {
    const { day, time, says = '' } = LINE.exec(line)?.groups ?? {};
    if (!(day && time)) continue;
    const at = Date.parse(`${day}T${time}`);
    if (says.startsWith('press: grab ')) {
      isPressed = true;
      isCold = !isPlaying && at - quietSince > IDLE_MS;
    }
    if (BEGUN.test(says)) {
      isPlaying = namesEnds;
      isRead = isPressed;
      isPressed = false;
    }
    if (OVER.test(says) || (!namesEnds && SAID.test(says))) {
      isPlaying = false;
      quietSince = at;
    }
    const { engine, kept, ms } = HEARD.exec(says)?.groups ?? {};
    if (!(engine && ms && isRead)) continue;
    const pace = isCold ? 'cold' : 'hot';
    found.push({
      at: `${day} ${time}`,
      engine,
      kind: kept ? 'kept' : pace,
      ms: Number(ms),
    });
  }
  return found;
};

// the nearest rank: a number that was measured, never one between two
export const percentile = (values: number[], share: number) =>
  values.toSorted((a, b) => a - b)[Math.ceil(values.length * share) - 1];

export const report = (audios: FirstAudio[]) => {
  const engines = [...new Set(audios.map((audio) => audio.engine))];
  const lines = engines.flatMap((engine) =>
    KINDS.flatMap((kind) => {
      const ms = audios
        .filter((audio) => audio.engine === engine && audio.kind === kind)
        .map((audio) => audio.ms);
      if (ms.length === 0) return [];
      return kind === 'kept'
        ? [`${engine} kept: ${ms.length} reads, left out`]
        : [
            `${engine} ${kind}: ${ms.length} reads, median ${percentile(ms, 0.5)} ms, 95th ${percentile(ms, 0.95)} ms`,
          ];
    }),
  );
  return [
    `${audios.length} reads, ${audios[0]?.at ?? '-'} to ${audios.at(-1)?.at ?? '-'}`,
    ...lines,
  ].join('\n');
};

if (import.meta.main) {
  const [count = '200', since = ''] = process.argv.slice(2);
  const log = join(homedir(), '.local/share/x-speak/daemon.err.log');
  const audios = firstAudios(readFileSync(log, 'utf8'));
  const reads = audios.filter((audio) => audio.at >= since);
  console.log(report(since ? reads.slice(0, +count) : reads.slice(-count)));
}

/* Types */
interface FirstAudio {
  at: string;
  engine: string;
  kind: (typeof KINDS)[number];
  ms: number;
}
