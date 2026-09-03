import { useTooltip } from '@visx/tooltip';
import { motion } from 'motion/react';

import type { ArchivedTrophy, Game, TrophyGrade } from '../../shared/types.ts';
import type { ChartColumn } from '../components/chart-frame.tsx';
import { ChartTooltip, TooltipLayer } from '../components/chart-tooltip.tsx';
import { CHART_INK } from '../helpers/chart-theme.ts';
import { GRADE_ORDER, dayKey, gameLookup } from '../helpers/stats.ts';

/** A year of columns — enough to hold a whole season's shape on one screen. */
const WEEKS = 53;
const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

export const heatmapWeeks = (
  trophies: ArchivedTrophy[],
  games: Game[],
): HeatmapModel => {
  const byId = gameLookup(games);
  const byDay = new Map<string, HeatmapCell>();

  for (const trophy of trophies) {
    const date = new Date(trophy.at);
    const key = dayKey(date);
    const cell = byDay.get(key) ?? {
      count: 0,
      date: key,
      games: new Map<string, number>(),
      grades: { bronze: 0, gold: 0, platinum: 0, silver: 0 },
      weekday: date.getDay(),
    };

    cell.count += 1;
    cell.grades[trophy.grade] += 1;
    const name = byId.get(trophy.gameId)?.name ?? trophy.gameId;
    cell.games.set(name, (cell.games.get(name) ?? 0) + 1);
    byDay.set(key, cell);
  }

  // The grid ends on the Saturday of this week, so the last column is whole and
  // today never sits in a half-drawn column.
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  end.setDate(end.getDate() + (6 - end.getDay()));

  const columns: HeatmapCell[][] = [];

  for (let week = WEEKS - 1; week >= 0; week -= 1) {
    const column: HeatmapCell[] = [];

    for (let weekday = 0; weekday < 7; weekday += 1) {
      const date = new Date(end);
      date.setDate(end.getDate() - week * 7 - (6 - weekday));
      const key = dayKey(date);

      column.push(
        byDay.get(key) ?? {
          count: 0,
          date: key,
          games: new Map(),
          grades: { bronze: 0, gold: 0, platinum: 0, silver: 0 },
          weekday,
        },
      );
    }

    columns.push(column);
  }

  const shown = columns.flat();
  const total = shown.reduce((sum, cell) => sum + cell.count, 0);

  const weekdays = WEEKDAYS.map((label, index) => {
    const count = shown
      .filter((cell) => cell.weekday === index)
      .reduce((sum, cell) => sum + cell.count, 0);

    return { count, label, share: total ? (count / total) * 100 : 0 };
  });

  return { columns, total, weekdays };
};

export const ContributionHeatmap = (props: ContributionHeatmapProps) => {
  const tooltip = useTooltip<HeatmapCell>();

  const gridWidth = props.model.columns.length * STEP;
  const marginX = gridWidth + 18;
  const width = marginX + MARGIN_WIDTH + 30;
  const height = 7 * STEP + 26;
  const peak = Math.max(
    ...props.model.weekdays.map((weekday) => weekday.count),
    1,
  );

  const cellListJSX = props.model.columns.flatMap((column, weekIndex) =>
    column.map((cell) => (
      // Pointer-only enhancement: the same numbers are in this chart's table
      // view, and the click only moves a marker on another chart.
      <motion.rect
        animate={{ opacity: 1 }}
        className={cell.count ? 'cursor-pointer' : undefined}
        fill={cell.count ? CHART_INK.ring : CHART_INK.grid}
        fillOpacity={cell.count ? shadeOf(cell.count) : 0.25}
        height={CELL}
        initial={{ opacity: 0 }}
        key={cell.date}
        onClick={() => cell.count && props.onSelect(cell.date)}
        onMouseEnter={() =>
          tooltip.showTooltip({
            tooltipData: cell,
            tooltipLeft: weekIndex * STEP + CELL,
            tooltipTop: cell.weekday * STEP + LABEL_HEIGHT,
          })
        }
        onMouseLeave={tooltip.hideTooltip}
        transition={{ delay: weekIndex * 0.004, duration: 0.25 }}
        width={CELL}
        x={weekIndex * STEP}
        y={cell.weekday * STEP + LABEL_HEIGHT}
      />
    )),
  );

  const monthListJSX = props.model.columns.flatMap((column, weekIndex) => {
    const [first] = column;
    if (!first) return [];

    const date = new Date(first.date);
    // A label per month, printed on the column that opens it.
    if (date.getDate() > 7) return [];

    return [
      <text
        fill={CHART_INK.axis}
        fontSize={8}
        key={first.date}
        x={weekIndex * STEP}
        y={8}>
        {MONTHS[date.getMonth()]}
      </text>,
    ];
  });

  const marginListJSX = props.model.weekdays.map((weekday, index) => (
    <g key={weekday.label}>
      <motion.rect
        animate={{ scaleX: 1 }}
        fill={CHART_INK.ring}
        fillOpacity={0.6}
        height={CELL}
        initial={{ scaleX: 0 }}
        style={{ transformBox: 'fill-box', transformOrigin: 'left' }}
        transition={{ delay: 0.25 + index * 0.03, duration: 0.35 }}
        width={Math.max((weekday.count / peak) * MARGIN_WIDTH, 1)}
        x={marginX}
        y={index * STEP + LABEL_HEIGHT}
      />
      <text
        dominantBaseline='middle'
        fill={CHART_INK.axis}
        fontSize={8}
        x={marginX + MARGIN_WIDTH + 4}
        y={index * STEP + LABEL_HEIGHT + CELL / 2}>
        {weekday.label}
      </text>
    </g>
  ));

  return (
    <div className='relative w-full overflow-x-auto px-4 py-2'>
      {/* aria-label rather than <title>: a <title> child is what browsers
          render as their own native tooltip on hover. */}
      <svg
        aria-label='Trophies earned per day over the last year, plus a weekday total for each row'
        height={height}
        role='img'
        width={width}>
        {monthListJSX}
        {cellListJSX}
        {marginListJSX}
      </svg>

      {tooltip.tooltipOpen && tooltip.tooltipData && (
        <TooltipLayer
          height={height}
          left={tooltip.tooltipLeft}
          top={tooltip.tooltipTop}
          width={width}>
          <ChartTooltip
            note={gameNames(tooltip.tooltipData)}
            rows={[
              { label: 'trophies', value: String(tooltip.tooltipData.count) },
              { label: 'grades', value: gradeNames(tooltip.tooltipData) },
            ]}
            title={tooltip.tooltipData.date}
          />
        </TooltipLayer>
      )}
    </div>
  );
};

/* Helpers */
const CELL = 11;
const STEP = 13;
const LABEL_HEIGHT = 12;
const MARGIN_WIDTH = 46;

const MONTHS = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
] as const;

/**
 * One hue, four steps — a magnitude scale, so it never becomes a second
 * categorical palette. The cut points are trophy counts, not quantiles: a day
 * with eleven trophies is a different kind of day from one with two, and fixed
 * cuts keep that reading stable as the window slides.
 */
const shadeOf = (count: number) => {
  if (count >= 11) return 1;
  if (count >= 6) return 0.75;
  if (count >= 3) return 0.5;
  return 0.3;
};

const gameNames = (cell: HeatmapCell) =>
  cell.count ? [...cell.games.keys()].slice(0, 3).join(', ') : 'nothing earned';

const gradeNames = (cell: HeatmapCell) => {
  const parts = GRADE_ORDER.map((grade) =>
    cell.grades[grade] ? `${cell.grades[grade]}${grade[0]}` : null,
  ).filter((part) => part !== null);

  return parts.length ? parts.join(' ') : '—';
};

export const WEEKDAY_COLUMNS: ChartColumn<WeekdayTotal>[] = [
  { cell: (weekday) => weekday.label, head: 'weekday' },
  {
    cell: (weekday) => String(weekday.count),
    head: 'trophies',
    isNumeric: true,
  },
  {
    cell: (weekday) => `${weekday.share.toFixed(1)}%`,
    head: 'share',
    isNumeric: true,
  },
];

/* Types */
export interface HeatmapCell {
  count: number;
  /** Local calendar day, `YYYY-MM-DD`. */
  date: string;
  /** Titles that popped a trophy that day, with how many each. */
  games: Map<string, number>;
  grades: Record<TrophyGrade, number>;
  weekday: number;
}

export interface WeekdayTotal {
  count: number;
  label: string;
  share: number;
}

export interface HeatmapModel {
  /** One entry per week, oldest first, each holding seven days. */
  columns: HeatmapCell[][];
  total: number;
  weekdays: WeekdayTotal[];
}

interface ContributionHeatmapProps {
  model: HeatmapModel;
  /** Called with a `YYYY-MM-DD` when a day with trophies in it is clicked. */
  onSelect: (date: string) => void;
}
