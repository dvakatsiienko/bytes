import type { ComponentProps } from 'react';
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ChartTooltip } from '../components/chart-tooltip.tsx';
import { ScatterMark } from '../components/scatter-mark.tsx';
import { CHART_INK } from '../helpers/chart-theme.ts';
import type { EffortPoint } from '../helpers/stats.ts';
import {
  SCATTER_MARGIN,
  effortRows,
  hoursLabel,
  markPeak,
  markRadius,
} from './effort-shared.ts';

/**
 * Recharts draws its own dots and animates them itself, so both had to be
 * handed back to get motion.dev in: `shape` replaces the mark, and the radius
 * is scaled here instead of through ZAxis, because a custom shape never sees
 * the size ZAxis computed.
 */
export const EffortScatterRecharts = (props: EffortScatterRechartsProps) => {
  const peak = markPeak(props.points);

  const markOf = (mark: MarkProps, isActive: boolean) => (
    <ScatterMark
      cx={mark.cx}
      cy={mark.cy}
      delay={0}
      hasPlatinum={mark.payload.hasPlatinum}
      isActive={isActive}
      radius={markRadius(mark.payload.trophies, peak)}
    />
  );

  // Recharts picks the active point the same way the visx overlay does — by
  // proximity, not by which element the pointer is over — so `activeShape` is
  // what keeps the two highlights behaving identically.
  const markRender = (mark: MarkProps) => markOf(mark, false);
  const activeMarkRender = (mark: MarkProps) => markOf(mark, true);

  const tooltipRender = (tip: TipProps) => {
    const point = tip.payload?.[0]?.payload as EffortPoint | undefined;
    if (!(tip.active && point)) return null;

    return (
      <ChartTooltip
        iconUrl={point.iconUrl}
        rows={effortRows(point)}
        title={point.name}
      />
    );
  };

  const selectPoint: ScatterClick = (item) => {
    const point = (item as { payload?: EffortPoint }).payload;
    if (point) props.onSelect(point.gameId);
  };

  const seriesOf = (hasPlatinum: boolean) =>
    props.points.filter((point) => point.hasPlatinum === hasPlatinum);

  return (
    <div className='h-80 w-full'>
      <ResponsiveContainer height='100%' width='100%'>
        <ScatterChart
          margin={{
            bottom: 0,
            left: 0,
            right: SCATTER_MARGIN.right,
            top: SCATTER_MARGIN.top,
          }}>
          <CartesianGrid stroke={CHART_INK.grid} strokeOpacity={0.35} />

          <XAxis
            axisLine={{ stroke: CHART_INK.axis }}
            dataKey='hours'
            domain={['dataMin', 'dataMax']}
            height={SCATTER_MARGIN.bottom}
            scale='log'
            tick={{ fill: CHART_INK.axis, fontSize: 9 }}
            tickFormatter={hoursLabel}
            tickLine={{ stroke: CHART_INK.axis }}
            type='number'
          />
          <YAxis
            axisLine={{ stroke: CHART_INK.axis }}
            dataKey='progress'
            domain={[0, 100]}
            tick={{ fill: CHART_INK.axis, fontSize: 9 }}
            tickFormatter={(value: number) => `${value}%`}
            tickLine={{ stroke: CHART_INK.axis }}
            type='number'
            width={SCATTER_MARGIN.left}
          />

          {/* Recharts eases the tooltip wrapper from its last position over
              400ms, which reads as the box flying in from the left. */}
          <Tooltip
            content={tooltipRender as TooltipContent}
            cursor={false}
            isAnimationActive={false}
          />

          <Scatter
            activeShape={activeMarkRender as ScatterShape}
            data={seriesOf(true)}
            isAnimationActive={false}
            name='platinum earned'
            onClick={selectPoint}
            shape={markRender as ScatterShape}
          />
          <Scatter
            activeShape={activeMarkRender as ScatterShape}
            data={seriesOf(false)}
            isAnimationActive={false}
            name='no platinum yet'
            onClick={selectPoint}
            shape={markRender as ScatterShape}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

/* Types */
interface EffortScatterRechartsProps {
  onSelect: (gameId: string) => void;
  points: EffortPoint[];
}

interface MarkProps {
  cx: number;
  cy: number;
  payload: EffortPoint;
}

/**
 * Recharts types `shape` and `onClick` against internals it does not export, so
 * both are derived from the component's own props rather than hand-retyped. The
 * cast is the escape hatch's real cost: the render only ever reads cx, cy and
 * payload, and no public type says so.
 */
type ScatterShape = ComponentProps<typeof Scatter>['shape'];
type ScatterClick = ComponentProps<typeof Scatter>['onClick'];
type TooltipContent = ComponentProps<typeof Tooltip>['content'];

interface TipProps {
  active?: boolean;
  payload?: readonly { payload?: unknown }[];
}
