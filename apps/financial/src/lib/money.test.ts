import { expect, test } from 'vitest';

import { centsToUsd, usdToCents } from './money.ts';

test('usdToCents', () => {
  expect(usdToCents('1,234,567.89')).toBe(123_456_789);
  expect(usdToCents('0.5')).toBe(50);
  expect(usdToCents('12')).toBe(1200);
  expect(usdToCents('12.')).toBe(1200);
  expect(usdToCents('1234567.89')).toBe(123_456_789); // the float trap: * 100 gives …88.99999999
  expect(usdToCents('')).toBe(null);
  expect(usdToCents('abc')).toBe(null);
  expect(usdToCents('1.234')).toBe(null);
  expect(usdToCents('-5')).toBe(null);
});

test('centsToUsd', () => {
  expect(centsToUsd(123_456_789)).toBe('1,234,567.89');
  expect(centsToUsd(50)).toBe('0.50');
  expect(centsToUsd(1200)).toBe('12.00');
  expect(centsToUsd(5)).toBe('0.05');
});
