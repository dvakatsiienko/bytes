import type { MouseEvent as ReactMouseEvent } from 'react';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridColumns, GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import { ParentSize } from '@visx/responsive';
import { scaleLinear, scaleLog } from '@visx/scale';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';

import { ChartTooltip } from '../components/chart-tooltip.tsx';
import { ScatterMark } from '../components/scatter-mark.tsx';
import { CHART_INK } from '../helpers/chart-theme.ts';
import type { EffortPoint } from '../helpers/stats.ts';
import {
  SCATTER_MARGIN as MARGIN,
  effortRows,
  hoursLabel,
  markPeak,
  markRadius,
} from './effort-shared.ts';

export const EffortScatterVisx = (props: EffortScatterVisxProps) => (
  <div className='h-80 w-full'>
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
  const { TooltipInPortal, containerRef } = useTooltipInPortal({
    detectBounds: true,
    scroll: true,
  });

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
   * Nearest data point, not the DOM element under the cursor. Forty-five of the
   * ninety-six marks have their centre painted over by a later one, and a mark
   * underneath can never receive a hover of its own — which is exactly why some
   * titles had no tooltip while recharts, which hit-tests this way, had one.
   */
  const nearest = (event: ReactMouseEvent<SVGRectElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const pointerX = event.clientX - box.left;
    const pointerY = event.clientY - box.top;

    let best: EffortPoint | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const point of props.points) {
      const dx = xScale(point.hours) - pointerX;
      const dy = yScale(point.progress) - pointerY;
      const distance = dx * dx + dy * dy;

      if (distance < bestDistance) {
        bestDistance = distance;
        best = point;
      }
    }

    return best;
  };

  return (
    <>
      <svg height={props.height} ref={containerRef} width={props.width}>
        <title>Hours played against completion, one mark per title</title>
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
            tickFormat={(value) => hoursLabel(Number(value))}
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
              const point = nearest(event);
              if (point) props.onSelect(point.gameId);
            }}
            onMouseLeave={tooltip.hideTooltip}
            onMouseMove={(event) => {
              const point = nearest(event);
              if (!point) return;

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
        <TooltipInPortal
          // `unstyled` drops the `style` prop outright — visx spreads it as
          // `...(!unstyled && style)` — so position has to come from this flag.
          applyPositionStyle
          left={tooltip.tooltipLeft}
          top={tooltip.tooltipTop}
          unstyled>
          <ChartTooltip
            iconUrl={tooltip.tooltipData.iconUrl}
            rows={effortRows(tooltip.tooltipData)}
            title={tooltip.tooltipData.name}
          />
        </TooltipInPortal>
      )}
    </>
  );
};

/* Styles */
const AXIS_LABEL = {
  fill: CHART_INK.axis,
  fontSize: 9,
  textAnchor: 'middle' as const,
};

/* Types */
interface EffortScatterVisxProps {
  onSelect: (gameId: string) => void;
  points: EffortPoint[];
}

interface PlotProps extends EffortScatterVisxProps {
  height: number;
  width: number;
}
