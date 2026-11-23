import { expect, it } from 'vitest';

import { compareLayers } from './keyboard.ts';

// an order that differs from the daemon's on purpose: the tabs follow the order the answer carries
it('reads hyper first, then cmd ahead of the rest in the sent order, no modifier last', () => {
  const layers = ['', 'opt', 'opt+cmd', 'ctrl', 'cmd', 'hyper', 'ctrl+opt'];

  expect(
    [...layers].sort(compareLayers(['hyper', 'opt', 'ctrl', 'cmd'])),
  ).toEqual(['hyper', 'cmd', 'opt+cmd', 'opt', 'ctrl', 'ctrl+opt', '']);
});
