import { type MouseEvent as ReactMouseEvent, useRef } from 'react';
import { ParentSize } from '@visx/responsive';
import { useTooltip } from '@visx/tooltip';
import { motion } from 'motion/react';

import type { ArchivedTrophy, Game } from '../../shared/types.ts';
import type { ChartColumn } from '../components/chart-frame.tsx';
import { ChartTooltip, TooltipLayer } from '../components/chart-tooltip.tsx';
import { CHART_INK } from '../helpers/chart-theme.ts';
import { gameLookup } from '../helpers/stats.ts';

/** Rows in the grid — the busiest titles, and nothing else. */
const NAMED = 6;

/**
 * A grid, not a stack of coloured series. Six titles need six hues to stack,
 * and this palette cannot separate six — measured with the dataviz validator,
 * its purple and blue sit ΔE 1.5 apart under deuteranopia, which is no
 * separation at all. One hue at four strengths carries the same reading with
 * no colour coding to decode.
 *
 * Only the named titles get a row. A "everything else" row would set the shade
 * scale by itself and leave the six subjects uniformly pale, and the circadian
 * ring already draws the whole-library shape.
 */
export const nightOwlGrid = (
  trophies: ArchivedTrophy[],
  games: Game[],
): NightOwlGrid => {
  const byId = gameLookup(games);
  const totals = new Map<string, number>();

  for (const trophy of trophies) {
    const name = byId.get(trophy.gameId)?.name ?? trophy.gameId;
    totals.set(name, (totals.get(name) ?? 0) + 1);
  }

  const top = [...totals.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, NAMED)
    .map(([name]) => name);
  const rows: NightOwlRow[] = top.map((name) => ({
    hours: Array.from({ length: 24 }, () => 0),
    name,
    total: 0,
  }));
  const rowByName = new Map(rows.map((row) => [row.name, row]));
  const hourTotals = Array.from({ length: 24 }, () => 0);

  for (const trophy of trophies) {
    const name = byId.get(trophy.gameId)?.name ?? trophy.gameId;
    const hour = new Date(trophy.at).getHours();

    // Every title feeds the hour total, so a cell's share is its slice of the
    // whole library's hour, not just of these six.
    hourTotals[hour] = (hourTotals[hour] ?? 0) + 1;

    const row = rowByName.get(name);
    if (!row) continue;

    row.hours[hour] = (row.hours[hour] ?? 0) + 1;
    row.total += 1;
  }

  const peak = Math.max(...rows.flatMap((row) => row.hours), 1);

  // Ordered by the hour each title peaked in, so the grid reads down the clock
  // instead of restating the library's top-six list, which the ring and the
  // effort scatter already carry between them.
  rows.sort((a, b) => peakHour(a) - peakHour(b));

  return { hourTotals, peak, rows };
};

export const NightOwl = (props: NightOwlProps) => (
  <div className='relative h-full min-h-24 w-full py-2'>
    <ParentSize>
      {(size) =>
        size.width > 0 && size.height > 0 ? (
          <Grid grid={props.grid} height={size.height} width={size.width} />
        ) : null
      }
    </ParentSize>
  </div>
);

const Grid = (props: GridProps) => {
  const tooltip = useTooltip<NightOwlCell>();
  const wrapRef = useRef<HTMLDivElement>(null);

  /**
   * The grid scales to the row now, so an SVG coordinate is no longer a screen
   * pixel — the tooltip anchors off the cell's real rect instead, the same way
   * the activity grid does.
   */
  const anchorAt = (event: ReactMouseEvent<SVGRectElement>) => {
    const wrap = wrapRef.current?.getBoundingClientRect();
    const cell = event.currentTarget.getBoundingClientRect();
    if (!wrap) return { left: 0, top: 0 };
    return { left: cell.right - wrap.left, top: cell.top - wrap.top };
  };

  // The row step comes from the height the panel actually gave, the same way
  // the bar charts do it — a fixed 13px was taller than this column's share, so
  // the grid was being clipped away by the panel's own overflow.
  const step = Math.min(
    Math.max((props.height - LABEL_HEIGHT - 4) / props.grid.rows.length, 9),
    STEP_MAX,
  );
  const cell = Math.max(step - 2, 6);
  const gridWidth = 24 * step;
  // Everything the grid does not need belongs to the names.
  const gutter = Math.max(props.width - gridWidth - EDGE_PAD, GUTTER_MIN);
  const labelChars = Math.max(
    Math.floor((gutter - LABEL_INSET * 2) / (LABEL_FONT * 0.6)),
    8,
  );
  const height = props.grid.rows.length * step + LABEL_HEIGHT + 4;

  const cellListJSX = props.grid.rows.flatMap((row, rowIndex) =>
    HOURS.map((hour) => {
      const count = row.hours[hour] ?? 0;

      return (
        <motion.rect
          animate={{ opacity: 1 }}
          className='cursor-pointer'
          fill={count ? CHART_INK.ring : CHART_INK.grid}
          fillOpacity={count ? shadeOf(count, props.grid.peak) : 0.2}
          height={cell}
          initial={{ opacity: 0 }}
          key={`${row.name}-${hour}`}
          onMouseEnter={(event) => {
            const at = anchorAt(event);
            tooltip.showTooltip({
              tooltipData: {
                count,
                hour,
                name: row.name,
                share: props.grid.hourTotals[hour]
                  ? (count / (props.grid.hourTotals[hour] ?? 1)) * 100
                  : 0,
              },
              tooltipLeft: at.left,
              tooltipTop: at.top,
            });
          }}
          onMouseLeave={tooltip.hideTooltip}
          transition={{ delay: hour * 0.006, duration: 0.25 }}
          width={cell}
          x={gutter + hour * step}
          y={rowIndex * step + LABEL_HEIGHT}
        />
      );
    }),
  );

  const rowLabelListJSX = props.grid.rows.map((row, rowIndex) => {
    return (
      <text
        dominantBaseline='middle'
        fill={CHART_INK.axis}
        fontSize={LABEL_FONT}
        key={row.name}
        x={LABEL_INSET}
        y={rowIndex * step + LABEL_HEIGHT + cell / 2}>
        {row.name.length > labelChars
          ? `${row.name.slice(0, labelChars - 1)}…`
          : row.name}
      </text>
    );
  });

  const hourLabelListJSX = HOURS.filter((hour) => hour % 3 === 0).map(
    (hour) => (
      <text
        fill={CHART_INK.axis}
        fontSize={11}
        key={hour}
        textAnchor='middle'
        x={gutter + hour * step + cell / 2}
        y={8}>
        {String(hour).padStart(2, '0')}
      </text>
    ),
  );

  return (
    <div className='relative w-full py-2' ref={wrapRef}>
      {/* aria-label rather than <title>: a <title> child is what browsers
          render as their own native tooltip on hover. */}
      {/* The cells keep their size; the slack goes to the label column instead,
          which is the one place extra width buys something — full game names
          rather than bigger squares. */}
      <svg
        aria-label='Trophies per hour of day for each of the busiest titles'
        height={height}
        role='img'
        width={props.width}>
        {hourLabelListJSX}
        {rowLabelListJSX}
        {cellListJSX}
      </svg>

      {tooltip.tooltipOpen && tooltip.tooltipData && (
        <TooltipLayer left={tooltip.tooltipLeft} top={tooltip.tooltipTop}>
          <ChartTooltip
            note={`${String(tooltip.tooltipData.hour).padStart(2, '0')}:00`}
            rows={[
              { label: 'trophies', value: String(tooltip.tooltipData.count) },
              {
                label: 'of that hour',
                value: `${tooltip.tooltipData.share.toFixed(0)}%`,
              },
            ]}
            title={tooltip.tooltipData.name}
          />
        </TooltipLayer>
      )}
    </div>
  );
};

/* Helpers */
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

/** The hour a title popped the most trophies in — the row's sort key. */
const peakHour = (row: NightOwlRow) =>
  row.hours.indexOf(Math.max(...row.hours));

/** The grid never grows past this per row, however tall the panel gets. */
const STEP_MAX = 16;
const LABEL_HEIGHT = 12;

const LABEL_FONT = 11;
/** Matches bar-rows and the activity grid: one inset for every label column. */
const LABEL_INSET = 8;
/** The names never squeeze below this, however narrow the panel gets. */
const GUTTER_MIN = 130;
/** Kept clear at the right so the last hour column is not flush to the edge. */
const EDGE_PAD = 16;
/**
 * The gutter is derived, never a magic number: JetBrains Mono advances at
 * 0.6em, so the character budget above *is* the width it needs. A hard-coded
 * 130 was sized for a 9px label and the titles ran into the grid the moment the
 * type got bigger.
 */

/** Four strengths of one hue — a magnitude scale, never a second palette. */
const shadeOf = (count: number, peak: number) => {
  const share = count / peak;
  if (share > 0.66) return 1;
  if (share > 0.33) return 0.72;
  if (share > 0.12) return 0.48;
  return 0.28;
};

export const NIGHT_OWL_COLUMNS: ChartColumn<NightOwlRow>[] = [
  { cell: (row) => row.name, head: 'title' },
  { cell: (row) => String(row.total), head: 'trophies', isNumeric: true },
  {
    cell: (row) => {
      const peak = Math.max(...row.hours);
      const hour = row.hours.indexOf(peak);
      return peak ? `${String(hour).padStart(2, '0')}:00` : '—';
    },
    head: 'busiest hour',
  },
  {
    cell: (row) => String(Math.max(...row.hours)),
    head: 'in that hour',
    isNumeric: true,
  },
];

/* Types */
export interface NightOwlRow {
  /** Trophies earned in each hour of the day, index 0-23. */
  hours: number[];
  name: string;
  total: number;
}

interface NightOwlCell {
  count: number;
  hour: number;
  name: string;
  /** This title's slice of everything earned in that hour. */
  share: number;
}

export interface NightOwlGrid {
  /** Every title's trophies per hour, for the share reading. */
  hourTotals: number[];
  /** The busiest single cell, which sets the shade scale. */
  peak: number;
  rows: NightOwlRow[];
}

interface GridProps extends NightOwlProps {
  height: number;
  width: number;
}

interface NightOwlProps {
  grid: NightOwlGrid;
}
