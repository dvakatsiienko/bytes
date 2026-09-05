import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { ArchivedTrophy } from '../../shared/types.ts';
import { trophyStreaks } from './streaks.ts';

/**
 * Streaks are counted in whole calendar days, and a calendar day is not a fixed
 * number of milliseconds. These pin the two ways that used to go wrong: a
 * daylight-saving change breaking a run, and a past-midnight session counting
 * as two days.
 *
 * `process.env.TZ` is honoured by V8 between calls, so one file covers several
 * zones. Southern-hemisphere cases matter because their shifts land in October
 * and April, the opposite of Europe's.
 */
const zoneUse = (zone: string) => {
  process.env.TZ = zone;
};

/** A trophy at a local wall-clock time, which is what the buckets read. */
const trophyAt = (local: string): ArchivedTrophy => ({
  at: new Date(local).toISOString(),
  gameId: 'NPWR00000_00',
  grade: 'bronze',
  name: local,
  rarity: 50,
});

/** The length of the single run these trophies should form. */
const runDays = (locals: string[]) => {
  const model = trophyStreaks(locals.map(trophyAt));
  assert.equal(
    model.runs.length,
    1,
    `expected one run, got ${model.runs.length}`,
  );
  return model.runs[0]?.days;
};

test('a run survives a spring-forward, where the day is 23 hours', () => {
  zoneUse('Europe/Kyiv'); // shifts 2025-03-30
  assert.equal(
    runDays([
      '2025-03-29T20:00:00',
      '2025-03-30T20:00:00',
      '2025-03-31T20:00:00',
    ]),
    3,
  );
});

test('a run survives a fall-back, where the day is 25 hours', () => {
  zoneUse('Europe/Kyiv'); // shifts 2025-10-26
  assert.equal(
    runDays([
      '2025-10-25T20:00:00',
      '2025-10-26T20:00:00',
      '2025-10-27T20:00:00',
    ]),
    3,
  );
});

test('the southern hemisphere shifts the other way round, and still holds', () => {
  zoneUse('Australia/Sydney'); // springs forward 2025-10-05, falls back 2025-04-06
  assert.equal(
    runDays([
      '2025-10-04T20:00:00',
      '2025-10-05T20:00:00',
      '2025-10-06T20:00:00',
    ]),
    3,
  );
  assert.equal(
    runDays([
      '2025-04-05T20:00:00',
      '2025-04-06T20:00:00',
      '2025-04-07T20:00:00',
    ]),
    3,
  );
});

test('a half-hour zone is no different', () => {
  zoneUse('Australia/Adelaide'); // UTC+9:30, shifts 2025-10-05
  assert.equal(
    runDays([
      '2025-10-04T20:00:00',
      '2025-10-05T20:00:00',
      '2025-10-06T20:00:00',
    ]),
    3,
  );
});

test('an evening running past midnight is one day of play, not two', () => {
  zoneUse('Europe/Kyiv');
  assert.equal(runDays(['2025-06-10T22:00:00', '2025-06-11T02:00:00']), 1);
});

test('a real gap still breaks the run', () => {
  zoneUse('Europe/Kyiv');
  const model = trophyStreaks(
    ['2025-06-10T20:00:00', '2025-06-12T20:00:00'].map(trophyAt),
  );
  assert.equal(model.runs.length, 2);
});
