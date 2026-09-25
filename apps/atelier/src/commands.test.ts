import { expect, test } from 'vitest';

import type { StudioActions } from './actions.ts';
import { commandsOf } from './commands.ts';

const noop = () => undefined;

test('no two commands share a bare key', () => {
  const actions = new Proxy(
    {
      isPlaying: false,
      isStage: true,
      pieces: [],
      theme: 'system',
    } as unknown as StudioActions,
    {
      get: (target, key) =>
        key in target ? target[key as keyof StudioActions] : noop,
    },
  );

  const keys = commandsOf(actions).flatMap((command) =>
    command.keys ? [command.keys] : [],
  );

  expect(new Set(keys).size).toBe(keys.length);
});
