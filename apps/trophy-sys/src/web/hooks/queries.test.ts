import { QueryObserver } from '@tanstack/react-query';
import { expect, test, vi } from 'vitest';

import { NPSSO_INVALID } from '../../shared/types.ts';
import { queryClientCreate } from './queries.ts';

test('a success elsewhere refetches a query stuck on the dead-token error', async () => {
  const client = queryClientCreate();
  let tokenLive = false;

  const profile = new QueryObserver(client, {
    queryFn: () =>
      tokenLive
        ? Promise.resolve('profile')
        : Promise.reject(new Error(NPSSO_INVALID)),
    queryKey: ['profile'],
    retry: false,
  });
  const unsubscribe = profile.subscribe(() => undefined);
  await vi.waitFor(() => expect(profile.getCurrentResult().isError).toBe(true));

  tokenLive = true;
  await client.fetchQuery({
    queryFn: () => Promise.resolve([]),
    queryKey: ['games'],
  });

  await vi.waitFor(() =>
    expect(profile.getCurrentResult().data).toBe('profile'),
  );
  unsubscribe();
});

test('a dead-token error is not retried', async () => {
  const client = queryClientCreate();
  let calls = 0;

  await client
    .fetchQuery({
      queryFn: () => {
        calls += 1;
        return Promise.reject(new Error(NPSSO_INVALID));
      },
      queryKey: ['profile'],
      retryDelay: 0,
    })
    .catch(() => undefined);

  expect(calls).toBe(1);
});

test('any other failure is retried once', async () => {
  const client = queryClientCreate();
  let calls = 0;

  await client
    .fetchQuery({
      queryFn: () => {
        calls += 1;
        return Promise.reject(new Error('psn timed out'));
      },
      queryKey: ['games'],
      retryDelay: 0,
    })
    .catch(() => undefined);

  expect(calls).toBe(2);
});

test('a success that needs no PSN leaves the stuck query alone', async () => {
  const client = queryClientCreate();
  let calls = 0;

  const profile = new QueryObserver(client, {
    queryFn: () => {
      calls += 1;
      return Promise.reject(new Error(NPSSO_INVALID));
    },
    queryKey: ['profile'],
  });
  const unsubscribe = profile.subscribe(() => undefined);
  await vi.waitFor(() => expect(profile.getCurrentResult().isError).toBe(true));

  // /settings answers from the store while PSN refuses everything.
  await client.fetchQuery({
    queryFn: () => Promise.resolve({}),
    queryKey: ['settings'],
  });
  await new Promise((resolve) => setTimeout(resolve, 50));

  expect(calls).toBe(1);
  unsubscribe();
});
