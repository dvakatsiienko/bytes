import type { MouseEvent as ReactMouseEvent } from 'react';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridColumns, GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import { ParentSize } from '@visx/responsive';
import { scaleLinear, scaleLog } from '@visx/scale';
import { useTooltip } from '@visx/tooltip';

import type { Game } from '../../shared/types.ts';
import type { TooltipRow } from '../components/chart-tooltip.tsx';
import { ChartTooltip, TooltipLayer } from '../components/chart-tooltip.tsx';
import { ScatterMark } from '../components/scatter-mark.tsx';
import {
  AXIS_BOTTOM,
  AXIS_LABEL,
  AXIS_LEFT,
  CHART_INK,
} from '../helpers/chart-theme.ts';
import { hoursFormat } from '../helpers/format.ts';
import { countTotal } from '../helpers/stats.ts';

export const EffortScatter = (props: EffortScatterProps) => (
  // flex-1 rather than h-full: this chart sits under a legend inside the frame
  // body, and 100% of the body is more room than is left once the legend has
  // taken its share — the surplus hangs past the clipped bottom edge.
  <div className='relative min-h-64 w-full flex-1'>
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
  const xLow = Math.min(...hours, 0.5);
  const xHigh = Math.max(...hours, 1);
  const xScale = scaleLog<number>({
    domain: [xLow, xHigh],
    range: [0, innerWidth],
  });
  // d3 falls back to every minor tick — 1,2,3…9 per decade — once a log domain
  // spans fewer decades than the count asked for, and hiding untouched titles
  // narrowed this one enough to print 26 labels on top of each other.
  const xTicks = decadeTicks(xLow, xHigh);
  // Inset by the largest mark's radius at both ends: a 0% title used to sit its
  // centre exactly on the axis, so the bottom half of the dot crossed the line
  // and read as clipped. The axis itself does not move — only the value range
  // inside it, which keeps the picture the same shape.
  const yScale = scaleLinear<number>({
    domain: [0, 100],
    range: [innerHeight - MARK_MAX, MARK_MAX],
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
            scale={xScale}
            stroke={CHART_INK.grid}
            strokeOpacity={0.2}
            tickValues={xTicks}
            width={innerWidth}
          />

          <AxisBottom
            scale={xScale}
            stroke={CHART_INK.axis}
            tickFormat={(value) => hoursFormat(Number(value))}
            tickLabelProps={() => AXIS_LABEL}
            tickStroke={CHART_INK.axis}
            tickValues={xTicks}
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
            // The catcher spans the whole plot but only acts over a mark, so
            // the cursor follows the mark rather than the rectangle.
            style={{ cursor: tooltip.tooltipData ? 'pointer' : 'default' }}
            width={innerWidth}
          />
        </Group>
      </svg>

      {tooltip.tooltipOpen && tooltip.tooltipData && (
        <TooltipLayer left={tooltip.tooltipLeft} top={tooltip.tooltipTop}>
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
/**
 * A title with no matched playtime has no place on an hours axis, and a log
 * scale cannot hold a zero, so both are dropped rather than parked at 1.
 *
 * `hideUntouched` drops the rest of the dead weight: a title with no trophy
 * earned sits on the 0% gridline, and the never-opened half of a 258-title
 * library turns the scatter into a bar. It is the owner's switch, in /admin.
 */
export const effortPoints = (
  games: Game[],
  hideUntouched: boolean,
): EffortPoint[] =>
  games
    .filter((game) => (game.playSeconds ?? 0) > 0)
    .map((game) => {
      const earned = countTotal(game.earned);
      const hours = (game.playSeconds ?? 0) / 3600;

      return {
        earned,
        gameId: game.id,
        hasPlatinum: game.earned.platinum > 0,
        hours,
        iconUrl: game.iconUrl,
        name: game.name,
        perTrophy: earned ? hours / earned : 0,
        progress: game.progress,
        trophies: countTotal(game.defined),
      };
    })
    .filter((point) => !hideUntouched || point.earned > 0)
    // Big dots drawn first, so a small one is never buried under a large one.
    .sort((a, b) => b.trophies - a.trophies);

const MARGIN = { bottom: AXIS_BOTTOM, left: AXIS_LEFT, right: 14, top: 12 };

/** How far outside a mark still counts as pointing at it. */
const TOLERANCE = 4;

const MARK_MIN = 4;
const MARK_MAX = 15;

const markPeak = (points: EffortPoint[]) =>
  Math.max(...points.map((point) => point.trophies), 2);

/** Every power of ten inside the domain — the readable labelling for a log axis. */
const decadeTicks = (low: number, high: number) => {
  const first = Math.ceil(Math.log10(low));
  const last = Math.floor(Math.log10(high));
  const ticks: number[] = [];

  for (let power = first; power <= last; power += 1) ticks.push(10 ** power);

  return ticks;
};

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

/* Types */
export interface EffortPoint {
  earned: number;
  gameId: string;
  hasPlatinum: boolean;
  hours: number;
  iconUrl: string;
  name: string;
  /** Hours spent per trophy actually earned — the grind rate. */
  perTrophy: number;
  progress: number;
  /** Trophies the title defines, which is what the dot size encodes. */
  trophies: number;
}

interface EffortScatterProps {
  onSelect: (gameId: string) => void;
  points: EffortPoint[];
}

interface PlotProps extends EffortScatterProps {
  height: number;
  width: number;
}
