import { assert, expect, test } from 'vitest';

import type { Game } from '../shared/types.ts';
import type { PlayIndex } from './playtime.ts';
import { unplayedBuild } from './psn.ts';
import type { PurchasedTitle } from './purchased.ts';

/**
 * The owned library is the trophy library plus whatever `getPurchasedGames`
 * knows about that the trophy endpoint does not. `unplayedBuild` is the join,
 * and every case here is one it can get wrong in a way the user sees: a game
 * printed twice, or a game missing.
 *
 * The merge lives in `psn.ts` rather than `purchased.ts` — `purchased.ts` is
 * only the fetch — but it is the purchased list's behaviour, so it is pinned
 * here.
 */

const NO_PLAY: PlayIndex = { byName: new Map(), byNamePlatform: new Map() };

const purchased = (
  name: string,
  platform = 'PS5',
  titleId = `PPSA${name.length}_00`,
): PurchasedTitle => ({ iconUrl: 'icon.png', name, platform, titleId });

const trophied = (name: string, platform = 'PS4'): Game =>
  ({
    defined: { bronze: 1, gold: 0, platinum: 0, silver: 0 },
    earned: { bronze: 1, gold: 0, platinum: 0, silver: 0 },
    iconUrl: '',
    id: `NPWR${name.length}_00`,
    lastPlayedAt: '2026-01-01T00:00:00.000Z',
    name,
    platform,
    playSeconds: null,
    playedAt: null,
    progress: 10,
    source: 'psn',
  }) satisfies Game;

const names = (games: Game[]) => games.map((game) => game.name);

test('a purchased title already in the trophy list is not added again', () => {
  const merged = unplayedBuild(
    [purchased('Hollow Knight')],
    [trophied('Hollow Knight')],
    NO_PLAY,
  );
  expect(names(merged)).toStrictEqual([]);
});

test('a purchased title with no trophy record is added', () => {
  const merged = unplayedBuild(
    [purchased('Rogue Legacy 2')],
    [trophied('Hollow Knight')],
    NO_PLAY,
  );
  expect(names(merged)).toStrictEqual(['Rogue Legacy 2']);
});

test('an added title carries the purchased identity, not a trophy one', () => {
  const [game] = unplayedBuild([purchased('Sifu')], [], NO_PLAY);
  // assert.ok, not expect: only the assertion signature narrows `game` for the
  // property reads below.
  assert.ok(game);

  expect(game.source).toBe('psn-purchased');
  // Its id is a titleId, and every trophy endpoint takes an npCommunicationId —
  // `gameDetailFetch` branches on `source` because of exactly this.
  expect(game.id).toBe(purchased('Sifu').titleId);
  expect(game.progress).toBe(0);
  expect(game.defined).toStrictEqual({
    bronze: 0,
    gold: 0,
    platinum: 0,
    silver: 0,
  });
  // Not a fake date: `Date.parse('')` is NaN, which the archive's freshness
  // check reads as "never newer" instead of "just changed".
  expect(game.lastPlayedAt).toBe('');
  expect(Number.isNaN(Date.parse(game.lastPlayedAt))).toBe(true);
});

/**
 * The documented cross-gen rule: the join is on the **bare** name, deliberately
 * unqualified by platform, because a game owned on PS5 with trophies only on
 * PS4 is one game. Qualifying by platform here would print it twice.
 */
test('a cross-gen title owned on PS5 with PS4 trophies stays one row', () => {
  const merged = unplayedBuild(
    [purchased('Ghost of Tsushima', 'PS5')],
    [trophied('Ghost of Tsushima', 'PS4')],
    NO_PLAY,
  );
  expect(names(merged)).toStrictEqual([]);
});

test('the loose name pass catches the editions the two lists disagree about', () => {
  const cases: [string, string][] = [
    ['Dark Souls III', 'Dark Souls 3'],
    ['Control Ultimate Edition', 'Control'],
    ['Death Stranding Director’s Cut', 'Death Stranding'],
    ['The Last of Us Remastered', 'The Last of Us'],
    ['NieR:Automata', 'NieR Automata'],
  ];

  for (const [owned, withTrophies] of cases)
    expect(
      names(
        unplayedBuild([purchased(owned)], [trophied(withTrophies)], NO_PLAY),
      ),
      `${owned} should match ${withTrophies}`,
    ).toStrictEqual([]);
});

test('a subtitle naming a different game is not merged away', () => {
  // The edition strips are deliberately a fixed list, so this pair must stay
  // two games — collapsing them is the failure mode that list exists to avoid.
  const merged = unplayedBuild(
    [purchased('Metal Gear Solid V: The Phantom Pain')],
    [trophied('Metal Gear Solid V: Ground Zeroes')],
    NO_PLAY,
  );
  expect(names(merged)).toStrictEqual(['Metal Gear Solid V: The Phantom Pain']);
});

/**
 * One game is commonly two entitlements — a base game and its PS5 upgrade —
 * and nothing in the trophy list can dedupe those, because neither has a
 * trophy record. The merge has to guard the owned list against itself.
 */
test('two entitlements of the same game yield one row', () => {
  const merged = unplayedBuild(
    [
      purchased('Returnal', 'PS4', 'CUSA00001_00'),
      purchased('Returnal', 'PS5', 'PPSA00001_00'),
    ],
    [],
    NO_PLAY,
  );
  expect(names(merged)).toStrictEqual(['Returnal']);
});

test('playtime is joined onto an added title when the feed has it', () => {
  const record = { playedAt: '2026-02-02T00:00:00.000Z', seconds: 7200 };
  const played: PlayIndex = {
    byName: new Map(),
    byNamePlatform: new Map([['stray|PS5', record]]),
  };

  const [game] = unplayedBuild([purchased('Stray', 'PS5')], [], played);
  expect(game?.playSeconds).toBe(7200);
  expect(game?.playedAt).toBe(record.playedAt);
});

test('a missed playtime join is null, never zero', () => {
  const [game] = unplayedBuild([purchased('Stray', 'PS5')], [], NO_PLAY);
  // Zero would print as "0m played" for a game the feed simply has no row for.
  expect(game?.playSeconds).toBe(null);
  expect(game?.playedAt).toBe(null);
});
