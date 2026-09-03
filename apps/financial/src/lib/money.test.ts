import assert from 'node:assert/strict';
import { test } from 'node:test';

import { centsToUsd, usdToCents } from './money.ts';

test('usdToCents', () => {
  assert.equal(usdToCents('1,234,567.89'), 123_456_789);
  assert.equal(usdToCents('0.5'), 50);
  assert.equal(usdToCents('12'), 1200);
  assert.equal(usdToCents('12.'), 1200);
  assert.equal(usdToCents('1234567.89'), 123_456_789); // the float trap: * 100 gives …88.99999999
  assert.equal(usdToCents(''), null);
  assert.equal(usdToCents('abc'), null);
  assert.equal(usdToCents('1.234'), null);
  assert.equal(usdToCents('-5'), null);
});

test('centsToUsd', () => {
  assert.equal(centsToUsd(123_456_789), '1,234,567.89');
  assert.equal(centsToUsd(50), '0.50');
  assert.equal(centsToUsd(1200), '12.00');
  assert.equal(centsToUsd(5), '0.05');
});
