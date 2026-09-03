import type { Game, RemainingTrophy } from '../../shared/types.ts';
import type { ChartColumn } from '../components/chart-frame.tsx';
import { hoursFormat } from '../helpers/format.ts';
import { gameLookup } from '../helpers/stats.ts';
import type { BarChart } from './bar-rows.tsx';

/** Titles shown before the list stops being a weekly-open view. */
const LIMIT = 15;

/**
 * How much work a title still holds, in trophies. An incremental trophy counts
 * as the slice of it that is left, so a 47-of-100 collectible is 0.53 of a
 * trophy and not a whole one — which is the difference between "nearly there"
 * and "untouched" for the titles this list is meant to surface.
 */
const distanceOf = (left: RemainingTrophy[]) =>
  left.reduce(
    (total, trophy) =>
      total +
      (1 -
        (trophy.counter ? trophy.counter.current / trophy.counter.target : 0)),
    0,
  );

export const closestRows = (
  remaining: RemainingTrophy[],
  games: Game[],
): ClosestRow[] => {
  const byId = gameLookup(games);
  const grouped = new Map<string, RemainingTrophy[]>();

  for (const trophy of remaining) {
    const bucket = grouped.get(trophy.gameId);
    if (bucket) bucket.push(trophy);
    else grouped.set(trophy.gameId, [trophy]);
  }

  const rows: ClosestRow[] = [];

  for (const [gameId, left] of grouped) {
    const game = byId.get(gameId);
    if (!game) continue;

    // Rarest first: the rarest thing left is what actually decides whether a
    // title is finishable, so it leads the hover and the table row.
    const sorted = [...left].sort((a, b) => a.rarity - b.rarity);
    const counters = sorted.filter((trophy) => trophy.counter);

    rows.push({
      counters,
      distance: distanceOf(left),
      gameId,
      hours: (game.playSeconds ?? 0) / 3600,
      iconUrl: game.iconUrl,
      left: sorted,
      name: game.name,
      progress: game.progress,
      rarest: sorted[0] ?? null,
    });
  }

  return rows.sort((a, b) => a.distance - b.distance).slice(0, LIMIT);
};

export const closestChart = (rows: ClosestRow[]): BarChart => ({
  axis: { format: (value) => `${Math.round(value)}%`, max: 100 },
  bars: rows.map((row) => {
    const namedLeft = row.left
      .slice(0, 3)
      .map((trophy) => trophy.name)
      .join(', ');

    return {
      fraction: row.progress / 100,
      iconUrl: row.iconUrl,
      id: row.gameId,
      label: row.name,
      note: `still open: ${namedLeft}${row.left.length > 3 ? ` +${row.left.length - 3} more` : ''}`,
      rows: [
        { label: 'progress', value: `${row.progress}%` },
        {
          label: 'left',
          value: `${row.distance.toFixed(1)} of ${row.left.length}`,
        },
        {
          label: 'rarest left',
          value: row.rarest ? `${row.rarest.rarity}%` : '—',
        },
        { label: 'counters', value: counterFormat(row.counters) },
        { label: 'hours sunk', value: hoursFormat(row.hours) },
      ],
      tone: 'var(--p-yellow)',
      value: `${row.distance.toFixed(1)} left`,
    };
  }),
});

const counterFormat = (counters: ClosestRow['counters']) => {
  const [first] = counters;
  if (!first?.counter) return '—';

  const head = `${first.counter.current}/${first.counter.target}`;
  return counters.length > 1 ? `${head} +${counters.length - 1}` : head;
};

export const CLOSEST_COLUMNS: ChartColumn<ClosestRow>[] = [
  { cell: (row) => row.name, head: 'title' },
  { cell: (row) => `${row.progress}%`, head: 'progress', isNumeric: true },
  {
    cell: (row) => row.distance.toFixed(1),
    head: 'trophies left',
    isNumeric: true,
  },
  {
    cell: (row) => (row.rarest ? `${row.rarest.rarity}%` : '—'),
    head: 'rarest left',
    isNumeric: true,
  },
  { cell: (row) => row.rarest?.name ?? '—', head: 'that trophy' },
  { cell: (row) => counterFormat(row.counters), head: 'counters' },
  {
    cell: (row) => hoursFormat(row.hours),
    head: 'hours sunk',
    isNumeric: true,
  },
];

/* Types */
export interface ClosestRow {
  /** The unearned trophies that carry a live counter. */
  counters: RemainingTrophy[];
  /** Trophies still owed, counting a part-done one as its remaining slice. */
  distance: number;
  gameId: string;
  hours: number;
  iconUrl: string;
  /** Everything unearned in this title, rarest first. */
  left: RemainingTrophy[];
  name: string;
  progress: number;
  rarest: RemainingTrophy | null;
}
