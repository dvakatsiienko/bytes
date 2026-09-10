import assert from 'node:assert/strict';
import { test } from 'node:test';

import { isNonGame } from './types.ts';

/**
 * This rule hides titles on its own, so its failure mode is hiding a real game.
 * Every case here is a name from the owned library, and the false-positive ones
 * are the reason the override exists.
 */

test('the three shapes psn actually ships', () => {
  assert.ok(isNonGame('The Alters: Original Soundtrack'));
  assert.ok(isNonGame('Ravenswatch - Digital Artbook'));
  assert.ok(isNonGame('ELDEN RING Digital Artbook & Soundtrack'));
});

test('casing is not part of the match', () => {
  assert.ok(isNonGame('ARMORED CORE™ VI FIRES OF RUBICON™ Digital Artbook'));
  assert.ok(isNonGame('god of war ragnarök digital artbook and soundtrack'));
});

test('«art book» spelled apart still matches', () => {
  assert.ok(isNonGame('Some Title Digital Art Book'));
});

test('a real game keeps its place', () => {
  assert.ok(!isNonGame('Ghost of Tsushima DIRECTOR’S CUT'));
  assert.ok(!isNonGame('Rogue Legacy 2'));
  assert.ok(!isNonGame('ELDEN RING'));
});

test('«ost» is not a pattern, because it lives inside Ghost', () => {
  assert.ok(
    !isNonGame('Ghost of Tsushima'),
    'the substring that would claim a real game is deliberately absent',
  );
});
