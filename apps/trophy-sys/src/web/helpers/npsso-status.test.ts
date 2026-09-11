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
};

/** What PSN reports for a freshly minted grant: 863999s, ten days to the second. */
const GRANT_CLAIM = 863_999;

const grantMake = (over: Partial<GrantStatus> = {}): GrantStatus => ({
  ...GRANT_NONE,
  expiresIn: GRANT_CLAIM,
  mintedAt: Date.now(),
  refreshedAt: Date.now(),
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
 * The grant row carries two numbers that come from different clocks, which is
 * the only reason it can lie: an age measured here, and a lifetime PSN asserted
 * at some earlier moment. Each case below pins one of those seams.
 */

test('no stored grant says so rather than printing a zero-day one', () => {
  const readout = readoutBuild(statusMake({ refresh: GRANT_NONE }));

  assert.equal(rowValue(statusMake(), 'refresh grant'), 'none');
  assert.ok(readout.notes.some((note) => note.includes('no refresh grant')));
});

test('a fresh grant reads as day 0 of psn’s full ten, never nine', () => {
  // 863999s floors to 9, and a ten-day grant printed as nine is the confident
  // wrong number this whole readout exists to avoid.
  assert.equal(
    rowValue(statusMake({ refresh: grantMake() }), 'refresh grant'),
    'day 0 of 10',
  );
});

test('the window is counted from the mint, not from the last reading', () => {
  // PSN said ten days four days into this grant's life, so the window is
  // fourteen — measuring it from the reading alone would lose the days before.
  const status = statusMake({
    refresh: grantMake({
      mintedAt: Date.now() - 6 * DAY_MS,
      refreshedAt: Date.now() - 2 * DAY_MS,
    }),
  });

  assert.equal(rowValue(status, 'refresh grant'), 'day 6 of 14');
});

test('a grant outliving psn’s window says so, and says what it means', () => {
  const status = statusMake({
    refresh: grantMake({
      mintedAt: Date.now() - 30 * DAY_MS,
      refreshedAt: Date.now() - 30 * DAY_MS,
    }),
  });
  const readout = readoutBuild(status);

  assert.equal(
    rowValue(status, 'refresh grant'),
    'day 30 of 10',
    'the window outlived is the measurement this row exists for',
  );
  assert.equal(
    readout.rows.find((row) => row.label === 'refresh grant')?.tone,
    'text-yellow',
  );
  assert.ok(readout.notes.some((note) => note.includes('outlived')));
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
  const withGrant = readoutBuild(statusMake({ refresh: grantMake() })).rows;
  const without = readoutBuild(statusMake({ refresh: GRANT_NONE })).rows;

  assert.equal(withGrant.length, without.length);
  assert.equal(
    withGrant.at(-1)?.label,
    'refresh grant',
    'paste first, then text',
  );
});
