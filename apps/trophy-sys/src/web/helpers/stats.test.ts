import { expect, test } from 'vitest';

import type {
  ArchivedTrophy,
  TrophyArchive,
  TrophyGrade,
} from '../../shared/types.ts';
import {
  countShare,
  gamingDayKey,
  nowPlayingId,
  trophyOrder,
} from './stats.ts';

const counts = (bronze: number) => ({
  bronze,
  gold: 0,
  platinum: 0,
  silver: 0,
});

test('the count share never rounds an unfinished title up to 100', () => {
  expect(countShare({ defined: counts(200), earned: counts(199) })).toBe(99);
});

test('a title that defines no trophies shares 0, not NaN', () => {
  expect(countShare({ defined: counts(0), earned: counts(0) })).toBe(0);
});

const zoneUse = (zone: string) => {
  process.env.TZ = zone;
};

const trophy = (at: string, grade: TrophyGrade): ArchivedTrophy => ({
  at,
  gameId: 'NPWR00000_00',
  grade,
  name: grade,
  rarity: 50,
});

test('the gaming day ends at 05:00, not midnight', () => {
  zoneUse('Europe/Kyiv');

  // 23:40 and 00:38 are one evening; 05:01 is the next morning.
  expect(gamingDayKey(new Date('2026-07-12T23:40:00'))).toBe('2026-07-12');
  expect(gamingDayKey(new Date('2026-07-13T00:38:00'))).toBe('2026-07-12');
  expect(gamingDayKey(new Date('2026-07-13T04:59:00'))).toBe('2026-07-12');
  expect(gamingDayKey(new Date('2026-07-13T05:01:00'))).toBe('2026-07-13');
});

test('the gaming day is local, so the same instant lands differently by zone', () => {
  const instant = new Date('2026-07-13T00:38:00Z');

  zoneUse('Europe/Kyiv'); // 03:38 local, still the 12th's evening
  expect(gamingDayKey(instant)).toBe('2026-07-12');

  zoneUse('America/New_York'); // 20:38 local on the 12th
  expect(gamingDayKey(instant)).toBe('2026-07-12');

  zoneUse('Australia/Sydney'); // 10:38 local on the 13th
  expect(gamingDayKey(instant)).toBe('2026-07-13');
});

test('on an identical instant the closing trophy sorts first', () => {
  const tied = '2026-08-13T16:25:33Z';
  const rows = [
    trophy(tied, 'gold'),
    trophy(tied, 'platinum'),
    trophy(tied, 'bronze'),
  ].sort(trophyOrder);

  expect(rows.map((row) => row.grade)).toStrictEqual([
    'platinum',
    'gold',
    'bronze',
  ]);
});

test('a later instant still outranks a higher grade', () => {
  const rows = [
    trophy('2026-08-13T16:25:33Z', 'platinum'),
    trophy('2026-08-13T16:40:00Z', 'bronze'),
  ].sort(trophyOrder);

  expect(rows.map((row) => row.at)).toStrictEqual([
    '2026-08-13T16:40:00Z',
    '2026-08-13T16:25:33Z',
  ]);
});

test('trophies tied on instant and grade keep the order they arrived in', () => {
  const tied = '2026-07-24T17:08:55Z';
  const first = { ...trophy(tied, 'bronze'), name: 'first' };
  const second = { ...trophy(tied, 'bronze'), name: 'second' };

  expect(
    [first, second].sort(trophyOrder).map((row) => row.name),
  ).toStrictEqual(['first', 'second']);
});

const archiveAt = (
  syncedAt: string,
  newest: ArchivedTrophy,
): TrophyArchive => ({
  failed: [],
  games: 2,
  remaining: [],
  syncedAt,
  trophies: [
    { ...trophy('2026-01-01T20:00:00Z', 'bronze'), gameId: 'NPWR11111_00' },
    newest,
  ],
  version: 2,
});

test('the newest trophy names the title now playing, within a week of the sync', () => {
  const newest = trophy('2026-09-21T23:00:00Z', 'gold');

  expect(nowPlayingId(archiveAt('2026-09-28T12:00:00Z', newest))).toBe(
    'NPWR00000_00',
  );
});

test('nothing is now playing when the newest trophy is over a week older than the sync', () => {
  const newest = trophy('2026-09-20T23:00:00Z', 'gold');

  expect(nowPlayingId(archiveAt('2026-09-28T12:00:00Z', newest))).toBe(null);
});

test('now playing is measured against the sync, never the clock', () => {
  // Years before today: a clock-based rule would call this long finished.
  const newest = trophy('2020-01-05T20:00:00Z', 'gold');

  expect(nowPlayingId(archiveAt('2020-01-08T12:00:00Z', newest))).toBe(
    'NPWR00000_00',
  );
});
