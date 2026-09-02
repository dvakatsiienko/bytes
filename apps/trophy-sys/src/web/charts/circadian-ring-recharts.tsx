import type { ComponentProps } from 'react';
import { motion } from 'motion/react';
import { Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { ChartTooltip } from '../components/chart-tooltip.tsx';
import { CHART_INK } from '../helpers/chart-theme.ts';
import type { CircadianHour } from '../helpers/stats.ts';
import { circadianRows, circadianTitle } from './circadian-shared.ts';

/**
 * Recharts has no spoke chart. RadialBarChart draws concentric rings and Pie
 * draws equal radii, so the shape has to be built by hand — this file carries
 * the arc geometry that @visx/shape's Arc hands the other version for free.
 *
 * Pie still earns its place: it owns the centre, the radii and the tooltip
 * wiring, and gives every hour an equal slice. Only the mark is ours.
 */
const polar = (radius: number, angle: number) =>
  [radius * Math.sin(angle), -radius * Math.cos(angle)] as const;

/** Recharts measures degrees anticlockwise from 3 o'clock; d3 measures radians clockwise from 12. */
const toRadians = (degrees: number) => ((90 - degrees) * Math.PI) / 180;

const arcPath = (inner: number, outer: number, from: number, to: number) => {
  const [ax, ay] = polar(outer, from);
  const [bx, by] = polar(outer, to);
  const [cx, cy] = polar(inner, to);
  const [dx, dy] = polar(inner, from);
  const sweep = to - from > Math.PI ? 1 : 0;

  return `M ${ax} ${ay} A ${outer} ${outer} 0 ${sweep} 1 ${bx} ${by} L ${cx} ${cy} A ${inner} ${inner} 0 ${sweep} 0 ${dx} ${dy} Z`;
};

export const CircadianRingRecharts = (props: CircadianRingRechartsProps) => {
  const peak = Math.max(...props.hours.map((hour) => hour.count), 1);
  const slices = props.hours.map((hour) => ({ ...hour, slice: 1 }));

  const spokeRender = (sector: SectorProps) => {
    const inner = sector.innerRadius;
    const outer =
      inner +
      2 +
      (sector.outerRadius - inner - 2) * (sector.payload.count / peak);
    const from = toRadians(sector.startAngle) + 0.012;
    const to = toRadians(sector.endAngle) - 0.012;

    return (
      <motion.path
        animate={{ opacity: 1 }}
        className='cursor-pointer'
        d={arcPath(inner, outer, from, to)}
        fill={CHART_INK.ring}
        fillOpacity={0.7}
        initial={{ opacity: 0 }}
        stroke={CHART_INK.surface}
        strokeWidth={1}
        transform={`translate(${sector.cx} ${sector.cy})`}
        transition={{ delay: sector.payload.hour * 0.02, duration: 0.35 }}
        whileHover={{ fillOpacity: 1 }}
      />
    );
  };

  const tooltipRender = (tip: TipProps) => {
    const hour = tip.payload?.[0]?.payload as CircadianHour | undefined;
    if (!(tip.active && hour)) return null;

    return (
      <ChartTooltip rows={circadianRows(hour)} title={circadianTitle(hour)} />
    );
  };

  return (
    <div className='h-80 w-full'>
      <ResponsiveContainer height='100%' width='100%'>
        <PieChart>
          <Tooltip content={tooltipRender as TooltipContent} />
          <Pie
            data={slices}
            dataKey='slice'
            endAngle={-270}
            innerRadius='30%'
            isAnimationActive={false}
            outerRadius='88%'
            shape={spokeRender as PieShape}
            startAngle={90}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

/* Types */
interface CircadianRingRechartsProps {
  hours: CircadianHour[];
}

interface SectorProps {
  cx: number;
  cy: number;
  endAngle: number;
  innerRadius: number;
  outerRadius: number;
  payload: CircadianHour;
  startAngle: number;
}

interface TipProps {
  active?: boolean;
  payload?: readonly { payload?: unknown }[];
}

/** Same story as the scatter: the extension points are typed against internals. */
type PieShape = ComponentProps<typeof Pie>['shape'];
type TooltipContent = ComponentProps<typeof Tooltip>['content'];
