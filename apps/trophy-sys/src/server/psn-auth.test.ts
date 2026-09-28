import { beforeEach, expect, test, vi } from 'vitest';

import { NPSSO_INVALID } from '../shared/types.ts';

const store = vi.hoisted(() => ({
  dead: 'D'.repeat(64),
  grant: null as null | {
    expiresIn: number;
    mintedAt: number;
    mintedExpiresIn: number;
    refreshedAt: number;
    token: string;
  },
  live: 'L'.repeat(64),
  npsso: '',
  /** Seconds PSN says the stored grant has left when it is refreshed. */
  refreshLeft: 0,
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
  exchangeRefreshTokenForAuthTokens: vi.fn(() =>
    Promise.resolve(
      store.grant
        ? {
            accessToken: 'refreshed',
            expiresIn: 3600,
            refreshToken: store.grant.token,
            refreshTokenExpiresIn: store.refreshLeft,
          }
        : {},
    ),
  ),
}));

vi.mock('./state.ts', () => ({
  get isAutoWriteSafe() {
    return store.writeSafe;
  },
  npssoDeathRecord: vi.fn(),
  npssoLoad: () => Promise.resolve(store.npsso),
  refreshGrantDeathRecord: vi.fn(),
  refreshGrantLoad: () => Promise.resolve(store.grant),
  refreshGrantSave: vi.fn(),
}));

const { authGet, sessionReset } = await import('./psn.ts');
const { exchangeNpssoForAccessCode } = await import('psn-api');
const { npssoDeathRecord, refreshGrantSave } = await import('./state.ts');

const DAY_S = 86_400;

/** A stored grant minted `age` days ago, with `left` days PSN still claims. */
const grantStore = (age: number, left: number) => {
  store.grant = {
    expiresIn: left * DAY_S,
    mintedAt: Date.now() - age * DAY_S * 1000,
    mintedExpiresIn: 863_999,
    refreshedAt: Date.now(),
    token: 'old-grant',
  };
  store.refreshLeft = left * DAY_S;
};

beforeEach(() => {
  sessionReset();
  vi.mocked(npssoDeathRecord).mockClear();
  vi.mocked(refreshGrantSave).mockClear();
  vi.mocked(exchangeNpssoForAccessCode).mockClear();
  store.grant = null;
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

test('a grant with more than three days left is refreshed and the npsso is not spent', async () => {
  grantStore(6, 4);
  store.npsso = store.live;

  await expect(authGet()).resolves.toEqual({ accessToken: 'refreshed' });
  expect(exchangeNpssoForAccessCode).not.toHaveBeenCalled();
});

test('a refresh that reports no expiry is not read as zero days left', async () => {
  grantStore(1, 9);
  store.refreshLeft = Number.NaN;
  store.npsso = store.live;

  await expect(authGet()).resolves.toEqual({ accessToken: 'refreshed' });
  expect(exchangeNpssoForAccessCode).not.toHaveBeenCalled();
});

test('a grant with three days left is re-minted early from a live npsso', async () => {
  grantStore(7, 3);
  store.npsso = store.live;
  store.writeSafe = true;

  await expect(authGet()).resolves.toEqual({ accessToken: 'access' });
  expect(vi.mocked(refreshGrantSave).mock.calls[0]?.[0]).toMatchObject({
    expiresIn: 863_999,
    token: 'refresh',
  });
});

test('a dead npsso found early is recorded, and the old grant keeps the app up', async () => {
  grantStore(8, 2);
  store.writeSafe = true;

  await expect(authGet()).resolves.toEqual({ accessToken: 'refreshed' });
  expect(npssoDeathRecord).toHaveBeenCalledWith(store.dead);
  expect(vi.mocked(refreshGrantSave).mock.calls[0]?.[0]).toMatchObject({
    token: 'old-grant',
  });
});
