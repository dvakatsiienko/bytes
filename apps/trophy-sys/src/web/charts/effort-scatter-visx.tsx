import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridColumns, GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import { ParentSize } from '@visx/responsive';
import { scaleLinear, scaleLog, scaleSqrt } from '@visx/scale';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';

import { ChartTooltip } from '../components/chart-tooltip.tsx';
import { ScatterMark } from '../components/scatter-mark.tsx';
import { CHART_INK } from '../helpers/chart-theme.ts';
import type { EffortPoint } from '../helpers/stats.ts';
import { effortRows, hoursLabel } from './effort-shared.ts';

const MARGIN = { bottom: 36, left: 42, right: 14, top: 12 };

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
  const rScale = scaleSqrt<number>({
    domain: [1, Math.max(...props.points.map((point) => point.trophies), 1)],
    range: [4, 15],
  });

  const tooltip = useTooltip<EffortPoint>();
  const { TooltipInPortal, containerRef } = useTooltipInPortal({
    detectBounds: true,
    scroll: true,
  });

  const markListJSX = props.points.map((point, index) => {
    return (
      <ScatterMark
        cx={xScale(point.hours)}
        cy={yScale(point.progress)}
        delay={index * 0.008}
        hasPlatinum={point.hasPlatinum}
        key={point.gameId}
        label={`${point.name}, ${point.progress}%`}
        onEnter={() =>
          tooltip.showTooltip({
            tooltipData: point,
            tooltipLeft: MARGIN.left + xScale(point.hours),
            tooltipTop: MARGIN.top + yScale(point.progress),
          })
        }
        onLeave={tooltip.hideTooltip}
        onSelect={() => props.onSelect(point.gameId)}
        radius={rScale(point.trophies)}
      />
    );
  });

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
        </Group>
      </svg>

      {tooltip.tooltipOpen && tooltip.tooltipData && (
        <TooltipInPortal
          left={tooltip.tooltipLeft}
          style={{ position: 'absolute' }}
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
