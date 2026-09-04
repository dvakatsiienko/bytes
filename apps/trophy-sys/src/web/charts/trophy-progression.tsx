import type { MouseEvent as ReactMouseEvent } from 'react';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import { ParentSize } from '@visx/responsive';
import { scaleLinear } from '@visx/scale';
import { AreaStack } from '@visx/shape';
import { useTooltip } from '@visx/tooltip';
import { motion } from 'motion/react';

import type { ArchivedTrophy, Game } from '../../shared/types.ts';
import type { ChartColumn } from '../components/chart-frame.tsx';
import { SeriesLegend } from '../components/chart-legend.tsx';
import { ChartTooltip, TooltipLayer } from '../components/chart-tooltip.tsx';
import { AXIS_LABEL, CHART_INK, GRADE_TONE } from '../helpers/chart-theme.ts';
import { GRADE_ORDER, gameLookup, monthKey } from '../helpers/stats.ts';

export const progressionMonths = (
  trophies: ArchivedTrophy[],
  games: Game[],
): MonthPoint[] => {
  if (trophies.length === 0) return [];

  const byId = gameLookup(games);
  const perMonth = new Map<
    string,
    {
      count: number;
      games: Map<string, number>;
      grades: Record<string, number>;
    }
  >();

  for (const trophy of trophies) {
    const key = monthKey(new Date(trophy.at));
    const bucket = perMonth.get(key) ?? {
      count: 0,
      games: new Map<string, number>(),
      grades: { bronze: 0, gold: 0, platinum: 0, silver: 0 },
    };

    bucket.count += 1;
    bucket.grades[trophy.grade] = (bucket.grades[trophy.grade] ?? 0) + 1;
    const name = byId.get(trophy.gameId)?.name ?? trophy.gameId;
    bucket.games.set(name, (bucket.games.get(name) ?? 0) + 1);
    perMonth.set(key, bucket);
  }

  // Every month between the first trophy and the last, including the quiet
  // ones — skipping them would compress a two-year gap into one step and make
  // the curve lie about pace.
  const keys = [...perMonth.keys()].sort();
  const [first] = keys;
  const last = keys.at(-1);
  if (!(first && last)) return [];

  const points: MonthPoint[] = [];
  const running = { bronze: 0, gold: 0, platinum: 0, silver: 0 };
  const cursor = new Date(`${first}-01T00:00:00`);
  const end = new Date(`${last}-01T00:00:00`);

  while (cursor <= end) {
    const key = monthKey(cursor);
    const bucket = perMonth.get(key);

    for (const grade of GRADE_ORDER)
      running[grade] += bucket?.grades[grade] ?? 0;

    let topGame: string | null = null;
    let topCount = 0;
    for (const [name, count] of bucket?.games ?? [])
      if (count > topCount) {
        topCount = count;
        topGame = name;
      }

    points.push({
      bronze: running.bronze,
      count: bucket?.count ?? 0,
      gold: running.gold,
      index: points.length,
      label: key,
      platinum: running.platinum,
      silver: running.silver,
      topGame,
    });

    cursor.setMonth(cursor.getMonth() + 1);
  }

  return points;
};

export const TrophyProgression = (props: TrophyProgressionProps) => {
  if (props.months.length === 0)
    return (
      <p className='grid h-40 place-items-center px-6 text-center text-[12px] text-dim'>
        nothing earned yet, so there is no arc to draw.
      </p>
    );

  return (
    <div className='flex h-full min-h-0 flex-col'>
      <SeriesLegend items={GRADE_LEGEND} />

      <div className='relative min-h-64 w-full flex-1'>
        <ParentSize>
          {(size) =>
            size.width > 0 ? (
              <Plot
                focusMonth={props.focusMonth}
                height={size.height}
                months={props.months}
                width={size.width}
              />
            ) : null
          }
        </ParentSize>
      </div>
    </div>
  );
};

const Plot = (props: PlotProps) => {
  const tooltip = useTooltip<MonthPoint>();

  const innerWidth = Math.max(props.width - MARGIN.left - MARGIN.right, 1);
  const bandTop = props.height - MARGIN.bottom - BAND_HEIGHT;
  const areaHeight = Math.max(bandTop - MARGIN.top, 1);

  const total = props.months.at(-1);
  const peakTotal = total
    ? total.bronze + total.silver + total.gold + total.platinum
    : 1;
  const peakMonth = Math.max(...props.months.map((month) => month.count), 1);

  const xScale = scaleLinear<number>({
    domain: [0, Math.max(props.months.length - 1, 1)],
    range: [0, innerWidth],
  });
  const yScale = scaleLinear<number>({
    domain: [0, peakTotal],
    range: [areaHeight, 0],
  });
  const bandScale = scaleLinear<number>({
    domain: [0, peakMonth],
    range: [0, BAND_HEIGHT - 4],
  });

  const step = innerWidth / Math.max(props.months.length, 1);
  const barWidth = Math.max(step - 1, 1);

  // The first and last bars are centred on the axis ends, so half of each would
  // hang outside the plot. Both are pushed back in rather than clipped.
  const bandX = (index: number) =>
    Math.min(Math.max(xScale(index) - step / 2, 0), innerWidth - barWidth);

  const focusIndex =
    props.months.find((month) => month.label === props.focusMonth)?.index ??
    null;

  const monthAt = (event: ReactMouseEvent<SVGRectElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const index = Math.round(
      xScale.invert(event.clientX - box.left - MARGIN.left),
    );
    return props.months[Math.min(Math.max(index, 0), props.months.length - 1)];
  };

  const activeIndex = tooltip.tooltipData?.index ?? null;

  const bandListJSX = props.months.map((month) => {
    return (
      <motion.rect
        animate={{ scaleY: 1 }}
        fill={CHART_INK.ring}
        fillOpacity={month.index === activeIndex ? 1 : 0.55}
        height={Math.max(bandScale(month.count), month.count ? 1 : 0)}
        initial={{ scaleY: 0 }}
        key={month.label}
        style={{ transformBox: 'fill-box', transformOrigin: 'bottom' }}
        transition={{ delay: month.index * 0.004, duration: 0.3 }}
        width={barWidth}
        x={bandX(month.index)}
        y={BAND_HEIGHT - 4 - bandScale(month.count)}
      />
    );
  });

  return (
    <>
      {/* aria-label rather than <title>: a <title> child is what browsers
          render as their own native tooltip on hover. */}
      <svg
        aria-label='Cumulative trophies by grade over time, with trophies earned each month below'
        height={props.height}
        role='img'
        width={props.width}>
        <Group left={MARGIN.left} top={MARGIN.top}>
          <GridRows
            height={areaHeight}
            numTicks={4}
            scale={yScale}
            stroke={CHART_INK.grid}
            strokeOpacity={0.3}
            width={innerWidth}
          />

          <AreaStack<MonthPoint, GradeKey>
            data={props.months}
            keys={STACK_KEYS}
            x={(point) => xScale(point.data.index)}
            y0={(point) => yScale(point[0])}
            y1={(point) => yScale(point[1])}>
            {({ path, stacks }) =>
              stacks.map((stack) => {
                return (
                  <motion.path
                    animate={{ opacity: 1 }}
                    d={path(stack) ?? ''}
                    fill={GRADE_TONE[stack.key]}
                    fillOpacity={0.85}
                    initial={{ opacity: 0 }}
                    key={stack.key}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                );
              })
            }
          </AreaStack>

          <AxisLeft
            numTicks={4}
            scale={yScale}
            stroke={CHART_INK.axis}
            tickLabelProps={() => ({
              ...AXIS_LABEL,
              dx: -4,
              textAnchor: 'end',
            })}
            tickStroke={CHART_INK.axis}
          />

          {activeIndex !== null && (
            <line
              stroke={CHART_INK.axis}
              strokeDasharray='2 2'
              x1={xScale(activeIndex)}
              x2={xScale(activeIndex)}
              y1={0}
              y2={areaHeight}
            />
          )}

          {/* Where a clicked day in the activity heatmap lands on this
              timeline — a solid marker, so it reads as a place rather than as
              wherever the pointer happens to be. */}
          {focusIndex !== null && (
            <g>
              <line
                stroke={CHART_INK.ring}
                strokeWidth={1.5}
                x1={xScale(focusIndex)}
                x2={xScale(focusIndex)}
                y1={0}
                y2={areaHeight}
              />
              <text
                fill={CHART_INK.ring}
                fontSize={11}
                textAnchor={
                  focusIndex > props.months.length / 2 ? 'end' : 'start'
                }
                x={
                  xScale(focusIndex) +
                  (focusIndex > props.months.length / 2 ? -4 : 4)
                }
                y={10}>
                {props.focusMonth}
              </text>
            </g>
          )}
        </Group>

        <Group left={MARGIN.left} top={bandTop}>
          {bandListJSX}
          <AxisBottom
            numTicks={Math.min(6, props.months.length)}
            scale={xScale}
            stroke={CHART_INK.axis}
            tickFormat={(value) =>
              props.months[Math.round(Number(value))]?.label ?? ''
            }
            tickLabelProps={() => AXIS_LABEL}
            tickStroke={CHART_INK.axis}
            top={BAND_HEIGHT}
          />
        </Group>

        {/* The whole surface, not just the plot box: the first month's velocity
            bar is centred on the axis origin and so hangs half a step to the
            left of it, and a plot-sized catcher cannot reach that half.

            Pointer-only enhancement: every reading it offers is in this chart's
            table view, which is why it carries no role and no tab stop. */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: duplicated in the table view */}
        <rect
          className='cursor-pointer'
          fill='transparent'
          height={props.height}
          onMouseLeave={tooltip.hideTooltip}
          onMouseMove={(event) => {
            const month = monthAt(event);
            if (!month) return;

            tooltip.showTooltip({
              tooltipData: month,
              tooltipLeft: MARGIN.left + xScale(month.index),
              tooltipTop: MARGIN.top + 8,
            });
          }}
          width={props.width}
          x={0}
          y={0}
        />
      </svg>

      {tooltip.tooltipOpen && tooltip.tooltipData && (
        <TooltipLayer left={tooltip.tooltipLeft} top={tooltip.tooltipTop}>
          <ChartTooltip
            note={
              tooltip.tooltipData.topGame
                ? `driven by ${tooltip.tooltipData.topGame}`
                : 'a quiet month'
            }
            rows={monthRows(tooltip.tooltipData)}
            title={tooltip.tooltipData.label}
          />
        </TooltipLayer>
      )}
    </>
  );
};

/* Helpers */
/** visx's stack wants a mutable list, and GRADE_ORDER is frozen on purpose. */
const STACK_KEYS: GradeKey[] = [...GRADE_ORDER];

// Rarest first, which is the order the eye reads the bands from the top down.
const GRADE_LEGEND = [...GRADE_ORDER].reverse().map((grade) => ({
  label: grade,
  tone: GRADE_TONE[grade],
}));

const MARGIN = { bottom: 26, left: 38, right: 10, top: 10 };
/** The velocity band under the area, sharing its x axis. */
const BAND_HEIGHT = 46;

const monthRows = (month: MonthPoint) => [
  { label: 'that month', value: String(month.count) },
  { label: 'bronze', value: String(month.bronze) },
  { label: 'silver', value: String(month.silver) },
  { label: 'gold', value: String(month.gold) },
  { label: 'platinum', value: String(month.platinum) },
];

export const PROGRESSION_COLUMNS: ChartColumn<MonthPoint>[] = [
  { cell: (month) => month.label, head: 'month' },
  { cell: (month) => String(month.count), head: 'earned', isNumeric: true },
  { cell: (month) => String(month.bronze), head: 'bronze', isNumeric: true },
  { cell: (month) => String(month.silver), head: 'silver', isNumeric: true },
  { cell: (month) => String(month.gold), head: 'gold', isNumeric: true },
  {
    cell: (month) => String(month.platinum),
    head: 'platinum',
    isNumeric: true,
  },
  { cell: (month) => month.topGame ?? '—', head: 'driven by' },
];

/* Types */
type GradeKey = (typeof GRADE_ORDER)[number];

export interface MonthPoint {
  /** Cumulative, not the month's own count — the area is a running total. */
  bronze: number;
  /** Trophies earned in this month alone, which is what the band draws. */
  count: number;
  gold: number;
  index: number;
  /** `YYYY-MM`. */
  label: string;
  platinum: number;
  silver: number;
  topGame: string | null;
}

interface TrophyProgressionProps {
  /** `YYYY-MM` to mark, set by clicking a day in the activity heatmap. */
  focusMonth: string | null;
  months: MonthPoint[];
}

interface PlotProps extends TrophyProgressionProps {
  height: number;
  width: number;
}
