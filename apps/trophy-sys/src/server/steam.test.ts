import { expect, test } from 'vitest';

import { achievementBuild, gameBuild, playedAtBuild } from './steam.ts';

/**
 * Steam's shapes disagree with this app's in three ways that all look fine
 * until the numbers are read. Each of these pins one that was live in the
 * first draft:
 *
 * - playtime arrives in minutes, and the app stores seconds everywhere
 * - 0 means "never played" for a date and "played none" for a duration, so
 *   only one of the two may collapse to null
 * - the global unlock percentage arrives as the string "62.7", and a string
 *   assigned into a number field survives every downstream check while
 *   sorting and comparing wrongly
 */

test('playtime converts minutes to seconds, and zero stays zero', () => {
  expect(gameBuild({ appid: 1, playtime_forever: 90 }).playSeconds).toBe(5400);
  expect(gameBuild({ appid: 1, playtime_forever: 0 }).playSeconds).toBe(0);
  expect(gameBuild({ appid: 1 }).playSeconds).toBe(0);
});

test('a zero last-played time is null, not the unix epoch', () => {
  expect(playedAtBuild(0)).toBe(null);
  expect(playedAtBuild(undefined)).toBe(null);
  expect(playedAtBuild(1_700_000_000)).toBe('2023-11-14T22:13:20.000Z');
});

test('the icon url is composed from the hash, and absent without one', () => {
  expect(gameBuild({ appid: 570, img_icon_url: 'abc123' }).iconUrl).toBe(
    'https://media.steampowered.com/steamcommunity/public/images/apps/570/abc123.jpg',
  );
  expect(gameBuild({ appid: 570 }).iconUrl).toBe('');
});

test('a game with no name falls back to its appid rather than empty', () => {
  expect(gameBuild({ appid: 570 }).name).toBe('570');
});

test('rarity is null when the global percentages have nothing for it', () => {
  const none = achievementBuild({ apiname: 'a0' }, new Map());
  expect(none.rarity).toBe(null);

  const known = achievementBuild({ apiname: 'a0' }, new Map([['a0', 62.7]]));
  expect(known.rarity).toBe(62.7);
});

test('a locked achievement carries no earned date', () => {
  const locked = achievementBuild(
    { achieved: 0, apiname: 'a0', unlocktime: 0 },
    new Map(),
  );
  expect(locked.earned).toBe(false);
  expect(locked.earnedAt).toBe(null);

  const unlocked = achievementBuild(
    { achieved: 1, apiname: 'a0', unlocktime: 1_700_000_000 },
    new Map(),
  );
  expect(unlocked.earned).toBe(true);
  expect(unlocked.earnedAt).toBe('2023-11-14T22:13:20.000Z');
});
