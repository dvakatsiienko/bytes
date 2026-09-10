import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { NpssoStatus } from '../../shared/types.ts';
import { readoutBuild } from './npsso-status.ts';

/**
 * This readout exists because a confident wrong number cost a day of chasing
 * the wrong lifetime. Every case here pins a way it could start lying again:
 * an age invented for a token that has no paste date, an estimate drawn from
 * no measurement, or one sample dressed up as a trend.
 */

const DAY_MS = 86_400_000;

const statusMake = (over: Partial<NpssoStatus> = {}): NpssoStatus => ({
  diedAt: null,
  envMatch: 'none',
  lifetimes: [],
  liveSource: null,
  savedAt: null,
  source: 'store',
  ...over,
});

const rowValue = (status: NpssoStatus, label: string) =>
  readoutBuild(status).rows.find((row) => row.label === label)?.value;

test('the readout names which of the two sources is live', () => {
  assert.equal(
    rowValue(statusMake({ source: 'store' }), 'token in use'),
    'the one pasted here',
  );
  assert.equal(
    rowValue(statusMake({ source: 'env' }), 'token in use'),
    'the vercel env var',
  );
  assert.equal(
    rowValue(statusMake({ source: 'none' }), 'token in use'),
    'nothing stored',
  );
});

test('the vercel row answers whether that token has gone stale', () => {
  assert.equal(
    rowValue(statusMake({ envMatch: 'same' }), 'vercel env var'),
    'the same token',
  );
  assert.equal(
    rowValue(statusMake({ envMatch: 'different' }), 'vercel env var'),
    'a different token',
  );
  assert.equal(
    rowValue(statusMake({ envMatch: 'none' }), 'vercel env var'),
    'not set',
  );
});

test('with nothing pasted there is no comparison to print', () => {
  assert.equal(
    rowValue(statusMake({ envMatch: 'same', source: 'env' }), 'vercel env var'),
    undefined,
    '«the same token» against nothing pasted is a sentence about nothing',
  );
});

test('«running on» appears only when it disagrees with the source', () => {
  assert.equal(
    rowValue(statusMake({ liveSource: null }), 'running on'),
    undefined,
  );
  assert.equal(
    rowValue(
      statusMake({ liveSource: 'store', source: 'store' }),
      'running on',
    ),
    undefined,
    'a row that only ever agrees with the one above it stops being read',
  );
  assert.equal(
    rowValue(statusMake({ liveSource: 'env', source: 'store' }), 'running on'),
    'the vercel env var',
  );
});

test('a pasted token the app is not using explains itself', () => {
  const readout = readoutBuild(
    statusMake({ liveSource: 'env', source: 'store' }),
  );

  assert.ok(
    readout.notes.some((note) =>
      note.includes('refused the token pasted here'),
    ),
    'the fallback having kicked in is the one state the rows alone understate',
  );
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
