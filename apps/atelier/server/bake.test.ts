import { EventEmitter } from 'node:events';
import { expect, test, vi } from 'vitest';

import { defaults } from '../src/stage/settings.ts';

// chromium itself is slow and needs an install CI only does for the kit; the
// subject here is the cache around it, so a launch hands out a fake browser
vi.mock('playwright', () => ({
  chromium: {
    launch: vi.fn(() => {
      const events = new EventEmitter();
      let isConnected = true;
      return Promise.resolve({
        close: () => {
          isConnected = false;
          events.emit('disconnected');
          return Promise.resolve();
        },
        isConnected: () => isConnected,
        on: (name: string, listener: () => void) => events.on(name, listener),
      });
    }),
  },
}));

const { getBrowser } = await import('./bake.ts');

test('a bake after chromium died gets a live browser, not the dead one', async () => {
  const first = await getBrowser();
  await first.close();

  const next = await getBrowser();

  expect(next.isConnected()).toBe(true);
});

const { bake } = await import('./bake.ts');

const NO_MOTION = /no motion/;

test('a loop of a scene with no motion is refused, not baked as a still', async () => {
  const load = (path: string) =>
    Promise.resolve(
      path === '/art/pieces.ts'
        ? { findPiece: () => ({ id: 'workshop', size: { h: 600, w: 1600 } }) }
        : { stageScenes: { workshop: { isStill: true } } },
    );

  await expect(
    bake({
      frames: 24,
      load,
      origin: 'http://localhost',
      piece: 'workshop',
      settings: defaults,
      time: 'night',
    }),
  ).rejects.toThrow(NO_MOTION);
});
