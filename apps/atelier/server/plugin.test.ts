import { expect, test } from 'vitest';

import { isTrustedRequest } from './plugin.ts';

const host = 'localhost:5190';

test('a write from the studio page itself is trusted', () => {
  expect(
    isTrustedRequest({
      headers: {
        'content-type': 'application/json',
        host,
        origin: `http://${host}`,
      },
      method: 'POST',
    }),
  ).toBe(true);
});

test('a write from another site is refused', () => {
  expect(
    isTrustedRequest({
      headers: {
        'content-type': 'application/json',
        host,
        origin: 'https://evil.example',
      },
      method: 'POST',
    }),
  ).toBe(false);
});

test('a write that is not json is refused, since a page elsewhere can send text without asking', () => {
  expect(
    isTrustedRequest({
      headers: { 'content-type': 'text/plain', host },
      method: 'POST',
    }),
  ).toBe(false);
});

test('a read needs no checks', () => {
  expect(
    isTrustedRequest({
      headers: { host, origin: 'https://evil.example' },
      method: 'GET',
    }),
  ).toBe(true);
});
