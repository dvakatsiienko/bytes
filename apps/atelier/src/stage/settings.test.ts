import { expect, test } from 'vitest';

import { defaults, toSettings } from './settings.ts';

test('a saved set keeps its valid values', () => {
  expect(
    toSettings({ exposure: 1.4, look: 'agx', sunTint: '#FFD978' }),
  ).toMatchObject({
    exposure: 1.4,
    look: 'agx',
    sunTint: '#ffd978',
  });
});

test('a value of the wrong type falls back to the default', () => {
  expect(
    toSettings({ exposure: 'bright', hasLens: 'yes', seed: Number.NaN }),
  ).toMatchObject({
    exposure: defaults.exposure,
    hasLens: defaults.hasLens,
    seed: defaults.seed,
  });
});

test('an unknown look falls back to exact', () => {
  expect(toSettings({ look: 'sepia' }).look).toBe('exact');
});

test('a tint that is not a six-digit hex falls back to white', () => {
  expect(toSettings({ sunTint: 'red' }).sunTint).toBe('#ffffff');
});

test('anything that is not an object is the defaults', () => {
  expect(toSettings('xfasdf1.00')).toEqual(defaults);
});

test('a number outside its control range is held at the range', () => {
  expect(toSettings({ ambient: -4, exposure: 1e9 })).toMatchObject({
    ambient: 0.2,
    exposure: 2,
  });
});

test('the seed is a whole number', () => {
  expect(toSettings({ seed: 0.5 }).seed).toBe(1);
});
