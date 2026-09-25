import { expect, test } from 'vitest';

import { modalityOf } from './modality.ts';

const inField = {
  closest: () => ({}),
  isContentEditable: false,
} as unknown as EventTarget;

test('a pointer press means pointer, a navigation key means keyboard', () => {
  expect(modalityOf({ target: null, type: 'pointerdown' })).toBe('pointer');
  for (const key of ['Tab', 'ArrowDown', 'Enter', ' ', 'Escape'])
    expect(modalityOf({ key, target: null, type: 'keydown' })).toBe('keyboard');
});

test('typing, even caret keys inside a field, changes nothing; only Tab leaves the field as keyboard', () => {
  expect(modalityOf({ key: 'a', target: null, type: 'keydown' })).toBeNull();
  expect(modalityOf({ key: 'k', target: null, type: 'keydown' })).toBeNull();
  for (const key of ['ArrowLeft', 'Enter', ' '])
    expect(modalityOf({ key, target: inField, type: 'keydown' })).toBeNull();
  expect(modalityOf({ key: 'Tab', target: inField, type: 'keydown' })).toBe(
    'keyboard',
  );
});
