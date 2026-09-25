import { expect, test } from 'vitest';

import type { Route } from './route.ts';
import { parseRoute, pathOf } from './route.ts';

const routes: Route[] = [
  { piece: 'homestead', view: { kind: 'live' } },
  { piece: 'market', view: { kind: 'take', take: '03-night-glow' } },
  { piece: 'sign-cv', view: { a: '01-day', b: '02-day', kind: 'compare' } },
];

test.each(routes)(
  '$piece $view.kind survives a trip through its path',
  (route) => {
    expect(parseRoute(pathOf(route))).toEqual(route);
  },
);

test('a take path without an id is the live view', () => {
  expect(parseRoute('/market/take')).toEqual({
    piece: 'market',
    view: { kind: 'live' },
  });
});
