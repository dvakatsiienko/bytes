import { useMemo } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { MotionConfig } from 'motion/react';

import { EffortLegend } from './charts/chart-legend.tsx';
import { CircadianRingRecharts } from './charts/circadian-ring-recharts.tsx';
import { CircadianRingVisx } from './charts/circadian-ring-visx.tsx';
import { circadianTitle } from './charts/circadian-shared.ts';
import { EffortScatterRecharts } from './charts/effort-scatter-recharts.tsx';
import { EffortScatterVisx } from './charts/effort-scatter-visx.tsx';
import { hoursLabel } from './charts/effort-shared.ts';
import {
  type ChartColumn,
  ChartFrame,
  ChartTable,
} from './components/chart-frame.tsx';
import { SegmentedControl } from './components/segmented-control.tsx';
import {
  type CircadianHour,
  type EffortPoint,
  circadianHours,
  effortPoints,
} from './helpers/stats.ts';
import { useGames, useStats, useStatsSync } from './hooks/queries.ts';

const LIBS = [
  { label: 'visx', value: 'visx' },
  { label: 'recharts', value: 'recharts' },
] as const satisfies readonly { label: string; value: ChartLib }[];

export const Stats = () => {
  const navigate = useNavigate();
  const { lib } = useSearch({ from: '/stats' });
  const games = useGames();
  const stats = useStats();
  const sync = useStatsSync();

  const points = useMemo(() => effortPoints(games.data ?? []), [games.data]);
  const hours = useMemo(
    () => circadianHours(stats.data?.trophies ?? [], games.data ?? []),
    [stats.data, games.data],
  );

  // Picking the component beats branching inside the JSX: both libraries
  // implement the same two props, which is the whole point of the bake-off.
  const isVisx = lib === 'visx';
  const EffortChart = isVisx ? EffortScatterVisx : EffortScatterRecharts;
  const CircadianChart = isVisx ? CircadianRingVisx : CircadianRingRecharts;

  const gameOpen = (gameId: string) =>
    navigate({ params: { gameId }, to: '/library/$gameId' });

  const archive = stats.data;
  const hasArchive = Boolean(archive?.syncedAt);

  const ringJSX = hasArchive ? (
    <CircadianChart hours={hours} />
  ) : (
    <p className='grid h-80 place-items-center px-6 text-center text-[11px] text-dim'>
      {stats.isPending
        ? 'reading the archive…'
        : 'no trophy archive yet. run the scan above — it reads every title you have earned in, once, and stores the result.'}
    </p>
  );

  return (
    <MotionConfig reducedMotion='user'>
      <main className='grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-4'>
        <div className='flex flex-wrap items-center gap-3'>
          <SegmentedControl
            label='Charting library'
            name='chart-lib'
            onChange={(next) =>
              navigate({ search: { lib: next }, to: '/stats' })
            }
            options={LIBS}
            value={lib}
          />

          <button
            className='cursor-pointer border border-line px-3 py-1 text-[11px] text-dim uppercase tracking-[0.15em] transition-colors hover:border-orange hover:text-orange disabled:cursor-wait disabled:opacity-50'
            disabled={sync.isPending}
            onClick={() => sync.mutate()}
            type='button'>
            {sync.isPending ? 'scanning…' : 'rescan trophies'}
          </button>

          <span className='text-[10px] text-dim'>
            {statusOf(sync, archive)}
          </span>
        </div>

        <div className='grid min-h-0 gap-4 lg:grid-cols-2'>
          <ChartFrame
            name='effort'
            note='hours played against completion · log scale · mark size is the trophy count'
            table={
              <ChartTable
                columns={EFFORT_COLUMNS}
                rowKey={(point) => point.gameId}
                rows={points}
              />
            }
            title={`effort · ${lib}`}>
            <EffortLegend />
            <EffortChart onSelect={gameOpen} points={points} />
          </ChartFrame>

          <ChartFrame
            name='circadian'
            note='trophies by hour of day, in your local time · one spoke per hour'
            table={
              <ChartTable
                columns={CIRCADIAN_COLUMNS}
                rowKey={(hour) => String(hour.hour)}
                rows={hours}
              />
            }
            title={`circadian · ${lib}`}>
            {ringJSX}
          </ChartFrame>
        </div>
      </main>
    </MotionConfig>
  );
};

/* Helpers */
const statusOf = (
  sync: { error: Error | null; isPending: boolean },
  archive:
    | { games: number; syncedAt: string | null; trophies: unknown[] }
    | undefined,
) => {
  if (sync.error) return `scan failed · ${sync.error.message}`;
  if (!archive?.syncedAt) return 'archive empty — the ring needs a scan';

  return `${archive.trophies.length} trophies from ${archive.games} titles · scanned ${archive.syncedAt.slice(0, 10)}`;
};

const EFFORT_COLUMNS: ChartColumn<EffortPoint>[] = [
  { cell: (point) => point.name, head: 'title' },
  { cell: (point) => hoursLabel(point.hours), head: 'played', isNumeric: true },
  {
    cell: (point) => `${point.earned}/${point.trophies}`,
    head: 'trophies',
    isNumeric: true,
  },
  { cell: (point) => `${point.progress}%`, head: 'progress', isNumeric: true },
  {
    cell: (point) => (point.perTrophy ? hoursLabel(point.perTrophy) : '—'),
    head: 'per trophy',
    isNumeric: true,
  },
  { cell: (point) => (point.hasPlatinum ? '◆' : '—'), head: 'platinum' },
];

const CIRCADIAN_COLUMNS: ChartColumn<CircadianHour>[] = [
  { cell: (hour) => circadianTitle(hour), head: 'hour' },
  { cell: (hour) => String(hour.count), head: 'trophies', isNumeric: true },
  {
    cell: (hour) => `${hour.share.toFixed(1)}%`,
    head: 'share',
    isNumeric: true,
  },
  { cell: (hour) => hour.topGame ?? '—', head: 'top title' },
];

/* Types */
export type ChartLib = 'recharts' | 'visx';
