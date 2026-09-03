import { type ReactNode, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { MotionConfig } from 'motion/react';

import type { TrophyArchive } from '../shared/types.ts';
import {
  ABANDONED_COLUMNS,
  abandonedBars,
  abandonedRuns,
} from './charts/abandoned-runs.ts';
import {
  BACKLOG_COLUMNS,
  backlogBars,
  backlogBuckets,
} from './charts/backlog-funnel.ts';
import { BarRows } from './charts/bar-rows.tsx';
import { EffortLegend } from './charts/chart-legend.tsx';
import { CircadianRing } from './charts/circadian-ring.tsx';
import {
  CLOSEST_COLUMNS,
  closestBars,
  closestRows,
} from './charts/closest-to-done.ts';
import {
  ContributionHeatmap,
  WEEKDAY_COLUMNS,
  heatmapWeeks,
} from './charts/contribution-heatmap.tsx';
import { EffortScatter } from './charts/effort-scatter.tsx';
import {
  NIGHT_OWL_COLUMNS,
  NightOwl,
  nightOwlGrid,
} from './charts/night-owl.tsx';
import {
  RARITY_COLUMNS,
  rarityBars,
  rarityTiers,
} from './charts/rarity-distribution.ts';
import {
  SKILL_COLUMNS,
  SkillCurve,
  skillMonths,
} from './charts/skill-curve.tsx';
import { STREAK_COLUMNS, streakBars, trophyStreaks } from './charts/streaks.ts';
import {
  PLATINUM_COLUMNS,
  platinumBars,
  platinumRuns,
} from './charts/time-to-platinum.ts';
import {
  PROGRESSION_COLUMNS,
  TrophyProgression,
  progressionMonths,
} from './charts/trophy-progression.tsx';
import {
  type ChartColumn,
  ChartFrame,
  ChartTable,
} from './components/chart-frame.tsx';
import { KpiStrip } from './components/kpi-strip.tsx';
import { hoursFormat } from './helpers/format.ts';
import {
  type CircadianHour,
  type EffortPoint,
  circadianHours,
  effortPoints,
  hourRangeFormat,
} from './helpers/stats.ts';
import { useGames, useStats, useStatsSync } from './hooks/queries.ts';

export const Stats = () => {
  const navigate = useNavigate();
  const games = useGames();
  const stats = useStats();
  const sync = useStatsSync();

  const gameList = useMemo(() => games.data ?? [], [games.data]);
  const archive = stats.data;
  const trophies = useMemo(() => archive?.trophies ?? [], [archive]);
  const remaining = useMemo(() => archive?.remaining ?? [], [archive]);

  const points = useMemo(() => effortPoints(gameList), [gameList]);
  const hours = useMemo(
    () => circadianHours(trophies, gameList),
    [trophies, gameList],
  );
  const closest = useMemo(
    () => closestRows(remaining, gameList),
    [remaining, gameList],
  );
  const tiers = useMemo(
    () => rarityTiers(trophies, gameList),
    [trophies, gameList],
  );
  const platinums = useMemo(
    () => platinumRuns(trophies, gameList),
    [trophies, gameList],
  );
  const buckets = useMemo(() => backlogBuckets(gameList), [gameList]);
  const abandoned = useMemo(
    () => abandonedRuns(gameList, remaining),
    [gameList, remaining],
  );
  const heatmap = useMemo(
    () => heatmapWeeks(trophies, gameList),
    [trophies, gameList],
  );
  const months = useMemo(
    () => progressionMonths(trophies, gameList),
    [trophies, gameList],
  );
  const skill = useMemo(() => skillMonths(trophies), [trophies]);
  const nightOwl = useMemo(
    () => nightOwlGrid(trophies, gameList),
    [trophies, gameList],
  );
  const streaks = useMemo(() => trophyStreaks(trophies), [trophies]);

  const gameOpen = (gameId: string) =>
    navigate({ params: { gameId }, to: '/library/$gameId' });

  /** Charts drawn from the fan-out say so plainly until it has been run. */
  const gate = (chart: ReactNode) =>
    archive?.syncedAt ? (
      chart
    ) : (
      <p className='grid h-40 place-items-center px-6 text-center text-[11px] text-dim'>
        {stats.isPending
          ? 'reading the archive…'
          : 'no trophy archive yet. run the scan above — it reads every title you have earned in, once, and stores the result.'}
      </p>
    );

  return (
    <MotionConfig reducedMotion='user'>
      <main className='flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto'>
        <div className='flex flex-wrap items-center gap-3'>
          <button
            className='cursor-pointer border border-line px-3 py-1 text-[11px] text-dim uppercase tracking-[0.15em] transition-colors hover:border-orange hover:text-orange disabled:cursor-wait disabled:opacity-50'
            disabled={sync.isPending}
            onClick={() => sync.mutate()}
            type='button'>
            {sync.isPending ? 'scanning…' : 'rescan trophies'}
          </button>

          <span className='text-[10px] text-dim'>
            {archiveStatus(archive, sync.error)}
          </span>
        </div>

        <KpiStrip games={gameList} trophies={trophies} />

        <div className='grid items-start gap-4 lg:grid-cols-2'>
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
            title='effort'>
            <EffortLegend />
            <EffortScatter onSelect={gameOpen} points={points} />
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
            title='circadian'>
            {gate(<CircadianRing hours={hours} />)}
          </ChartFrame>

          <ChartFrame
            name='rarity'
            note="earned trophies by PSN's global earn rate — not PSNProfiles' member rate, so the tiers hold different numbers than that site shows"
            table={
              <ChartTable
                columns={RARITY_COLUMNS}
                rowKey={(tier) => tier.label}
                rows={tiers}
              />
            }
            title='rarity'>
            {gate(
              <BarRows
                label='Earned trophies bucketed by global rarity'
                rows={rarityBars(tiers)}
              />,
            )}
          </ChartFrame>

          <ChartFrame
            name='backlog'
            note='every title by completion · "finished" means no trophies left, which is not the same as owning a platinum — some lists define none'
            table={
              <ChartTable
                columns={BACKLOG_COLUMNS}
                rowKey={(bucket) => bucket.label}
                rows={buckets}
              />
            }
            title='backlog'>
            <BarRows
              label='Titles bucketed by completion'
              rows={backlogBars(buckets)}
            />
          </ChartFrame>

          <ChartFrame
            name='abandoned'
            note='dropped between 80% and the platinum · the bar shows where in that band it stopped'
            table={
              <ChartTable
                columns={ABANDONED_COLUMNS}
                rowKey={(run) => run.gameId}
                rows={abandoned}
              />
            }
            title='abandoned runs'>
            {gate(
              <BarRows
                label='Titles dropped one step from the platinum'
                onSelect={gameOpen}
                rows={abandonedBars(abandoned)}
              />,
            )}
          </ChartFrame>

          <ChartFrame
            name='streaks'
            note={streakNote(streaks.current?.days ?? 0)}
            table={
              <ChartTable
                columns={STREAK_COLUMNS}
                rowKey={(run) => `${run.start}-${run.end}`}
                rows={streaks.runs}
              />
            }
            title='streaks'>
            {gate(
              <BarRows
                label='Longest runs of consecutive days with a trophy'
                rows={streakBars(streaks)}
              />,
            )}
          </ChartFrame>

          <ChartFrame
            name='closest'
            note='titles under way, nearest the platinum first · a part-done counter counts as its finished slice'
            table={
              <ChartTable
                columns={CLOSEST_COLUMNS}
                rowKey={(row) => row.gameId}
                rows={closest}
              />
            }
            title='closest to done'>
            {gate(
              <BarRows
                label='Titles under way, ranked by how little is left'
                onSelect={gameOpen}
                rows={closestBars(closest)}
              />,
            )}
          </ChartFrame>

          <ChartFrame
            name='platinum'
            note='hours played per platinum, quickest first · the hover carries the calendar span · titles whose playtime never matched are left out'
            table={
              <ChartTable
                columns={PLATINUM_COLUMNS}
                rowKey={(run) => run.gameId}
                rows={platinums}
              />
            }
            title='time to platinum'>
            {gate(
              <BarRows
                label='Hours played to reach each platinum'
                onSelect={gameOpen}
                rows={platinumBars(platinums)}
              />,
            )}
          </ChartFrame>

          <div className='lg:col-span-2'>
            <ChartFrame
              name='heatmap'
              note='the last year, one cell per day · the bars on the right total each weekday over the same window'
              table={
                <ChartTable
                  columns={WEEKDAY_COLUMNS}
                  rowKey={(weekday) => weekday.label}
                  rows={heatmap.weekdays}
                />
              }
              title='activity'>
              {gate(<ContributionHeatmap model={heatmap} />)}
            </ChartFrame>
          </div>

          <div className='lg:col-span-2'>
            <ChartFrame
              name='progression'
              note='trophies collected, stacked by grade · the band underneath is what each month alone brought'
              table={
                <ChartTable
                  columns={PROGRESSION_COLUMNS}
                  rowKey={(month) => month.label}
                  rows={months}
                />
              }
              title='progression'>
              {gate(<TrophyProgression months={months} />)}
            </ChartFrame>
          </div>

          <ChartFrame
            name='night-owl'
            note='the same hours as the ring, one row per busiest title · the darker the cell, the more it popped in that hour'
            table={
              <ChartTable
                columns={NIGHT_OWL_COLUMNS}
                rowKey={(row) => row.name}
                rows={nightOwl.rows}
              />
            }
            title='night owl'>
            {gate(<NightOwl grid={nightOwl} />)}
          </ChartFrame>

          <ChartFrame
            name='skill'
            note='median global earn rate of the trophies popped each month · lower means rarer'
            table={
              <ChartTable
                columns={SKILL_COLUMNS}
                rowKey={(month) => month.label}
                rows={skill}
              />
            }
            title='skill curve'>
            {gate(<SkillCurve months={skill} />)}
          </ChartFrame>
        </div>
      </main>
    </MotionConfig>
  );
};

/* Helpers */
const archiveStatus = (
  archive: TrophyArchive | undefined,
  error: Error | null,
) => {
  if (error) return `scan failed · ${error.message}`;
  if (!archive?.syncedAt) return 'archive empty — most charts need a scan';

  return `${archive.trophies.length} trophies from ${archive.games} titles · scanned ${archive.syncedAt.slice(0, 10)}`;
};

const streakNote = (current: number) =>
  current
    ? `longest runs of days with a trophy · you are ${current} day${current === 1 ? '' : 's'} into one right now`
    : 'longest runs of consecutive days with a trophy · no run is live today';

const EFFORT_COLUMNS: ChartColumn<EffortPoint>[] = [
  { cell: (point) => point.name, head: 'title' },
  {
    cell: (point) => hoursFormat(point.hours),
    head: 'played',
    isNumeric: true,
  },
  {
    cell: (point) => `${point.earned}/${point.trophies}`,
    head: 'trophies',
    isNumeric: true,
  },
  { cell: (point) => `${point.progress}%`, head: 'progress', isNumeric: true },
  {
    cell: (point) => (point.perTrophy ? hoursFormat(point.perTrophy) : '—'),
    head: 'per trophy',
    isNumeric: true,
  },
  { cell: (point) => (point.hasPlatinum ? '◆' : '—'), head: 'platinum' },
];

const CIRCADIAN_COLUMNS: ChartColumn<CircadianHour>[] = [
  { cell: (hour) => hourRangeFormat(hour), head: 'hour' },
  { cell: (hour) => String(hour.count), head: 'trophies', isNumeric: true },
  {
    cell: (hour) => `${hour.share.toFixed(1)}%`,
    head: 'share',
    isNumeric: true,
  },
  { cell: (hour) => hour.topGame ?? '—', head: 'top title' },
];
