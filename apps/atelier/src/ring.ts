import type { ControlRow, Settings } from './stage/settings.ts';
import { controls } from './stage/settings.ts';

/** the four edges of the lens ring, one setting group each, with the key that opens it */
export const edges = [
  { id: 'light', key: '1', side: 'top' },
  { id: 'lens', key: '2', side: 'right' },
  { id: 'atmosphere', key: '3', side: 'bottom' },
  { id: 'toggles', key: '4', side: 'left' },
] as const;

/**
 * One thing open at a time: an edge, or the film strip, which takes the
 * bottom edge's place. Opening one folds the other; opening it again folds it.
 */
export const toggleRing = (open: RingOpen, next: Openable): RingOpen =>
  open === next ? null : next;

export const rowsOf = (edge: Edge) =>
  controls.find((group) => group.title === edge)?.rows ?? [];

/** every setting whose label or key holds the words, across all four edges and the piece */
export const findSettings = (query: string): readonly FoundRow[] => {
  const words = query.toLowerCase().split(SPACES).filter(Boolean);
  if (words.length === 0) return [];
  return controls.flatMap((group) =>
    group.rows
      .filter((row) => {
        const text = `${row.label} ${row.key}`.toLowerCase();
        return words.every((word) => text.includes(word));
      })
      .map((row) => ({ group: group.title, row })),
  );
};

export const settingCount = controls.reduce(
  (count, group) => count + group.rows.length,
  0,
);

/** what a folded edge says about itself: how many toggles are on, or its first value */
export const edgeSummary = (edge: Edge, settings: Settings) => {
  const rows = rowsOf(edge);
  if (edge === 'toggles') {
    const on = rows.filter((row) => settings[row.key] === true).length;
    return `${on} of ${rows.length} on`;
  }
  const [first] = rows;
  return first ? `${first.label} ${formatValue(first, settings)}` : '';
};

export const formatValue = (row: ControlRow, settings: Settings) => {
  const value = settings[row.key];
  if (typeof value === 'boolean') return value ? 'on' : 'off';
  if (typeof value === 'number' && row.kind === 'number')
    return value.toFixed(decimalsOf(row.step));
  return String(value);
};

/* Helpers */

const SPACES = /\s+/;

const decimalsOf = (step: number) =>
  step >= 1 ? 0 : (String(step).split('.')[1]?.length ?? 0);

/* Types */

export type Edge = (typeof edges)[number]['id'];
export type Openable = Edge | 'takes';
export type RingOpen = Openable | null;

export interface FoundRow {
  group: (typeof controls)[number]['title'];
  row: ControlRow;
}
