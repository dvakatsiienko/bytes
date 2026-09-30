import { expect, test } from 'vitest';

import { integerScale, pixelZooms } from './pixels.ts';

test('a piece that fits sits at the largest whole zoom', () => {
  expect(integerScale({ h: 200, w: 200 }, 900, 500)).toBe(2);
});

test('a piece bigger than the room scales down to fit', () => {
  expect(integerScale({ h: 512, w: 512 }, 900, 384)).toBe(0.75);
});

test('a 16 px pixel view fits at the largest whole zoom and offers the steps below it', () => {
  expect(pixelZooms(16, 1000, 500)).toEqual({ fit: 31, steps: [1, 8, 24] });
});

test('a pixel view never offers a step that would not fit', () => {
  expect(pixelZooms(64, 1000, 500)).toEqual({ fit: 7, steps: [1] });
});
