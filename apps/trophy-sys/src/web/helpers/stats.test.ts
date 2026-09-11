import { expect, test } from 'vitest';

import type { ArchivedTrophy, TrophyGrade } from '../../shared/types.ts';
import { gamingDayKey, trophyOrder } from './stats.ts';

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
