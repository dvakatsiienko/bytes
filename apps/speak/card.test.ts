import { expect, it } from 'vitest';

import { cardOf } from './src/card.ts';

const card = { engine: 'kokoro', read: 7 };

it.each([
  ['its read plays', card, { read: 7 }, card],
  ['another read took over', card, { read: 8 }, undefined],
  ['nothing plays', card, {}, undefined],
  ['the daemon does not answer', card, undefined, undefined],
  ['nothing was pressed', undefined, { read: 7 }, undefined],
  ['nothing was pressed and nothing plays', undefined, {}, undefined],
])('a card while %s', (_, started, status, lit) => {
  expect(cardOf(started, status)).toBe(lit);
});
