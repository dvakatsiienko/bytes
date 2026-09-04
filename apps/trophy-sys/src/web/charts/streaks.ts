import type { ArchivedTrophy } from '../../shared/types.ts';
import type { BarChart } from '../components/bar-rows.tsx';
import type { ChartColumn } from '../components/chart-frame.tsx';
import { BAR_TONE } from '../helpers/chart-theme.ts';
import { dayKey } from '../helpers/stats.ts';

const DAY_MS = 24 * 60 * 60 * 1000;
/** Runs shown before the list stops being a highlight reel. */
const LIMIT = 10;

/**
 * Runs of consecutive local days with at least one trophy. A run is still
 * "current" on the day after it last popped, because the day is not over yet —
 * ending it at midnight would report a broken streak every morning.
 */
export const trophyStreaks = (trophies: ArchivedTrophy[]): StreakModel => {
  const days = [
    ...new Set(trophies.map((trophy) => dayKey(new Date(trophy.at)))),
  ].sort();

  const counts = new Map<string, number>();
  for (const trophy of trophies) {
    const key = dayKey(new Date(trophy.at));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const runs: Streak[] = [];
  const [firstDay] = days;
  let start = firstDay;
  let previous = firstDay;
  let length = 0;
  let trophyTotal = 0;

  for (const day of days) {
    const isNext =
      previous !== undefined &&
      Date.parse(`${day}T00:00:00`) - Date.parse(`${previous}T00:00:00`) ===
        DAY_MS;

    if (isNext) {
      length += 1;
    } else {
      if (start && previous && length)
        runs.push({
          days: length,
          end: previous,
          start,
          trophies: trophyTotal,
        });
      start = day;
      length = 1;
      trophyTotal = 0;
    }

    trophyTotal += counts.get(day) ?? 0;
    previous = day;
  }

  if (start && previous && length)
    runs.push({ days: length, end: previous, start, trophies: trophyTotal });

  const today = dayKey(new Date());
  const yesterday = dayKey(new Date(Date.now() - DAY_MS));
  const last = runs.at(-1);
  const current =
    last && (last.end === today || last.end === yesterday) ? last : null;

  return {
    current,
    runs: [...runs].sort((a, b) => b.days - a.days).slice(0, LIMIT),
  };
};

export const streakChart = (model: StreakModel): BarChart => {
  const peak = Math.max(...model.runs.map((run) => run.days), 1);

  const bars = model.runs.map((run) => ({
    fraction: run.days / peak,
    id: `${run.start}-${run.end}`,
    label: `${run.start} → ${run.end}`,
    note:
      run === model.current
        ? 'still running'
        : `${run.trophies} trophies in it`,
    rows: [
      { label: 'days', value: String(run.days) },
      { label: 'trophies', value: String(run.trophies) },
      { label: 'per day', value: (run.trophies / run.days).toFixed(1) },
    ],
    tone: run === model.current ? BAR_TONE.done : BAR_TONE.past,
    value: `${run.days}d`,
  }));

  return {
    axis: { format: (value) => `${Math.round(value)}d`, max: peak },
    bars,
  };
};

export const STREAK_COLUMNS: ChartColumn<Streak>[] = [
  { cell: (run) => run.start, head: 'from' },
  { cell: (run) => run.end, head: 'to' },
  { cell: (run) => String(run.days), head: 'days', isNumeric: true },
  { cell: (run) => String(run.trophies), head: 'trophies', isNumeric: true },
  {
    cell: (run) => (run.trophies / run.days).toFixed(1),
    head: 'per day',
    isNumeric: true,
  },
];

/* Types */
export interface Streak {
  days: number;
  /** Local calendar day, `YYYY-MM-DD`. */
  end: string;
  start: string;
  trophies: number;
}

export interface StreakModel {
  /** The run still alive today, if there is one. */
  current: Streak | null;
  /** The longest runs, longest first. */
  runs: Streak[];
}
