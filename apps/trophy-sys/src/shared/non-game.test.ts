import { expect, test } from 'vitest';

import { isNonGame } from './types.ts';

/**
 * This rule hides titles on its own, so its failure mode is hiding a real game.
 * Every case here is a name from the owned library, and the false-positive ones
 * are the reason the override exists.
 */

test('the three shapes psn actually ships', () => {
  expect(isNonGame('The Alters: Original Soundtrack')).toBeTruthy();
  expect(isNonGame('Ravenswatch - Digital Artbook')).toBeTruthy();
  expect(isNonGame('ELDEN RING Digital Artbook & Soundtrack')).toBeTruthy();
});

test('casing is not part of the match', () => {
  expect(
    isNonGame('ARMORED CORE™ VI FIRES OF RUBICON™ Digital Artbook'),
  ).toBeTruthy();
  expect(
    isNonGame('god of war ragnarök digital artbook and soundtrack'),
  ).toBeTruthy();
});

test('«art book» spelled apart still matches', () => {
  expect(isNonGame('Some Title Digital Art Book')).toBeTruthy();
});

test('a real game keeps its place', () => {
  expect(!isNonGame('Ghost of Tsushima DIRECTOR’S CUT')).toBeTruthy();
  expect(!isNonGame('Rogue Legacy 2')).toBeTruthy();
  expect(!isNonGame('ELDEN RING')).toBeTruthy();
});

test('«ost» is not a pattern, because it lives inside Ghost', () => {
  expect(
    !isNonGame('Ghost of Tsushima'),
    'the substring that would claim a real game is deliberately absent',
  ).toBeTruthy();
});
