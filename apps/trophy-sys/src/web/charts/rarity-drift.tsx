import type { MouseEvent as ReactMouseEvent } from 'react';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import { ParentSize } from '@visx/responsive';
import { scaleLinear } from '@visx/scale';
import { LinePath } from '@visx/shape';
import { useTooltip } from '@visx/tooltip';
import { motion } from 'motion/react';

import type { ArchivedTrophy } from '../../shared/types.ts';
import type { ChartColumn } from '../components/chart-frame.tsx';
import { ChartTooltip, TooltipLayer } from '../components/chart-tooltip.tsx';
import { AXIS_LABEL, CHART_INK } from '../helpers/chart-theme.ts';
import { median, monthKey } from '../helpers/stats.ts';

/** Months pooled into one rolling reading — the current month and the two before it. */
const WINDOW = 3;

/**
 * The median global earn rate of everything popped in a month. Median rather
 * than mean because one 0.5% platinum in a month of commons would drag a mean
 * far below what the month actually felt like.
 *
 * The line draws a three-month rolling median, and the dots the single months
 * behind it. A single month swings between 2% and 60% with no trend in it —
 * that is sample size, not skill, and a line through it reads as noise. The
 * window pools the three months' trophies and takes one median of the pool,
 * rather than averaging three medians, so a busy month counts for more than a
 * month with four trophies in it.
 *
 * Quiet months are dropped: the median of nothing is not zero, it is nothing,
 * and drawing it as zero would invent the rarest month on record.
 */
export const driftMonths = (trophies: ArchivedTrophy[]): DriftMonth[] => {
  const perMonth = new Map<string, number[]>();

  for (const trophy of trophies) {
    const key = monthKey(new Date(trophy.at));
    const bucket = perMonth.get(key);
    if (bucket) bucket.push(trophy.rarity);
    else perMonth.set(key, [trophy.rarity]);
  }

  const ordered = [...perMonth.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  );

  return ordered.map(([label, rarities], index) => {
    const pooled = ordered
      .slice(Math.max(index - WINDOW + 1, 0), index + 1)
      .flatMap(([, values]) => values);

    return {
      count: rarities.length,
      index,
      label,
      median: median(rarities),
      rarest: Math.min(...rarities),
      rolling: median(pooled),
    };
  });
};

export const RarityDrift = (props: RarityDriftProps) => (
  <div className='relative h-full min-h-64 w-full'>
    <ParentSize>
      {(size) =>
        size.width > 0 ? (
          <Plot height={size.height} months={props.months} width={size.width} />
        ) : null
      }
    </ParentSize>
  </div>
);

const Plot = (props: PlotProps) => {
  const tooltip = useTooltip<DriftMonth>();

  const innerWidth = Math.max(props.width - MARGIN.left - MARGIN.right, 1);
  const innerHeight = Math.max(props.height - MARGIN.top - MARGIN.bottom, 1);

  const xScale = scaleLinear<number>({
    domain: [0, Math.max(props.months.length - 1, 1)],
    range: [0, innerWidth],
  });
  const yScale = scaleLinear<number>({
    domain: [0, Math.max(...props.months.map((month) => month.median), 10)],
    range: [innerHeight, 0],
  });

  const activeIndex = tooltip.tooltipData?.index ?? null;

  const monthAt = (event: ReactMouseEvent<SVGRectElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const index = Math.round(xScale.invert(event.clientX - box.left));
    return props.months[Math.min(Math.max(index, 0), props.months.length - 1)];
  };

  const dotListJSX = props.months.map((month) => {
    return (
      <circle
        cx={xScale(month.index)}
        cy={yScale(month.median)}
        fill={CHART_INK.ring}
        // The single months sit behind the line as faint marks: they are the
        // evidence, the rolling line is the reading.
        fillOpacity={month.index === activeIndex ? 1 : 0.35}
        key={month.label}
        r={month.index === activeIndex ? 4 : 2}
      />
    );
  });

  return (
    <>
      {/* aria-label rather than <title>: a <title> child is what browsers
          render as their own native tooltip on hover. */}
      <svg
        aria-label='Median global rarity of the trophies earned each month'
        height={props.height}
        role='img'
        width={props.width}>
        <Group left={MARGIN.left} top={MARGIN.top}>
          <GridRows
            height={innerHeight}
            numTicks={4}
            scale={yScale}
            stroke={CHART_INK.grid}
            strokeOpacity={0.3}
            width={innerWidth}
          />

          <LinePath<DriftMonth>
            data={props.months}
            x={(month) => xScale(month.index)}
            y={(month) => yScale(month.rolling)}>
            {({ path }) => (
              <motion.path
                animate={{ pathLength: 1 }}
                d={path(props.months) ?? ''}
                fill='none'
                initial={{ pathLength: 0 }}
                stroke={CHART_INK.ring}
                strokeWidth={2}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />
            )}
          </LinePath>

          {dotListJSX}

          <AxisLeft
            numTicks={4}
            scale={yScale}
            stroke={CHART_INK.axis}
            tickFormat={(value) => `${value}%`}
            tickLabelProps={() => ({
              ...AXIS_LABEL,
              dx: -4,
              textAnchor: 'end',
            })}
            tickStroke={CHART_INK.axis}
          />
          <AxisBottom
            numTicks={Math.min(6, props.months.length)}
            scale={xScale}
            stroke={CHART_INK.axis}
            tickFormat={(value) =>
              props.months[Math.round(Number(value))]?.label ?? ''
            }
            tickLabelProps={() => AXIS_LABEL}
            tickStroke={CHART_INK.axis}
            top={innerHeight}
          />

          {/* Pointer-only enhancement: every reading is in the table view,
              which is why it carries no role and no tab stop. */}
          {/* biome-ignore lint/a11y/noStaticElementInteractions: duplicated in the table view */}
          <rect
            className='cursor-pointer'
            fill='transparent'
            height={innerHeight}
            onMouseLeave={tooltip.hideTooltip}
            onMouseMove={(event) => {
              const month = monthAt(event);
              if (!month) return;

              tooltip.showTooltip({
                tooltipData: month,
                tooltipLeft: MARGIN.left + xScale(month.index),
                tooltipTop: MARGIN.top + yScale(month.median),
              });
            }}
            width={innerWidth}
          />
        </Group>
      </svg>

      {tooltip.tooltipOpen && tooltip.tooltipData && (
        <TooltipLayer left={tooltip.tooltipLeft} top={tooltip.tooltipTop}>
          <ChartTooltip
            rows={[
              {
                label: '3-month median',
                value: `${tooltip.tooltipData.rolling.toFixed(1)}%`,
              },
              {
                label: 'this month',
                value: `${tooltip.tooltipData.median.toFixed(1)}%`,
              },
              {
                label: 'rarest',
                value: `${tooltip.tooltipData.rarest}%`,
              },
              { label: 'trophies', value: String(tooltip.tooltipData.count) },
            ]}
            title={tooltip.tooltipData.label}
          />
        </TooltipLayer>
      )}
    </>
  );
};

/* Helpers */
const MARGIN = { bottom: 26, left: 38, right: 10, top: 10 };

export const RARITY_DRIFT_COLUMNS: ChartColumn<DriftMonth>[] = [
  { cell: (month) => month.label, head: 'month' },
  {
    cell: (month) => `${month.rolling.toFixed(1)}%`,
    head: '3-month median',
    isNumeric: true,
  },
  {
    cell: (month) => `${month.median.toFixed(1)}%`,
    head: 'this month',
    isNumeric: true,
  },
  { cell: (month) => `${month.rarest}%`, head: 'rarest', isNumeric: true },
  { cell: (month) => String(month.count), head: 'trophies', isNumeric: true },
];

/* Types */
export interface DriftMonth {
  count: number;
  index: number;
  /** `YYYY-MM`. */
  label: string;
  /** Median global earn rate this month alone — lower means rarer. */
  median: number;
  rarest: number;
  /** Median over this month and the two before it, pooled. The line's value. */
  rolling: number;
}

interface RarityDriftProps {
  months: DriftMonth[];
}

interface PlotProps extends RarityDriftProps {
  height: number;
  width: number;
}
