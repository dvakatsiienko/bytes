import { describe, expect, it } from 'vitest';

import { boardPath, isTrustedRequest } from './plugin.ts';

describe('boardPath', () => {
  it('serves a file inside the boards folder', () => {
    expect(boardPath('/job/boards', '/Main.dc.html')).toBe(
      '/job/boards/Main.dc.html',
    );
  });

  it('refuses a path that climbs out, even encoded', () => {
    expect(boardPath('/job/boards', '/..%2F..%2Fasks.json')).toBeNull();
  });
});

describe('isTrustedRequest', () => {
  const write = { 'content-type': 'application/json', host: 'localhost:5181' };

  it('takes a json write from its own page', () => {
    expect(
      isTrustedRequest({
        headers: { ...write, origin: 'http://localhost:5181' },
        method: 'POST',
      }),
    ).toBe(true);
  });

  it('refuses a write from another origin', () => {
    expect(
      isTrustedRequest({
        headers: { ...write, origin: 'http://evil.test' },
        method: 'POST',
      }),
    ).toBe(false);
  });

  it('refuses a write that is not json', () => {
    expect(
      isTrustedRequest({ headers: { host: 'localhost:5181' }, method: 'POST' }),
    ).toBe(false);
  });
});
