import type { ArchivedTrophy } from '../../shared/types.ts';
import type { BarChart } from '../components/bar-rows.tsx';
import type { ChartColumn } from '../components/chart-frame.tsx';
import { BAR_TONE } from '../helpers/chart-theme.ts';
import { dayKey, gamingDayKey } from '../helpers/stats.ts';

/** Runs shown before the list stops being a highlight reel. */
const LIMIT = 10;

/**
 * A `YYYY-MM-DD` key moved by whole calendar days.
 *
 * ⚠️ Calendar arithmetic, never a millisecond delta. A day is not always
 * 86 400 000 ms: a spring-forward makes it 23 hours and a fall-back 25. The old
 * test demanded exactly 24, so every run crossing a daylight-saving change was
 * reported as two broken ones — real in this archive on 2025-03-30 → 03-31, and
 * due again twice a year in every observing zone.
 *
 * Noon anchors the step. No zone shifts far enough from midday to cross a date
 * boundary, the half-hour and 45-minute zones included, so the date components
 * survive the arithmetic untouched.
 */
const dayStep = (key: string, days: number) => {
  const date = new Date(`${key}T12:00:00`);
  date.setDate(date.getDate() + days);
  return dayKey(date);
};

/**
 * Runs of consecutive **gaming** days with at least one trophy. A run is still
 * "current" on the day after it last popped, because the day is not over yet —
 * ending it at midnight would report a broken streak every morning.
 *
 * 📌 `gamingDayKey`, not `dayKey`: a session running 22:00 → 02:00 is one day
 * of play, and counting it as two inflated every streak it touched. The same
 * boundary that groups /log groups these.
 */
export const trophyStreaks = (trophies: ArchivedTrophy[]): StreakModel => {
  const days = [
    ...new Set(trophies.map((trophy) => gamingDayKey(new Date(trophy.at)))),
  ].sort();

  const counts = new Map<string, number>();
  for (const trophy of trophies) {
    const key = gamingDayKey(new Date(trophy.at));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const runs: Streak[] = [];
  const [firstDay] = days;
  let start = firstDay;
  let previous = firstDay;
  let length = 0;
  let trophyTotal = 0;

  for (const day of days) {
    const isNext = previous !== undefined && day === dayStep(previous, 1);

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

  const today = gamingDayKey(new Date());
  const yesterday = dayStep(today, -1);
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
  /** Local gaming day, `YYYY-MM-DD`. */
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
