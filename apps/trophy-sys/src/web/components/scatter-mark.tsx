import { motion } from 'motion/react';

import { CHART_INK, seriesColor } from '../helpers/chart-theme.ts';

/**
 * Shared by both charting libraries on purpose: the bake-off is about scales,
 * axes, tooltips and layout, so the mark itself is held identical and the
 * comparison measures the framework rather than one circle's SVG.
 *
 * Shape carries the same split as colour — ◆ for a platinumed title, ● for the
 * rest — so the chart still reads with the colour removed.
 */
export const ScatterMark = (props: ScatterMarkProps) => {
  const fill = seriesColor(props.hasPlatinum);
  const shapeJSX = props.hasPlatinum ? (
    <path
      d={`M 0 ${-props.radius} L ${props.radius} 0 L 0 ${props.radius} L ${-props.radius} 0 Z`}
      fill={fill}
      fillOpacity={0.8}
      stroke={CHART_INK.surface}
      strokeWidth={1.5}
    />
  ) : (
    <circle
      fill={fill}
      fillOpacity={0.7}
      r={props.radius}
      stroke={CHART_INK.surface}
      strokeWidth={1.5}
    />
  );

  return (
    <g transform={`translate(${props.cx} ${props.cy})`}>
      <motion.g
        animate={{ opacity: 1 }}
        aria-label={props.label}
        className='cursor-pointer'
        initial={{ opacity: 0 }}
        onClick={props.onSelect}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') props.onSelect();
        }}
        onMouseEnter={props.onEnter}
        onMouseLeave={props.onLeave}
        role='button'
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        // The table view is the keyboard path — 79 tab stops before the next
        // control would be worse than none. Focusable, just not in the order.
        tabIndex={-1}
        transition={{ delay: props.delay, duration: 0.35, ease: 'easeOut' }}
        whileHover={{ scale: 1.45 }}>
        {shapeJSX}
        {/* A 4px dot is not a hit target; this is the one you actually hover. */}
        <circle fill='transparent' r={Math.max(props.radius, 9)} />
      </motion.g>
    </g>
  );
};

/* Types */
interface ScatterMarkProps {
  cx: number;
  cy: number;
  delay: number;
  hasPlatinum: boolean;
  label: string;
  onEnter: () => void;
  onLeave: () => void;
  onSelect: () => void;
  radius: number;
}
