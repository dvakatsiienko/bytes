import { describe, expect, test, vi } from 'vitest';

vi.mock('node:dns', () => ({
  lookup: vi.fn((_host: string, _options: unknown, cb: LookupCb) =>
    cb(Object.assign(new Error('not found'), { code: 'ENOTFOUND' }), '', 0),
  ),
  resolve4: vi.fn((_host: string, cb: ResolveCb) => cb(null, ['23.219.79.68'])),
  resolve6: vi.fn((_host: string, cb: ResolveCb) => cb(null, [])),
}));

const { lookupResilient, resolverExplain } = await import('./resolver.ts');

describe('lookupResilient', () => {
  test('answers from the nameserver when the system resolver says ENOTFOUND', async () => {
    const answer = await new Promise<[string | unknown[], number?]>(
      (resolve, reject) =>
        lookupResilient('ca.account.sony.com', {}, (error, address, family) =>
          error ? reject(error) : resolve([address, family]),
        ),
    );
    expect(answer).toEqual(['23.219.79.68', 4]);
  });
});

describe('resolverExplain', () => {
  test('names the host and the flush command for a resolver failure', () => {
    const error = new TypeError('fetch failed', {
      cause: Object.assign(new Error('getaddrinfo ENOTFOUND'), {
        code: 'ENOTFOUND',
        hostname: 'ca.account.sony.com',
      }),
    });
    expect(resolverExplain(error)).toMatch(EXPLAINED);
  });

  test('stays silent for any other failure', () => {
    expect(resolverExplain(new TypeError('fetch failed'))).toBeNull();
  });
});

/* Helpers */
const EXPLAINED =
  /^ENOTFOUND for ca\.account\.sony\.com — .*killall -HUP mDNSResponder$/;

/* Types */
type LookupCb = (error: Error | null, address: string, family: number) => void;
type ResolveCb = (error: Error | null, addresses: string[]) => void;
