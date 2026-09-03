import type { Game } from '../../shared/types.ts';
import type { ChartColumn } from '../components/chart-frame.tsx';
import { hoursFormat } from '../helpers/format.ts';
import type { BarDatum } from './bar-rows.tsx';

/**
 * The buckets, coarse to fine. "Finished" is deliberately not called
 * "platinumed": a title at 100% has no trophies left, which is not the same as
 * owning a platinum, because some lists define none. The two numbers are shown
 * side by side rather than reconciled.
 */
const BUCKETS = [
  { label: 'untouched (0%)', max: 0, min: 0 },
  { label: 'started (1-25%)', max: 25, min: 1 },
  { label: 'halfway (25-50%)', max: 50, min: 25 },
  { label: 'deep in (50-99%)', max: 99, min: 50 },
  { label: 'finished (100%)', max: 100, min: 100 },
] as const;

export const backlogBuckets = (games: Game[]): BacklogBucket[] =>
  BUCKETS.map((bucket) => {
    const members = games.filter((game) =>
      bucket.min === bucket.max
        ? game.progress === bucket.min
        : game.progress > bucket.min && game.progress <= bucket.max,
    );

    return {
      games: members,
      hours: members.reduce(
        (total, game) => total + (game.playSeconds ?? 0) / 3600,
        0,
      ),
      label: bucket.label,
      platinums: members.filter((game) => game.earned.platinum > 0).length,
    };
  });

export const backlogBars = (buckets: BacklogBucket[]): BarDatum[] => {
  const peak = Math.max(...buckets.map((bucket) => bucket.games.length), 1);

  return buckets.map((bucket) => {
    const named = bucket.games
      .slice(0, 3)
      .map((game) => game.name)
      .join(', ');

    return {
      fraction: bucket.games.length / peak,
      id: bucket.label,
      label: bucket.label,
      note: named || 'nothing here',
      rows: [
        { label: 'titles', value: String(bucket.games.length) },
        { label: 'with platinum', value: String(bucket.platinums) },
        { label: 'hours', value: hoursFormat(bucket.hours) },
      ],
      tone: bucket.label.startsWith('finished')
        ? 'var(--p-green)'
        : 'var(--p-blue)',
      value: String(bucket.games.length),
    };
  });
};

export const BACKLOG_COLUMNS: ChartColumn<BacklogBucket>[] = [
  { cell: (bucket) => bucket.label, head: 'bucket' },
  {
    cell: (bucket) => String(bucket.games.length),
    head: 'titles',
    isNumeric: true,
  },
  {
    cell: (bucket) => String(bucket.platinums),
    head: 'with platinum',
    isNumeric: true,
  },
  {
    cell: (bucket) => hoursFormat(bucket.hours),
    head: 'hours',
    isNumeric: true,
  },
];

/* Types */
export interface BacklogBucket {
  games: Game[];
  hours: number;
  label: string;
  /** Titles in this bucket that actually award a platinum, and earned it. */
  platinums: number;
}
