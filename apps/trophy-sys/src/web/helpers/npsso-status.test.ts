import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { GrantStatus, NpssoStatus } from '../../shared/types.ts';
import { readoutBuild } from './npsso-status.ts';

/**
 * This readout exists because a confident wrong number cost a day of chasing
 * the wrong lifetime. Every case here pins a way it could start lying again:
 * an age invented for a token that has no paste date, an estimate drawn from
 * no measurement, or one sample dressed up as a trend.
 */

const DAY_MS = 86_400_000;

const GRANT_NONE: GrantStatus = {
  expiresIn: 0,
  lifetimes: [],
  mintedAt: null,
  refreshedAt: null,
  window: 0,
};

/** What PSN reports for a freshly minted grant: 863999s, ten days to the second. */
const GRANT_CLAIM = 863_999;

const grantMake = (over: Partial<GrantStatus> = {}): GrantStatus => ({
  ...GRANT_NONE,
  expiresIn: GRANT_CLAIM,
  mintedAt: Date.now(),
  refreshedAt: Date.now(),
  window: GRANT_CLAIM,
  ...over,
});

const statusMake = (over: Partial<NpssoStatus> = {}): NpssoStatus => ({
  diedAt: null,
  lifetimes: [],
  refresh: GRANT_NONE,
  savedAt: null,
  source: 'store',
  ...over,
});

const rowValue = (status: NpssoStatus, label: string) =>
  readoutBuild(status).rows.find((row) => row.label === label)?.value;

test('a seed token says why its age is unknown, without a row for it', () => {
  const readout = readoutBuild(statusMake({ savedAt: null, source: 'env' }));

  assert.equal(
    readout.rows.find((row) => row.label === 'token in use'),
    undefined,
    'the row said the same thing on every read once a token had been pasted',
  );
  assert.equal(rowValue(statusMake({ source: 'env' }), 'age'), 'unknown');
  assert.ok(readout.notes.some((note) => note.includes('env var seed')));
});

test('a token with no paste date reports an unknown age, never a zero', () => {
  const readout = readoutBuild(statusMake({ savedAt: null, source: 'env' }));

  assert.equal(rowValue(statusMake({ source: 'env' }), 'age'), 'unknown');
  assert.ok(
    readout.notes.some((note) => note.includes('env var')),
    'the env-var case has to say why the age is unknown',
  );
});

test('an age is whole days since the paste', () => {
  const savedAt = Date.now() - 12 * DAY_MS;

  assert.equal(rowValue(statusMake({ savedAt }), 'age'), '12 days');
});

test('one day is singular — the readout is read, not parsed', () => {
  const savedAt = Date.now() - 1 * DAY_MS;

  assert.equal(rowValue(statusMake({ savedAt }), 'age'), '1 day');
});

test('no measurement means no estimate at all', () => {
  const readout = readoutBuild(statusMake({ savedAt: Date.now() }));

  assert.equal(
    readout.rows.find((row) => row.label === 'rough guess'),
    undefined,
    'an estimate with nothing measured is the exact failure this replaces',
  );
  assert.ok(readout.notes.some((note) => note.includes('no estimate')));
});

test('one sample is named as one sample, and called a hint', () => {
  const readout = readoutBuild(
    statusMake({ lifetimes: [25 * DAY_MS], savedAt: Date.now() - 10 * DAY_MS }),
  );

  assert.ok(
    readout.notes.some((note) => note.includes('1 sample')),
    'the sample count is never hidden',
  );
  assert.ok(readout.notes.some((note) => note.includes('not a trend')));
});

test('the estimate uses the shortest lifetime seen, not the average', () => {
  const status = statusMake({
    // An average would say 20 days left; the shortest says 10. Early is the
    // harmless direction to be wrong in.
    lifetimes: [20 * DAY_MS, 40 * DAY_MS],
    savedAt: Date.now() - 10 * DAY_MS,
  });

  assert.equal(rowValue(status, 'shortest seen'), '20 days');
  assert.equal(rowValue(status, 'rough guess'), '~10 days left');
});

test('an age past the shortest lifetime stops counting down', () => {
  const status = statusMake({
    lifetimes: [20 * DAY_MS],
    savedAt: Date.now() - 30 * DAY_MS,
  });

  assert.equal(rowValue(status, 'rough guess'), 'past the shortest seen');
});

test('a dead token says so, and drops the countdown', () => {
  const status = statusMake({
    diedAt: Date.now(),
    lifetimes: [20 * DAY_MS],
    savedAt: Date.now() - 5 * DAY_MS,
  });
  const readout = readoutBuild(status);

  assert.ok(readout.dead?.includes('psn refused this token'));
  assert.equal(
    readout.rows.find((row) => row.label === 'rough guess'),
    undefined,
    'a token already dead has no days left to guess at',
  );
});

/**
 * The grant row carries two readings from different clocks — an age measured
 * here, and what PSN said was left at some earlier moment. Each case below pins
 * one seam between them, and the countdown/reset pair pins why they must stay
 * two numbers rather than one.
 */

test('no stored grant says so rather than printing a zero-day one', () => {
  const readout = readoutBuild(statusMake({ refresh: GRANT_NONE }));

  assert.equal(rowValue(statusMake(), 'grant'), 'none');
  assert.ok(readout.notes.some((note) => note.includes('no refresh grant')));
});

test('days left are floored — the row never promises time it may not have', () => {
  // 863999s is 9.99 days and prints as 9. The window it is measured against
  // rounds to 10, and the two differ on purpose: `left` is an estimate the
  // owner acts on, so it errs short, while the window is PSN's own published
  // figure and flooring that one would report a ten-day grant as nine.
  assert.equal(
    rowValue(statusMake({ refresh: grantMake() }), 'grant'),
    'day 0 · 9 days left',
  );
});

test('the days left count down from the reading, not from now', () => {
  // PSN said ten days two days ago, so eight are left. Printing `expiresIn`
  // raw would report ten and age the claim by every day since the cron looked.
  const status = statusMake({
    refresh: grantMake({
      mintedAt: Date.now() - 6 * DAY_MS,
      refreshedAt: Date.now() - 2 * DAY_MS,
    }),
  });

  assert.equal(rowValue(status, 'grant'), 'day 6 · 7 days left');
});

/**
 * ⚠️ This pair is the reason age and `leftMs` are printed separately. A single
 * derived window — `(refreshedAt - mintedAt) + expiresIn` — returns the same
 * figure under both, so the comparison below cannot be made at all.
 */
test('a countdown grant runs its days down and never outlives the window', () => {
  const age = 9 * DAY_MS;
  const status = statusMake({
    refresh: grantMake({
      // What a countdown reports on day 9: one day of the original ten.
      expiresIn: GRANT_CLAIM - 9 * 86_400,
      mintedAt: Date.now() - age,
      refreshedAt: Date.now(),
    }),
  });
  const readout = readoutBuild(status);

  assert.equal(rowValue(status, 'grant'), 'day 9 · 0 days left');
  assert.ok(
    !readout.notes.some((note) => note.includes('still has days left')),
    'a grant inside its window must never claim the clock was reset',
  );
});

test('a grant past the window with days left is flagged as the finding', () => {
  const status = statusMake({
    // What a RESET would look like on day 30: the full ten reported again.
    refresh: grantMake({ mintedAt: Date.now() - 30 * DAY_MS }),
  });
  const readout = readoutBuild(status);

  assert.equal(
    rowValue(status, 'grant'),
    'day 30 · 9 days left',
    'an age past the window with time still on it is what this row exists for',
  );
  assert.equal(
    readout.rows.find((row) => row.label === 'grant')?.tone,
    'text-yellow',
  );
  assert.ok(readout.notes.some((note) => note.includes('still has days left')));
});

test('the flag fires the day the window passes, not a day later', () => {
  // 10.0 days against a 9.99999-day window. Both display figures read 10, so a
  // comparison made on them says "not yet" for a further whole day — on the one
  // reading this readout exists to catch.
  const status = statusMake({
    refresh: grantMake({ mintedAt: Date.now() - 10 * DAY_MS }),
  });
  const readout = readoutBuild(status);

  assert.equal(
    readout.rows.find((row) => row.label === 'grant')?.tone,
    'text-yellow',
  );
  assert.ok(readout.notes.some((note) => note.includes('still has days left')));
});

test('a grant inside its window to the second is not flagged', () => {
  const status = statusMake({
    refresh: grantMake({ mintedAt: Date.now() - 9 * DAY_MS }),
  });
  const readout = readoutBuild(status);

  assert.equal(
    readout.rows.find((row) => row.label === 'grant')?.tone,
    'text-fg',
  );
  assert.ok(
    !readout.notes.some((note) => note.includes('still has days left')),
  );
});

test('an expired grant says so rather than printing negative days', () => {
  const status = statusMake({
    refresh: grantMake({ expiresIn: 0, mintedAt: Date.now() - 3 * DAY_MS }),
  });

  assert.equal(rowValue(status, 'grant'), 'day 3 · psn says expired');
});

test('a refused grant reports the shortest lifetime, and no claim beside it', () => {
  const readout = readoutBuild(
    statusMake({
      refresh: grantMake({ lifetimes: [12 * DAY_MS, 7 * DAY_MS] }),
    }),
  );

  const note = readout.notes.find((entry) =>
    entry.includes('refused a refresh'),
  );
  assert.ok(note?.includes('7 days'), 'the shortest seen, never the average');
  assert.ok(
    !note?.includes('9 days'),
    "the only expiresIn in hand belongs to the LIVE grant — quoting it here reads as the dead grant's own promise",
  );
});

test('the grant adds exactly one row — this panel has been cut for growing', () => {
  // Counted absolutely, never against another readout that also carries the
  // row: both sides holding it made the comparison pass at any row count.
  const { rows } = readoutBuild(
    statusMake({
      lifetimes: [20 * DAY_MS],
      refresh: grantMake({ lifetimes: [7 * DAY_MS] }),
      savedAt: Date.now() - 3 * DAY_MS,
    }),
  );

  assert.deepEqual(
    rows.map((row) => row.label),
    ['age', 'shortest seen', 'rough guess', 'grant'],
    'the three npsso rows, then one grant row — paste first, then text',
  );
});
