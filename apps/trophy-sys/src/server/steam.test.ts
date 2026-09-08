import assert from 'node:assert/strict';
import { test } from 'node:test';

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
  assert.equal(gameBuild({ appid: 1, playtime_forever: 90 }).playSeconds, 5400);
  assert.equal(gameBuild({ appid: 1, playtime_forever: 0 }).playSeconds, 0);
  assert.equal(gameBuild({ appid: 1 }).playSeconds, 0);
});

test('a zero last-played time is null, not the unix epoch', () => {
  assert.equal(playedAtBuild(0), null);
  assert.equal(playedAtBuild(undefined), null);
  assert.equal(playedAtBuild(1_700_000_000), '2023-11-14T22:13:20.000Z');
});

test('the icon url is composed from the hash, and absent without one', () => {
  assert.equal(
    gameBuild({ appid: 570, img_icon_url: 'abc123' }).iconUrl,
    'https://media.steampowered.com/steamcommunity/public/images/apps/570/abc123.jpg',
  );
  assert.equal(gameBuild({ appid: 570 }).iconUrl, '');
});

test('a game with no name falls back to its appid rather than empty', () => {
  assert.equal(gameBuild({ appid: 570 }).name, '570');
});

test('rarity is null when the global percentages have nothing for it', () => {
  const none = achievementBuild({ apiname: 'a0' }, new Map());
  assert.equal(none.rarity, null);

  const known = achievementBuild({ apiname: 'a0' }, new Map([['a0', 62.7]]));
  assert.equal(known.rarity, 62.7);
});

test('a locked achievement carries no earned date', () => {
  const locked = achievementBuild(
    { achieved: 0, apiname: 'a0', unlocktime: 0 },
    new Map(),
  );
  assert.equal(locked.earned, false);
  assert.equal(locked.earnedAt, null);

  const unlocked = achievementBuild(
    { achieved: 1, apiname: 'a0', unlocktime: 1_700_000_000 },
    new Map(),
  );
  assert.equal(unlocked.earned, true);
  assert.equal(unlocked.earnedAt, '2023-11-14T22:13:20.000Z');
});
