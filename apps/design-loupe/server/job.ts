import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile, rename, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { z } from 'zod';

/**
 * One job on disk: `asks.json` (the designer writes it), `answers.json` (only
 * design-loupe writes it) and the boards folder `asks.json` names, holding
 * `canvas.json` and the `.dc.html` boards. Two writers, two files: neither side
 * ever rewrites the other's file, so a write never races the other side.
 */

const askId = z.string().regex(/^ask-\d+$/, 'an ask id is ask-<n>');

const askSchema = z.object({
  /** the answer the designer applied, matched by its `at`, and the board version it landed in */
  applied: z.object({ at: z.string(), in: z.string() }).optional(),
  board: z.string(),
  id: askId,
  kind: z.enum(['pick', 'confirm', 'compare', 'open']),
  options: z.array(z.string()).max(9).default([]),
  question: z.string(),
  /** index into `options` */
  recommend: z.number().int().nonnegative().optional(),
  /** the `at` of the answer the designer read */
  seen: z.string().optional(),
  why: z.string().optional(),
});

const asksSchema = z.object({
  asks: z.array(askSchema),
  /** the boards folder, relative to the job */
  boards: z.string(),
  /** the round `loupe round` already announced */
  pushed: z.number().int().optional(),
  round: z.number().int().positive(),
});

const noteSchema = z.object({ at: z.string(), text: z.string() });

/**
 * An answer is the picked option plus a thread of notes; a note never clears
 * the pick and never replaces an earlier note. `at` is the time of the last
 * pick or note, and it is what the designer's seen / applied point at; a
 * reopen removes it (and the pick), so the ask reads open with its notes kept.
 */
const answerSchema = z.preprocess(
  // an answer written before notes had one `text` line: it becomes the first note
  (value) =>
    typeof value === 'object' &&
    value !== null &&
    'text' in value &&
    !('notes' in value)
      ? (({ text, ...rest }) => ({
          ...rest,
          notes:
            typeof text === 'string' && text.trim()
              ? [{ at: (rest as { at?: string }).at ?? '', text }]
              : [],
        }))(value as { text?: unknown })
      : value,
  z.object({
    at: z.string().optional(),
    notes: z.array(noteSchema).default([]),
    pick: z.number().int().nonnegative().nullable(),
    /** the board's revision at the last pick or note */
    rev: z.string(),
  }),
);

/**
 * A handover: the moment a round's answers go to the designer, once for the
 * whole round — every open ask got its answer, or dima pressed «send round».
 * The designer's watch keys on these entries only, never on single answers.
 */
const handoverSchema = z.object({
  at: z.string(),
  by: z.enum(['all answered', 'send round']),
  round: z.number().int().positive(),
});

const answersSchema = z.preprocess(
  // a file written before handovers was the answers record alone
  (value) =>
    typeof value === 'object' && value !== null && !('answers' in value)
      ? { answers: value, sent: [] }
      : value,
  z.object({
    answers: z.record(askId, answerSchema),
    sent: z.array(handoverSchema).default([]),
  }),
);

const canvasSchema = z.object({
  boards: z.record(
    z.string(),
    z.object({
      h: z.number(),
      title: z.string().optional(),
      w: z.number(),
      x: z.number(),
      y: z.number(),
    }),
  ),
  title: z.string().optional(),
});

const pinId = /\bid="(ask-\d+)"/g;
const boardSuffix = /\.dc\.html$/;

const askState = (ask: Ask, answer: Answer | undefined): AskState => {
  if (!answer?.at) return 'open';
  if (ask.applied?.at === answer.at) return 'applied';
  if (ask.seen === answer.at) return 'seen';
  return 'answered';
};

export const readAsks = async (jobDir: string) =>
  asksSchema.parse(await readJson(join(jobDir, 'asks.json'), undefined));

export const readAnswers = async (jobDir: string) =>
  answersSchema.parse(await readJson(join(jobDir, 'answers.json'), {}));

/** the asks whose answer changed after the last handover: what the next one will carry */
const unsentOf = (file: AnswersFile) => {
  const since = file.sent.at(-1)?.at ?? '';
  return Object.entries(file.answers)
    .filter(([, answer]) => answer.at !== undefined && answer.at > since)
    .map(([id]) => id);
};

export const boardsDirOf = (jobDir: string, asks: Asks) =>
  resolve(jobDir, asks.boards);

/** the whole job as the page shows it; throws a readable error on a shape a person must fix */
export const readJob = async (jobDir: string): Promise<JobView> => {
  const [asks, answersFile] = await Promise.all([
    readAsks(jobDir),
    readAnswers(jobDir),
  ]);
  const { answers } = answersFile;
  const boardsDir = boardsDirOf(jobDir, asks);
  const canvas = canvasSchema.parse(
    await readJson(join(boardsDir, 'canvas.json'), undefined),
  );

  const boards = await Promise.all(
    Object.entries(canvas.boards).map(async ([file, box]) => {
      const html = await readFile(join(boardsDir, file), 'utf8');
      return {
        ...box,
        file,
        name: file.replace(boardSuffix, ''),
        pins: [...html.matchAll(pinId)].map((match) => match[1] ?? ''),
        rev: revisionOf(html),
        title: box.title ?? file,
      };
    }),
  );

  const askViews = asks.asks.map((ask): AskView => {
    const board = boards.find((candidate) => candidate.file === ask.board);
    if (!board)
      throw new Error(
        `${ask.id} names board ${ask.board}, which canvas.json lacks`,
      );
    const answer = answers[ask.id];
    const state = askState(ask, answer);
    return {
      ...ask,
      answer,
      // an applied ask's pin comes off on purpose; only a live ask can lose its target
      isMoved: state !== 'applied' && !board.pins.includes(ask.id),
      state,
    };
  });

  return {
    asks: askViews,
    boards: boards.map(({ pins: _pins, ...board }) => board),
    name: basename(jobDir),
    round: asks.round,
    sent: answersFile.sent,
    title: canvas.title ?? basename(jobDir),
    unsent: unsentOf(answersFile),
  };
};

/** dima's answer to one ask: a pick, a note, or both; a pick must name an option, a note must say something */
export const writeAnswer = (jobDir: string, input: AnswerInput) =>
  inTurn(() => writeAnswerNow(jobDir, input));

const writeAnswerNow = async (jobDir: string, input: AnswerInput) => {
  const asks = await readAsks(jobDir);
  const ask = asks.asks.find((candidate) => candidate.id === input.id);
  if (!ask) throw new InputError(`no ask ${input.id} in asks.json`);
  if (input.pick !== null && input.pick >= ask.options.length)
    throw new InputError(`${input.id} has no option ${input.pick + 1}`);
  const note = input.note.trim();
  if (input.pick === null && note === '')
    throw new InputError('an answer is an option, a note, or both');

  const html = await readFile(
    join(boardsDirOf(jobDir, asks), ask.board),
    'utf8',
  );
  const file = await readAnswers(jobDir);
  const { answers } = file;
  const at = stamp();
  const before = answers[input.id];
  answers[input.id] = {
    at,
    notes: note
      ? [...(before?.notes ?? []), { at, text: note }]
      : (before?.notes ?? []),
    pick: input.pick ?? before?.pick ?? null,
    rev: revisionOf(html),
  };
  // the answer that closes the last open ask hands the round over; later changes wait for the next one
  const isLastOpen =
    !before?.at && asks.asks.every((candidate) => answers[candidate.id]?.at);
  if (isLastOpen) file.sent.push({ at, by: 'all answered', round: asks.round });
  await writeJson(join(jobDir, 'answers.json'), file);
};

/** dima's «send round»: hands over what changed since the last handover, open asks and all */
export const sendRound = (jobDir: string) =>
  inTurn(async () => {
    const [asks, file] = await Promise.all([
      readAsks(jobDir),
      readAnswers(jobDir),
    ]);
    if (unsentOf(file).length === 0)
      throw new InputError('nothing new to send since the last handover');
    file.sent.push({
      at: stamp(),
      by: 'send round',
      round: asks.round,
    });
    await writeJson(join(jobDir, 'answers.json'), file);
  });

/** reopening drops the pick and the answer's time, so the ask is open again and the designer's seen / applied no longer match; its notes stay */
export const reopenAsk = (jobDir: string, id: string) =>
  inTurn(async () => {
    const file = await readAnswers(jobDir);
    const answer = file.answers[id];
    if (!answer?.at) throw new InputError(`${id} has no answer to reopen`);
    file.answers[id] = { notes: answer.notes, pick: null, rev: answer.rev };
    await writeJson(join(jobDir, 'answers.json'), file);
  });

/** the designer's side: mark the current answer seen, or applied in a board version */
export const markAsk = async (jobDir: string, mark: Mark) => {
  const asks = await readAsks(jobDir);
  const { answers } = await readAnswers(jobDir);
  const ask = asks.asks.find((candidate) => candidate.id === mark.id);
  if (!ask) throw new InputError(`no ask ${mark.id} in asks.json`);
  const at = answers[mark.id]?.at;
  if (!at) throw new InputError(`${mark.id} has no answer yet`);
  if (mark.as === 'seen') ask.seen = at;
  else ask.applied = { at, in: mark.version };
  await writeJson(join(jobDir, 'asks.json'), asks);
};

/** stamps the round as pushed; a second push for the same round is refused */
export const claimPush = async (jobDir: string) => {
  const asks = await readAsks(jobDir);
  if (asks.pushed === asks.round)
    throw new InputError(`round ${asks.round} was pushed already`);
  asks.pushed = asks.round;
  await writeJson(join(jobDir, 'asks.json'), asks);
  return asks;
};

/** a short content hash: the same board text is the same revision on every machine */
const revisionOf = (html: string) =>
  createHash('sha1').update(html).digest('hex').slice(0, 8);

/** a mistake in what was asked for, as opposed to a broken file */
export class InputError extends Error {}

/* Helpers */

let turn: Promise<unknown> = Promise.resolve();
/**
 * Every answers.json write is a read, a change and a write; two at once would
 * each read the old file and the later write would drop the earlier answer.
 * So the server's writes run one after another.
 */
const inTurn = <T>(write: () => Promise<T>): Promise<T> => {
  const next = turn.then(write, write);
  turn = next.catch(() => undefined);
  return next;
};

let lastStamp = '';
/**
 * The time of a write, strictly after the previous one: a handover and the
 * next note can land in the same millisecond, and «changed since the last
 * handover» compares these strings. The writes already run one at a time.
 */
const stamp = () => {
  const now = new Date();
  const last = lastStamp ? new Date(lastStamp) : undefined;
  lastStamp = (
    last && now <= last ? new Date(last.getTime() + 1) : now
  ).toISOString();
  return lastStamp;
};

const readJson = async (path: string, fallback: unknown) => {
  if (!existsSync(path)) {
    if (fallback !== undefined) return fallback;
    throw new InputError(`no ${basename(path)} at ${path}`);
  }
  return JSON.parse(await readFile(path, 'utf8')) as unknown;
};

/** write then rename: a reader never sees half a file */
const writeJson = async (path: string, value: unknown) => {
  const temp = `${path}.${process.pid}.tmp`;
  await writeFile(temp, `${JSON.stringify(value, null, 2)}\n`);
  await rename(temp, path);
};

/* Types */

type Asks = z.infer<typeof asksSchema>;
type Ask = z.infer<typeof askSchema>;
type Answer = z.infer<typeof answerSchema>;
type AnswersFile = z.infer<typeof answersSchema>;
type Handover = z.infer<typeof handoverSchema>;

type AskState = 'open' | 'answered' | 'seen' | 'applied';

export interface AskView extends Ask {
  answer: Answer | undefined;
  isMoved: boolean;
  state: AskState;
}

export interface BoardView {
  file: string;
  h: number;
  name: string;
  rev: string;
  title: string;
  w: number;
  x: number;
  y: number;
}

export interface JobView {
  asks: AskView[];
  boards: BoardView[];
  name: string;
  round: number;
  /** every handover so far, oldest first */
  sent: Handover[];
  title: string;
  /** the asks changed since the last handover */
  unsent: string[];
}

export interface AnswerInput {
  id: string;
  /** a note to add to the thread, or '' for none */
  note: string;
  /** the option to pick, or null to keep the current pick */
  pick: number | null;
}

type Mark = { id: string } & (
  | { as: 'seen' }
  | { as: 'applied'; version: string }
);
