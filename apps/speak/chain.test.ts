import { expect, it } from 'vitest';

import { chainAfterDrag, isDropUndone } from './src/chain.ts';

const chain = {
  en: ['kokoro', 'fish', 'system', 'elevenlabs'],
  ru: ['elevenlabs', 'system'],
  uk: ['elevenlabs', 'system'],
};

// what dnd-kit hands a drag-over: the card held and the card under it, each with the place it stands in
const over = (source: string, target: string, held = {}) => {
  const card = (id: string) => {
    const [group = '', engine = ''] = id.split(':');
    const index = chain[group as keyof typeof chain].indexOf(engine);
    return { group, id, index, initialGroup: group, initialIndex: index };
  };
  return {
    operation: {
      canceled: false,
      source: {
        ...card(source),
        manager: {
          dragOperation: { position: { current: { x: 0, y: 0 } }, shape: null },
        },
        ...held,
      },
      target: card(target),
    },
    preventDefault: () => undefined,
  } as unknown as Parameters<typeof chainAfterDrag>[1];
};

it.each([
  ["en's system over uk's elevenlabs", 'en:system', 'uk:elevenlabs', {}],
  ["en's kokoro over uk's system", 'en:kokoro', 'uk:system', {}],
  ["uk's elevenlabs over en's kokoro", 'uk:elevenlabs', 'en:kokoro', {}],
  [
    'a card dnd-kit already moved into another column',
    'en:system',
    'uk:elevenlabs',
    { group: 'uk', index: 0 },
  ],
  [
    'a card moved into another column, over itself',
    'en:system',
    'en:system',
    { group: 'uk', index: 0 },
  ],
])('%s changes no chain', (_, source, target, held) => {
  expect(chainAfterDrag(chain, over(source, target, held))).toEqual(chain);
});

it('a drop in its own column moves that column alone', () => {
  expect(chainAfterDrag(chain, over('en:kokoro', 'en:system'))).toEqual({
    ...chain,
    en: ['fish', 'system', 'kokoro', 'elevenlabs'],
  });
});

it('a card its own column already moved keeps that place', () => {
  expect(
    chainAfterDrag(chain, over('en:kokoro', 'en:kokoro', { index: 1 })),
  ).toEqual({ ...chain, en: ['fish', 'kokoro', 'system', 'elevenlabs'] });
});

it('a drag over nothing changes no chain', () => {
  const event = over('en:kokoro', 'en:system');
  expect(
    chainAfterDrag(chain, {
      ...event,
      operation: { ...event.operation, target: null },
    } as typeof event),
  ).toEqual(chain);
});

it.each([
  // the pointer's column, the card under it, undone
  ["over another column's card", 'uk', null, true],
  [
    "over another column's card, its own still under the held card's edge",
    'uk',
    'en:fish',
    true,
  ],
  ['outside every column, over nothing', undefined, null, true],
  [
    "beside its column, the held card's edge over its own cards",
    undefined,
    'en:fish',
    false,
  ],
  ['over a card of its own column', 'en', 'en:system', false],
  ['over nothing in its own column, a gap or the off cards', 'en', null, false],
])('a drop %s', (_, column, target, isUndone) => {
  const operation = {
    source: { id: 'en:kokoro' },
    target: target ? { id: target } : null,
  };
  expect(isDropUndone({ canceled: false, operation }, column)).toBe(isUndone);
});

it('a cancel is undone wherever it comes', () => {
  const card = { id: 'en:kokoro' };
  expect(
    isDropUndone(
      { canceled: true, operation: { source: card, target: card } },
      'en',
    ),
  ).toBe(true);
});

it.each([
  ['uk', { id: 'en:system' }],
  [undefined, null],
])(
  'a key drop stays, wherever the page scrolled under it (%s)',
  (column, target) => {
    const operation = {
      activatorEvent: { type: 'keydown' },
      source: { id: 'en:kokoro' },
      target,
    };
    expect(isDropUndone({ canceled: false, operation }, column)).toBe(false);
  },
);
