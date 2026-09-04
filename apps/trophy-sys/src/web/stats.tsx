import { type ReactNode, useMemo, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { MotionConfig } from 'motion/react';

import type { TrophyArchive } from '../shared/types.ts';
import { AbandonedPanel } from './charts/abandoned-panel.tsx';
import { ABANDONED_COLUMNS, abandonedRuns } from './charts/abandoned-runs.ts';
import {
  type CircadianHour,
  CircadianRing,
  circadianHours,
  hourRangeFormat,
} from './charts/circadian-ring.tsx';
import {
  CLOSEST_COLUMNS,
  CLOSEST_SORTS,
  type ClosestSort,
  closestChart,
  closestRows,
} from './charts/closest-to-done.ts';
import {
  ContributionHeatmap,
  WEEKDAY_COLUMNS,
  heatmapWeeks,
} from './charts/contribution-heatmap.tsx';
import {
  type EffortPoint,
  EffortScatter,
  effortPoints,
} from './charts/effort-scatter.tsx';
import {
  NIGHT_OWL_COLUMNS,
  NightOwl,
  nightOwlGrid,
} from './charts/night-owl.tsx';
import {
  RARITY_COLUMNS,
  rarityChart,
  rarityTiers,
} from './charts/rarity-distribution.ts';
import {
  SKILL_COLUMNS,
  SkillCurve,
  skillMonths,
} from './charts/skill-curve.tsx';
import {
  STREAK_COLUMNS,
  streakChart,
  trophyStreaks,
} from './charts/streaks.ts';
import {
  PLATINUM_COLUMNS,
  PLATINUM_SORTS,
  type PlatinumSort,
  platinumChart,
  platinumRuns,
} from './charts/time-to-platinum.ts';
import {
  PROGRESSION_COLUMNS,
  TrophyProgression,
  progressionMonths,
} from './charts/trophy-progression.tsx';
import { BarRows } from './components/bar-rows.tsx';
import {
  type ChartColumn,
  ChartFrame,
  ChartTable,
} from './components/chart-frame.tsx';
import { EffortLegend } from './components/chart-legend.tsx';
import { KpiStrip } from './components/kpi-strip.tsx';
import { SegmentedControl } from './components/segmented-control.tsx';
import { hoursFormat } from './helpers/format.ts';
import { useGames, useStats, useStatsSync } from './hooks/queries.ts';

export const Stats = () => {
  const navigate = useNavigate();
  const games = useGames();
  const stats = useStats();
  const sync = useStatsSync();

  const [focusMonth, setFocusMonth] = useState<string | null>(null);
  const [focusDay, setFocusDay] = useState<string | null>(null);
  const [closestSort, setClosestSort] = useState<ClosestSort>('left');
  const [platinumSort, setPlatinumSort] = useState<PlatinumSort>('hours');
  const timelineRef = useRef<HTMLDivElement>(null);

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
    () => closestRows(remaining, gameList, closestSort),
    [remaining, gameList, closestSort],
  );
  const tiers = useMemo(
    () => rarityTiers(trophies, gameList),
    [trophies, gameList],
  );
  const platinums = useMemo(
    () => platinumRuns(trophies, gameList, platinumSort),
    [trophies, gameList, platinumSort],
  );
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

  // Each builder walks its rows once and returns the bars with the scale they
  // were measured against, so it must not be called twice per render.
  const rarityBars = useMemo(() => rarityChart(tiers), [tiers]);
  const closestBars = useMemo(() => closestChart(closest), [closest]);
  const platinumBars = useMemo(() => platinumChart(platinums), [platinums]);
  const streakBars = useMemo(() => streakChart(streaks), [streaks]);

  const gameOpen = (gameId: string) =>
    navigate({ params: { gameId }, to: '/library/$gameId' });

  /**
   * A day in the activity heatmap points at a month on the progression
   * timeline. The timeline draws every month it has at once, so "scroll to that
   * date" means bring the panel into view and mark the month — the two charts
   * share nothing but this one string.
   */
  const dayFocus = (date: string) => {
    setFocusDay(date);
    setFocusMonth(date.slice(0, 7));
    timelineRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  /**
   * Every chart says which of the four states it is in rather than drawing an
   * empty plot: still loading, failed, waiting on a scan, or ready.
   */
  const gate = (chart: ReactNode, needsArchive = true) => {
    if (games.isPending || (needsArchive && stats.isPending))
      return <Note>reading…</Note>;

    if (games.isError)
      return <Note>could not read the library · {games.error.message}</Note>;

    if (needsArchive && stats.isError)
      return <Note>could not read the archive · {stats.error.message}</Note>;

    if (needsArchive && !archive?.syncedAt)
      return (
        <Note>
          no trophy archive yet. run the scan above — it reads every title you
          have earned in, once, and stores the result.
        </Note>
      );

    return chart;
  };

  return (
    <MotionConfig reducedMotion='user'>
      <main className='flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto'>
        <div className='flex flex-wrap items-center gap-3'>
          <button
            className='cursor-pointer border border-line px-3 py-1 text-[12px] text-dim uppercase tracking-[0.15em] transition-colors hover:border-orange hover:text-orange disabled:cursor-wait disabled:opacity-50'
            disabled={sync.isPending}
            onClick={() => sync.mutate()}
            type='button'>
            {sync.isPending ? 'scanning…' : 'rescan trophies'}
          </button>

          <span className='text-[12px] text-dim'>
            {archiveStatus(archive, sync.error)}
          </span>

          {focusMonth && (
            <button
              className='cursor-pointer border border-orange px-2 py-0.5 text-[12px] text-orange'
              onClick={() => {
                setFocusMonth(null);
                setFocusDay(null);
              }}
              type='button'>
              clear {focusMonth} marker ✕
            </button>
          )}
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
            {gate(<EffortScatter onSelect={gameOpen} points={points} />, false)}
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
                axis={rarityBars.axis}
                empty='no trophies in the archive yet'
                label='Earned trophies bucketed by global rarity'
                rows={rarityBars.bars}
              />,
            )}
          </ChartFrame>

          <ChartFrame
            name='abandoned'
            note='titles dropped one step from the platinum — 80% or more, and stopped'
            table={
              <ChartTable
                columns={ABANDONED_COLUMNS}
                rowKey={(run) => run.gameId}
                rows={abandoned}
              />
            }
            title='abandoned'>
            {gate(
              <AbandonedPanel onSelect={gameOpen} runs={abandoned} />,
              false,
            )}
          </ChartFrame>

          <ChartFrame
            controls={
              <SegmentedControl
                label='closest to done, sort order'
                name='closest-sort'
                onChange={setClosestSort}
                options={CLOSEST_SORTS}
                value={closestSort}
              />
            }
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
                axis={closestBars.axis}
                empty='nothing under way — every title is finished or untouched'
                label='Titles under way, ranked by how little is left'
                onSelect={gameOpen}
                rows={closestBars.bars}
              />,
            )}
          </ChartFrame>

          <ChartFrame
            controls={
              <SegmentedControl
                label='time to platinum, sort order'
                name='platinum-sort'
                onChange={setPlatinumSort}
                options={PLATINUM_SORTS}
                value={platinumSort}
              />
            }
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
                axis={platinumBars.axis}
                empty='no platinum has a matched playtime yet'
                label='Hours played to reach each platinum'
                onSelect={gameOpen}
                rows={platinumBars.bars}
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
                axis={streakBars.axis}
                empty='no run of consecutive days yet'
                label='Longest runs of consecutive days with a trophy'
                rows={streakBars.bars}
              />,
            )}
          </ChartFrame>

          <ChartFrame
            name='skill'
            note='median global earn rate of the trophies popped each month · the line is a three-month rolling median, the dots are the single months · lower means rarer'
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

          <div className='min-w-0 lg:col-span-2'>
            <ChartFrame
              name='heatmap'
              note='the last year, one cell per day · the bars on the right total each weekday over the same window · click a day to mark its month on the timeline below'
              table={
                <ChartTable
                  columns={WEEKDAY_COLUMNS}
                  rowKey={(weekday) => weekday.label}
                  rows={heatmap.weekdays}
                />
              }
              title='activity'>
              {gate(
                <ContributionHeatmap
                  model={heatmap}
                  onSelect={dayFocus}
                  selected={focusDay}
                />,
              )}
            </ChartFrame>
          </div>

          <div className='min-w-0 lg:col-span-2' ref={timelineRef}>
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
              {gate(
                <TrophyProgression focusMonth={focusMonth} months={months} />,
              )}
            </ChartFrame>
          </div>

          <div className='min-w-0 lg:col-span-2'>
            <ChartFrame
              name='night-owl'
              note='the same hours as the ring, one row per busiest title, ordered by the hour each one peaked in · the darker the cell, the more it popped then'
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
          </div>
        </div>
      </main>
    </MotionConfig>
  );
};

/* Helpers */
const Note = (props: { children: ReactNode }) => (
  <p className='grid h-40 place-items-center px-6 text-center text-[12px] text-dim'>
    {props.children}
  </p>
);

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
