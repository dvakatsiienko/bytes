import { afterEach, expect, test, vi } from 'vitest';

import { routeResolve } from './routes.ts';

const report = (body: unknown) =>
  routeResolve(new URL('http://localhost/api/client-error'), 'POST', {
    body,
    headers: {},
  });

test('a render error the browser reports lands in the server log', async () => {
  const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);

  await report({ message: 'boom', path: '/campaign', stack: 'at Chart' });

  expect(log).toHaveBeenCalledWith('client render error', {
    message: 'boom',
    path: '/campaign',
    stack: 'at Chart',
  });
});

test('an oversized report is clipped before it reaches the log', async () => {
  const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);

  await report({ message: 'm'.repeat(10_000), stack: 's'.repeat(100_000) });

  expect(log).toHaveBeenLastCalledWith('client render error', {
    message: 'm'.repeat(500),
    path: null,
    stack: 's'.repeat(4000),
  });
});

afterEach(() => {
  vi.useRealTimers();
});

test('past twenty reports a minute, the log stays quiet', async () => {
  // A fresh window: the tests above already spent part of this one.
  vi.useFakeTimers();
  vi.setSystemTime(Date.now() + 120_000);
  const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);

  for (let post = 0; post < 30; post += 1)
    // biome-ignore lint/performance/noAwaitInLoops: each post counts in order
    await report({ message: `flood ${post}` });

  expect(log).toHaveBeenCalledTimes(20);
});
