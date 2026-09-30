import { expect, test } from 'vitest';

import type { Openable, RingOpen } from './ring.ts';
import { edgeSummary, findSettings, toggleRing } from './ring.ts';
import type { ControlRow } from './stage/settings.ts';
import { controls, defaults } from './stage/settings.ts';

test('every setting has exactly one control on the ring', () => {
  const keys = controls.flatMap((group) => group.rows.map((row) => row.key));
  expect(keys.toSorted()).toEqual(Object.keys(defaults).toSorted());
});

test('find reaches every setting by its label', () => {
  const unreachable = controls
    .flatMap((group): readonly ControlRow[] => group.rows)
    .filter(
      (row) => !findSettings(row.label).some((hit) => hit.row.key === row.key),
    )
    .map((row) => row.key);
  expect(unreachable).toEqual([]);
});

test('find names the edge a setting lives on', () => {
  expect(findSettings('blur amount')).toEqual([
    expect.objectContaining({ group: 'lens' }),
  ]);
});

test('one thing is open at a time: a press opens it, the same press folds it', () => {
  const presses: Openable[] = [
    'light',
    'lens',
    'takes',
    'takes',
    'toggles',
    'toggles',
  ];
  let open: RingOpen = null;
  const seen = presses.map((press) => {
    open = toggleRing(open, press);
    return open;
  });
  expect(seen).toEqual(['light', 'lens', 'takes', null, 'toggles', null]);
});

test('the folded toggles edge says how many toggles are on', () => {
  const parts = edgeSummary('toggles', { ...defaults, hasLens: false });
  expect(parts.map((part) => part.text).join(' ')).toBe('9 of 11 on');
});
