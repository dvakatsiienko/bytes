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
import { CHART_INK } from '../helpers/chart-theme.ts';
import { median, monthKey } from '../helpers/stats.ts';

/**
 * The median global earn rate of everything popped in a month. Median rather
 * than mean because one 0.5% platinum in a month of commons would drag a mean
 * far below what the month actually felt like.
 *
 * Quiet months are dropped: the median of nothing is not zero, it is nothing,
 * and drawing it as zero would invent the rarest month on record.
 */
export const skillMonths = (trophies: ArchivedTrophy[]): SkillMonth[] => {
  const perMonth = new Map<string, number[]>();

  for (const trophy of trophies) {
    const key = monthKey(new Date(trophy.at));
    const bucket = perMonth.get(key);
    if (bucket) bucket.push(trophy.rarity);
    else perMonth.set(key, [trophy.rarity]);
  }

  return [...perMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, rarities], index) => ({
      count: rarities.length,
      index,
      label,
      median: median(rarities),
      rarest: Math.min(...rarities),
    }));
};

export const SkillCurve = (props: SkillCurveProps) => (
  <div className='relative h-64 w-full'>
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
  const tooltip = useTooltip<SkillMonth>();

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

  const dotListJSX = props.months.map((month) => (
    <circle
      cx={xScale(month.index)}
      cy={yScale(month.median)}
      fill={CHART_INK.ring}
      fillOpacity={month.index === activeIndex ? 1 : 0.5}
      key={month.label}
      r={month.index === activeIndex ? 4 : 2}
    />
  ));

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

          <LinePath<SkillMonth>
            data={props.months}
            x={(month) => xScale(month.index)}
            y={(month) => yScale(month.median)}>
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
        <TooltipLayer
          height={props.height}
          left={tooltip.tooltipLeft}
          top={tooltip.tooltipTop}
          width={props.width}>
          <ChartTooltip
            rows={[
              {
                label: 'median rarity',
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

export const SKILL_COLUMNS: ChartColumn<SkillMonth>[] = [
  { cell: (month) => month.label, head: 'month' },
  {
    cell: (month) => `${month.median.toFixed(1)}%`,
    head: 'median rarity',
    isNumeric: true,
  },
  { cell: (month) => `${month.rarest}%`, head: 'rarest', isNumeric: true },
  { cell: (month) => String(month.count), head: 'trophies', isNumeric: true },
];

/* Styles */
const AXIS_LABEL = {
  fill: CHART_INK.axis,
  fontSize: 9,
  textAnchor: 'middle' as const,
};

/* Types */
export interface SkillMonth {
  count: number;
  index: number;
  /** `YYYY-MM`. */
  label: string;
  /** Median global earn rate this month — lower means rarer. */
  median: number;
  rarest: number;
}

interface SkillCurveProps {
  months: SkillMonth[];
}

interface PlotProps extends SkillCurveProps {
  height: number;
  width: number;
}
