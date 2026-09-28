import { expect, test, vi } from 'vitest';

import { NPSSO_INVALID } from '../shared/types.ts';

const store = vi.hoisted(() => ({
  live: 'L'.repeat(64),
  npsso: 'D'.repeat(64),
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
  isAutoWriteSafe: false,
  npssoDeathRecord: vi.fn(),
  npssoLoad: () => Promise.resolve(store.npsso),
  refreshGrantDeathRecord: vi.fn(),
  refreshGrantLoad: () => Promise.resolve(null),
  refreshGrantSave: vi.fn(),
}));

const { authGet } = await import('./psn.ts');

test('a token renewed in the store reaches a warm process on its next call', async () => {
  await expect(authGet()).rejects.toThrow(NPSSO_INVALID);

  // Another instance took the paste: this process gets no reset, only the store.
  store.npsso = store.live;

  await expect(authGet()).resolves.toEqual({ accessToken: 'access' });
});
