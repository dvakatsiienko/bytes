import { describe, expect, it } from 'vitest';

import type { Take, TakeList } from '../server/takes.ts';
import { filterTakes, takeFilters } from './takes.ts';

const takeOf = (id: string, isStashed = false) =>
  ({
    id,
    stash: isStashed ? { good: 'g', notYet: 'n' } : null,
  }) as Take;
const list: TakeList = {
  current: { day: '01-day', night: '04-night' },
  takes: [
    takeOf('05-day', true),
    takeOf('04-night'),
    takeOf('03-day', true),
    takeOf('02-night'),
    takeOf('01-day'),
  ],
};
const idsOf = (takes: readonly Take[]) => takes.map((take) => take.id);

describe('filterTakes', () => {
  it('keeps exactly the takes each filter names, newest first', () => {
    const expected = {
      all: ['05-day', '04-night', '03-day', '02-night', '01-day'],
      current: ['04-night', '01-day'],
      stashed: ['05-day', '03-day'],
    };
    for (const filter of takeFilters)
      expect(idsOf(filterTakes(list, filter))).toEqual(expected[filter]);
  });
});
