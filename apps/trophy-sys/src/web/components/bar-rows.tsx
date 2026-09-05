import { AxisBottom } from '@visx/axis';
import { ParentSize } from '@visx/responsive';
import { scaleLinear } from '@visx/scale';
import { useTooltip } from '@visx/tooltip';
import { motion } from 'motion/react';

import { CHART_INK } from '../helpers/chart-theme.ts';
import type { TooltipRow } from './chart-tooltip.tsx';
import { ChartTooltip, TooltipLayer } from './chart-tooltip.tsx';

/**
 * One ranked list of horizontal bars, shared by every chart that answers "which
 * of these is biggest". Four charts wanted the same picture with a different
 * measure, so the measure is the prop and the picture is written once.
 */
export const BarRows = (props: BarRowsProps) => {
  if (props.rows.length === 0)
    return (
      <p className='grid h-24 place-items-center px-6 text-center text-[12px] text-dim'>
        {props.empty ?? 'nothing to show here'}
      </p>
    );

  // The floor the rows need; the panel is free to hand over more, and rows grow
  // into it rather than leaving a hole beside a taller neighbour.
  const minHeight =
    props.rows.length * ROW_MIN +
    PAD * 2 +
    (props.axis ? AXIS_HEIGHT + AXIS_PAD : 0);

  return (
    <div className='relative h-full w-full' style={{ minHeight }}>
      <ParentSize>
        {(size) =>
          size.width > 0 && size.height > 0 ? (
            <Bars
              axis={props.axis}
              height={size.height}
              label={props.label}
              onSelect={props.onSelect}
              rows={props.rows}
              width={size.width}
            />
          ) : null
        }
      </ParentSize>
    </div>
  );
};

const Bars = (props: BarsProps) => {
  const tooltip = useTooltip<BarDatum>();

  const gutter = Math.min(Math.max(props.width * 0.34, 90), 190);

  /**
   * The readout column, measured from the readouts themselves.
   *
   * ⚠️ This was a fixed 76px, and it is the same mistake the label clip below
   * already records — a constant sized for one chart's text. `unfinished`
   * prints "5.4 left · dormant", eighteen characters and about 119px, so every
   * readout hung back over the end of its own bar. Deriving it means a chart
   * cannot introduce a longer readout without the track making room for it.
   */
  const valueWidth =
    Math.max(...props.rows.map((row) => row.value.length)) * CHAR_WIDTH;

  const trackWidth = Math.max(
    props.width - gutter - valueWidth - LABEL_INSET - VALUE_GAP,
    1,
  );

  // Rows share out whatever height the panel gave, so a five-bar chart beside a
  // ten-bar one fills its half of the row instead of stopping halfway.
  const usable = props.height - PAD * 2 - (props.axis ? AXIS_HEIGHT : 0);
  const rowHeight = Math.max(usable / props.rows.length, ROW_MIN);
  const barHeight = Math.min(Math.round(rowHeight * 0.45), BAR_MAX);

  const xScale = scaleLinear<number>({
    domain: [0, 1],
    range: [0, trackWidth],
  });
  // The axis reads in the measure's own units, so the ticks come from a second
  // scale over the real domain rather than over the 0-1 bar fraction.
  const axisScale = scaleLinear<number>({
    domain: [0, props.axis?.max ?? 1],
    range: [0, trackWidth],
  });

  const activeId = tooltip.tooltipData?.id ?? null;

  const rowListJSX = props.rows.map((row, index) => {
    const y = PAD + index * rowHeight;
    const isActive = row.id === activeId;

    return (
      // Pointer-only enhancement: the label, the readout and the navigation are
      // all in this chart's table view, so the row carries no role and no tab
      // stop of its own.
      // biome-ignore lint/a11y/noStaticElementInteractions: duplicated in the table view
      <g
        // Every row answers a hover, so every row shows the pointer — a row
        // that reacts and a row that navigates look the same to the hand.
        className='cursor-pointer'
        key={row.id}
        onMouseEnter={() =>
          tooltip.showTooltip({
            tooltipData: row,
            tooltipLeft: gutter + LABEL_INSET + xScale(row.fraction),
            tooltipTop: y + rowHeight / 2,
          })
        }
        onMouseLeave={tooltip.hideTooltip}
        {...(props.onSelect && { onClick: () => props.onSelect?.(row.id) })}>
        {/* The full-width catcher, so the gutter and the empty track answer a
            hover too — a 3%-long bar is otherwise almost unpointable. */}
        <rect fill='transparent' height={rowHeight} width={props.width} y={y} />

        <text
          dominantBaseline='middle'
          fill={isActive ? CHART_INK.text : CHART_INK.axis}
          fontSize={LABEL_FONT}
          x={LABEL_INSET}
          y={y + rowHeight / 2}>
          {clip(row.label, gutter)}
        </text>

        <rect
          fill={CHART_INK.grid}
          fillOpacity={0.25}
          height={barHeight}
          width={trackWidth}
          x={gutter + LABEL_INSET}
          y={y + (rowHeight - barHeight) / 2}
        />

        <motion.rect
          animate={{ scaleX: 1 }}
          fill={row.tone}
          fillOpacity={isActive ? 1 : 0.75}
          height={barHeight}
          initial={{ scaleX: 0 }}
          style={{ transformBox: 'fill-box', transformOrigin: 'left' }}
          transition={{
            delay: index * 0.02,
            duration: 0.4,
            ease: 'easeOut',
          }}
          // A floor of two pixels: the shortest bars in a wide-spread set are
          // the whole point of a "quickest first" ranking, and a sub-pixel bar
          // reads as no bar at all.
          width={Math.max(xScale(row.fraction), MIN_BAR)}
          x={gutter + LABEL_INSET}
          y={y + (rowHeight - barHeight) / 2}
        />

        <text
          dominantBaseline='middle'
          fill={isActive ? CHART_INK.text : CHART_INK.axis}
          fontSize={LABEL_FONT}
          textAnchor='end'
          x={props.width - LABEL_INSET}
          y={y + rowHeight / 2}>
          {row.value}
        </text>
      </g>
    );
  });

  return (
    <>
      {/* aria-label rather than <title>: a <title> child is what browsers
          render as their own native tooltip on hover. */}
      <svg
        aria-label={props.label}
        height={props.height}
        role='img'
        width={props.width}>
        {rowListJSX}

        {props.axis && (
          <AxisBottom
            left={gutter + LABEL_INSET}
            numTicks={4}
            scale={axisScale}
            stroke={CHART_INK.axis}
            tickFormat={(value) => props.axis?.format(Number(value)) ?? ''}
            tickLabelProps={() => ({
              fill: CHART_INK.axis,
              fontSize: LABEL_FONT,
              textAnchor: 'middle' as const,
            })}
            tickStroke={CHART_INK.axis}
            top={props.rows.length * rowHeight + PAD * 2}
          />
        )}
      </svg>

      {tooltip.tooltipOpen && tooltip.tooltipData && (
        <TooltipLayer left={tooltip.tooltipLeft} top={tooltip.tooltipTop}>
          <ChartTooltip
            iconUrl={tooltip.tooltipData.iconUrl}
            note={tooltip.tooltipData.note}
            rows={tooltip.tooltipData.rows}
            title={tooltip.tooltipData.label}
          />
        </TooltipLayer>
      )}
    </>
  );
};

/* Helpers */
/** Shortest a row may get; it grows past this to fill the panel. */
const ROW_MIN = 20;
/** A bar stays a bar — past this it reads as a block. */
const BAR_MAX = 18;

/**
 * Breathing room at both edges — the label on the left, the readout on the
 * right. Shared by every label column on the route, and the clip below is
 * derived from it so widening the inset never pushes a title under its own bar.
 */
const LABEL_INSET = 8;
const PAD = 6;
const MIN_BAR = 2;
/** Axis line, its labels, and a gap so the scale never touches the panel edge. */
const AXIS_HEIGHT = 22;
const AXIS_PAD = 8;
/**
 * Clear space between a full-length bar and its readout.
 *
 * 📌 Deliberately wider than the character estimate needs. `CHAR_WIDTH` is
 * 0.6em, which is the font's advance and runs a shade under the real ink on a
 * string carrying spaces and a `·` — measured, about 2px over nineteen
 * characters. This gap is what keeps a rounding error from reading as a touch.
 */
const VALUE_GAP = 16;

const LABEL_FONT = 11;
/**
 * JetBrains Mono advances at 0.6em, so the font size *is* the character width.
 * Derived rather than a constant: a hard-coded 5px-per-character was sized for
 * 9px type and let ~30% too many characters through the moment the text grew,
 * which is how the titles ended up running under the bars.
 */
const CHAR_WIDTH = LABEL_FONT * 0.6;

/** SVG text has no ellipsis, so the label is cut to what the gutter can hold. */
const clip = (label: string, gutter: number) => {
  const fits = Math.max(Math.floor((gutter - LABEL_INSET * 2) / CHAR_WIDTH), 6);
  return label.length > fits ? `${label.slice(0, fits - 1)}…` : label;
};

/* Types */
export interface BarDatum {
  /** 0-1, where 1 is the longest bar in the set. */
  fraction: number;
  iconUrl?: string;
  id: string;
  label: string;
  note?: string;
  rows: TooltipRow[];
  /** A CSS colour — the charts take these from `chart-theme`. */
  tone: string;
  /** The readout printed at the right edge. */
  value: string;
}

/** What the full track is worth, so the axis can print real units. */
export interface BarAxis {
  format: (value: number) => string;
  max: number;
}

/**
 * What a chart module hands over: the bars and the scale they were measured
 * against. One return rather than two exports, because only the module that
 * built the fractions knows what a full track means.
 */
export interface BarChart {
  axis: BarAxis;
  bars: BarDatum[];
}

interface BarRowsProps {
  /** Given only when the bars run from zero — an offset scale has no axis. */
  axis?: BarAxis;
  /** Shown instead of the chart when there are no rows. */
  empty?: string;
  /** What the whole chart says, for a screen reader. */
  label: string;
  onSelect?: (id: string) => void;
  rows: BarDatum[];
}

interface BarsProps extends BarRowsProps {
  height: number;
  width: number;
}
