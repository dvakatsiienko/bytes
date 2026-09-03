import type { MouseEvent as ReactMouseEvent } from 'react';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridColumns, GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import { ParentSize } from '@visx/responsive';
import { scaleLinear, scaleLog } from '@visx/scale';
import { useTooltip } from '@visx/tooltip';

import type { TooltipRow } from '../components/chart-tooltip.tsx';
import { ChartTooltip, TooltipLayer } from '../components/chart-tooltip.tsx';
import { ScatterMark } from '../components/scatter-mark.tsx';
import { CHART_INK } from '../helpers/chart-theme.ts';
import { hoursFormat } from '../helpers/format.ts';
import type { EffortPoint } from '../helpers/stats.ts';

export const EffortScatter = (props: EffortScatterProps) => (
  <div className='relative h-80 w-full'>
    <ParentSize>
      {(size) =>
        size.width > 0 ? (
          <Plot
            height={size.height}
            onSelect={props.onSelect}
            points={props.points}
            width={size.width}
          />
        ) : null
      }
    </ParentSize>
  </div>
);

const Plot = (props: PlotProps) => {
  const innerWidth = Math.max(props.width - MARGIN.left - MARGIN.right, 1);
  const innerHeight = Math.max(props.height - MARGIN.top - MARGIN.bottom, 1);

  const hours = props.points.map((point) => point.hours);
  const xScale = scaleLog<number>({
    domain: [Math.min(...hours, 0.5), Math.max(...hours, 1)],
    range: [0, innerWidth],
  });
  const yScale = scaleLinear<number>({
    domain: [0, 100],
    range: [innerHeight, 0],
  });
  const peak = markPeak(props.points);

  const tooltip = useTooltip<EffortPoint>();

  const activeId = tooltip.tooltipData?.gameId ?? null;

  const markListJSX = props.points.map((point, index) => {
    return (
      <ScatterMark
        cx={xScale(point.hours)}
        cy={yScale(point.progress)}
        delay={index * 0.008}
        hasPlatinum={point.hasPlatinum}
        isActive={point.gameId === activeId}
        key={point.gameId}
        radius={markRadius(point.trophies, peak)}
      />
    );
  });

  /**
   * The nearest mark *under the pointer* — not the DOM element beneath it, and
   * not simply the nearest mark on the chart.
   *
   * Element hit-testing fails because the points are drawn biggest-first, so a
   * large mark sits under every smaller one that overlaps it and can never
   * receive its own hover. Unqualified nearest fails the other way: with no
   * cutoff some mark is always the closest, so the chart lights one up wherever
   * the pointer sits. Candidates are therefore marks whose own radius covers
   * the pointer, and the closest of those wins.
   */
  const markAt = (event: ReactMouseEvent<SVGRectElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const pointerX = event.clientX - box.left;
    const pointerY = event.clientY - box.top;

    let best: EffortPoint | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const point of props.points) {
      const dx = xScale(point.hours) - pointerX;
      const dy = yScale(point.progress) - pointerY;
      const distance = Math.hypot(dx, dy);
      const reach = markRadius(point.trophies, peak) + TOLERANCE;

      if (distance <= reach && distance < bestDistance) {
        bestDistance = distance;
        best = point;
      }
    }

    return best;
  };

  return (
    <>
      {/* aria-label rather than <title>: a <title> child is what browsers
          render as their own native tooltip on hover. */}
      <svg
        aria-label='Hours played against completion, one mark per title'
        height={props.height}
        role='img'
        width={props.width}>
        <Group left={MARGIN.left} top={MARGIN.top}>
          <GridRows
            height={innerHeight}
            scale={yScale}
            stroke={CHART_INK.grid}
            strokeOpacity={0.35}
            width={innerWidth}
          />
          <GridColumns
            height={innerHeight}
            numTicks={4}
            scale={xScale}
            stroke={CHART_INK.grid}
            strokeOpacity={0.2}
            width={innerWidth}
          />

          <AxisBottom
            numTicks={4}
            scale={xScale}
            stroke={CHART_INK.axis}
            tickFormat={(value) => hoursFormat(Number(value))}
            tickLabelProps={() => AXIS_LABEL}
            tickStroke={CHART_INK.axis}
            top={innerHeight}
          />
          <AxisLeft
            numTicks={5}
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

          {markListJSX}

          {/* Pointer-only enhancement: everything it offers — the readings and
              the navigation — is reachable from this chart's table view, which
              is why it carries no role and no tab stop. */}
          {/* biome-ignore lint/a11y/noStaticElementInteractions: duplicated in the table view */}
          <rect
            fill='transparent'
            height={innerHeight}
            onClick={(event) => {
              const point = markAt(event);
              if (point) props.onSelect(point.gameId);
            }}
            onMouseLeave={tooltip.hideTooltip}
            onMouseMove={(event) => {
              const point = markAt(event);

              if (!point) {
                tooltip.hideTooltip();
                return;
              }

              tooltip.showTooltip({
                tooltipData: point,
                tooltipLeft: MARGIN.left + xScale(point.hours),
                tooltipTop: MARGIN.top + yScale(point.progress),
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
            iconUrl={tooltip.tooltipData.iconUrl}
            rows={effortRows(tooltip.tooltipData)}
            title={tooltip.tooltipData.name}
          />
        </TooltipLayer>
      )}
    </>
  );
};

/* Helpers */
const MARGIN = { bottom: 36, left: 42, right: 14, top: 12 };

/** How far outside a mark still counts as pointing at it. */
const TOLERANCE = 4;

const MARK_MIN = 4;
const MARK_MAX = 15;

const markPeak = (points: EffortPoint[]) =>
  Math.max(...points.map((point) => point.trophies), 2);

/**
 * d3's sqrt scale over [1, peak] → [4, 15], written out longhand. Area, not
 * radius, tracks the trophy count — a radius-linear dot lies about magnitude.
 */
const markRadius = (trophies: number, peak: number) =>
  MARK_MIN +
  ((MARK_MAX - MARK_MIN) * (Math.sqrt(Math.max(trophies, 1)) - 1)) /
    (Math.sqrt(Math.max(peak, 2)) - 1);

const effortRows = (point: EffortPoint): TooltipRow[] => [
  { label: 'played', value: hoursFormat(point.hours) },
  { label: 'trophies', value: `${point.earned}/${point.trophies}` },
  { label: 'progress', value: `${point.progress}%` },
  {
    label: 'per trophy',
    value: point.perTrophy ? hoursFormat(point.perTrophy) : '—',
  },
];

/* Styles */
const AXIS_LABEL = {
  fill: CHART_INK.axis,
  fontSize: 9,
  textAnchor: 'middle' as const,
};

/* Types */
interface EffortScatterProps {
  onSelect: (gameId: string) => void;
  points: EffortPoint[];
}

interface PlotProps extends EffortScatterProps {
  height: number;
  width: number;
}
