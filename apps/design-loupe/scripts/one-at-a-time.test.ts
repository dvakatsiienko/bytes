import { describe, expect, it } from 'vitest';

import { oneAtATime } from './one-at-a-time.ts';

describe('oneAtATime', () => {
  it('never runs two passes at once', async () => {
    let running = 0;
    let most = 0;
    const run = oneAtATime(async () => {
      running += 1;
      most = Math.max(most, running);
      await new Promise((resolve) => setTimeout(resolve, 10));
      running -= 1;
    });
    await Promise.all([run(), run(), run()]);
    expect(most).toBe(1);
  });

  it('runs one more pass for every burst that lands mid-pass', async () => {
    let passes = 0;
    const run = oneAtATime(async () => {
      passes += 1;
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
    await Promise.all([run(), run(), run(), run()]);
    expect(passes).toBe(2);
  });
});
