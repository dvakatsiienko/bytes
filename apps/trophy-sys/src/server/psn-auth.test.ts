import { beforeEach, expect, test, vi } from 'vitest';

import { NPSSO_INVALID } from '../shared/types.ts';

const store = vi.hoisted(() => ({
  dead: 'D'.repeat(64),
  live: 'L'.repeat(64),
  npsso: '',
  writeSafe: false,
}));

vi.mock('psn-api', () => ({
  exchangeAccessCodeForAuthTokens: vi.fn(() =>
    Promise.resolve({
      accessToken: 'access',
      expiresIn: 3600,
      refreshToken: 'refresh',
      refreshTokenExpiresIn: 863_999,
    }),
  ),
  exchangeNpssoForAccessCode: vi.fn((npsso: string) =>
    npsso === store.live
      ? Promise.resolve('access-code')
      : Promise.reject(
          new Error(
            'There was a problem retrieving your PSN access code. Is your NPSSO code valid?',
          ),
        ),
  ),
  exchangeRefreshTokenForAuthTokens: vi.fn(() => Promise.resolve({})),
}));

vi.mock('./state.ts', () => ({
  get isAutoWriteSafe() {
    return store.writeSafe;
  },
  npssoDeathRecord: vi.fn(),
  npssoLoad: () => Promise.resolve(store.npsso),
  refreshGrantDeathRecord: vi.fn(),
  refreshGrantLoad: () => Promise.resolve(null),
  refreshGrantSave: vi.fn(),
}));

const { authGet, sessionReset } = await import('./psn.ts');
const { npssoDeathRecord } = await import('./state.ts');

beforeEach(() => {
  sessionReset();
  vi.mocked(npssoDeathRecord).mockClear();
  store.npsso = store.dead;
  store.writeSafe = false;
});

test('a token renewed in the store reaches a warm process on its next call', async () => {
  await expect(authGet()).rejects.toThrow(NPSSO_INVALID);

  // Another instance took the paste: this process gets no reset, only the store.
  store.npsso = store.live;

  await expect(authGet()).resolves.toEqual({ accessToken: 'access' });
});

test('a refused token is recorded when the process owns its store', async () => {
  store.writeSafe = true;

  await expect(authGet()).rejects.toThrow(NPSSO_INVALID);

  expect(npssoDeathRecord).toHaveBeenCalledWith(store.dead);
});

test("a refused token writes no death when the store is not this process's own", async () => {
  await expect(authGet()).rejects.toThrow(NPSSO_INVALID);

  expect(npssoDeathRecord).not.toHaveBeenCalled();
});
