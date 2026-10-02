import { existsSync, readFileSync, watch } from 'node:fs';
import { join, resolve } from 'node:path';

import {
  InputError,
  claimPush,
  markAsk,
  readAnswers,
  readJob,
} from '../server/job.ts';
import { askPath } from '../src/route.ts';

const usage = `loupe <verb> <job dir> — the designer's side of design-loupe

  round <job>                      check asks.json, stamp the round as pushed, print the one push
                                   line to send (PushNotification); a second call for the same
                                   round exits 1
  wait <job>                       stream one line per new or changed answer, until stopped —
                                   run it under Monitor, the session wakes on each line
  mark <job> <ask-id> seen         the designer read the answer
  mark <job> <ask-id> applied <v>  the answer landed in board version <v> (e.g. v1.20)

  the page runs at http://localhost:\${PORT:-5181}`;

const [verb, jobArg, ...rest] = process.argv.slice(2);
const fail = (message: string, code = 2): never => {
  console.error(`loupe: ${message}`);
  process.exit(code);
};
if (!verb || verb === '--help' || verb === '-h') {
  console.log(usage);
  process.exit(verb ? 0 : 2);
}
if (!jobArg) fail(`${verb} needs a job dir — loupe --help`);
const jobDir = resolve(jobArg ?? '');
if (!existsSync(join(jobDir, 'asks.json'))) fail(`no asks.json in ${jobDir}`);
// a worktree's dev server runs at 5181 + its offset (`worktree:seed`), so the push link must too
const offsetFile = resolve(import.meta.dirname, '../../../.worktree-offset');
const offset = existsSync(offsetFile)
  ? Number(readFileSync(offsetFile, 'utf8').trim()) || 0
  : 0;
const origin = `http://localhost:${process.env.PORT ?? 5181 + offset}`;
/** how soon a failed read is tried again; above the dispatch, which runs the verbs before any later const exists */
const RETRY_MS = 500;

try {
  if (verb === 'round') await round();
  else if (verb === 'wait') await wait();
  else if (verb === 'mark') await mark();
  else fail(`no verb ${verb} — loupe --help`);
} catch (error) {
  if (error instanceof InputError) fail(error.message, 1);
  fail(error instanceof Error ? error.message : String(error));
}

async function round() {
  // readJob first: a bad board name or a broken file fails here, before anything is stamped
  const job = await readJob(jobDir);
  const open = job.asks.filter((ask) => ask.state === 'open');
  const [first] = open;
  if (!first)
    throw new InputError(
      `nothing open in round ${job.round}, so there is nothing to push`,
    );
  const asks = await claimPush(jobDir);
  console.log(
    `${job.name} · round ${asks.round}: ${open.length} ${open.length === 1 ? 'ask' : 'asks'} → ${origin}${askPath(job.name, first.id)}`,
  );
}

async function wait() {
  const known = await readAnswers(jobDir);
  const job = await readJob(jobDir);
  console.error(`loupe: waiting on answers for ${job.name}`);
  // `known` moves only after a line is printed, so a read that fails mid-rewrite (the designer
  // writing the next round) is retried, never skipped
  const check = async () => {
    const answers = await readAnswers(jobDir);
    const fresh = await readJob(jobDir);
    for (const ask of fresh.asks) {
      const answer = answers[ask.id];
      if (!answer || known[ask.id]?.at === answer.at) continue;
      known[ask.id] = answer;
      const said =
        answer.pick === null
          ? `«${answer.text}»`
          : `«${ask.options[answer.pick]}»`;
      console.log(
        `answered ${ask.id}: ${said}${answer.pick !== null && answer.text ? ` + «${answer.text}»` : ''} (board rev ${answer.rev})`,
      );
    }
    for (const id of Object.keys(known))
      if (!answers[id]) {
        delete known[id];
        console.log(`reopened ${id}`);
      }
  };
  const checkSoon = () => {
    check().catch(() => setTimeout(checkSoon, RETRY_MS));
  };
  watch(jobDir, (_event, file) => {
    if (file === 'answers.json' || file === 'asks.json') checkSoon();
  });
  // a held-open process: Monitor ends it
  await new Promise(() => undefined);
}

async function mark() {
  const [id, as, version] = rest;
  if (!id || (as !== 'seen' && as !== 'applied'))
    fail('mark <job> <ask-id> seen | applied <version>');
  if (as === 'applied' && !version)
    fail('applied needs the board version, e.g. v1.20');
  await markAsk(
    jobDir,
    as === 'seen'
      ? { as, id: id ?? '' }
      : { as: 'applied', id: id ?? '', version: version ?? '' },
  );
  console.log(`loupe: ${id} ${as}${version ? ` in ${version}` : ''}`);
}
