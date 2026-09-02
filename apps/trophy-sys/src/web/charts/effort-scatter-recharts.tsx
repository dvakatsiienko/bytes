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
import { effortRows, hoursLabel } from './effort-shared.ts';

const MARGIN = { bottom: 8, left: 0, right: 14, top: 12 };

/**
 * Recharts draws its own dots and animates them itself, so both had to be
 * handed back to get motion.dev in: `shape` replaces the mark, and the radius
 * is scaled here instead of through ZAxis, because a custom shape never sees
 * the size ZAxis computed.
 */
export const EffortScatterRecharts = (props: EffortScatterRechartsProps) => {
  const maxTrophies = Math.max(
    ...props.points.map((point) => point.trophies),
    1,
  );
  const radiusOf = (trophies: number) =>
    4 +
    11 * Math.sqrt(Math.max(trophies - 1, 0) / Math.max(maxTrophies - 1, 1));

  const markRender = (mark: MarkProps) => (
    <ScatterMark
      cx={mark.cx}
      cy={mark.cy}
      delay={0}
      hasPlatinum={mark.payload.hasPlatinum}
      label={`${mark.payload.name}, ${mark.payload.progress}%`}
      onEnter={() => undefined}
      onLeave={() => undefined}
      onSelect={() => props.onSelect(mark.payload.gameId)}
      radius={radiusOf(mark.payload.trophies)}
    />
  );

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
        <ScatterChart margin={MARGIN}>
          <CartesianGrid stroke={CHART_INK.grid} strokeOpacity={0.35} />

          <XAxis
            axisLine={{ stroke: CHART_INK.axis }}
            dataKey='hours'
            domain={['dataMin', 'dataMax']}
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
            width={42}
          />

          <Tooltip content={tooltipRender as TooltipContent} cursor={false} />

          <Scatter
            data={seriesOf(true)}
            isAnimationActive={false}
            name='platinum earned'
            onClick={selectPoint}
            shape={markRender as ScatterShape}
          />
          <Scatter
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
