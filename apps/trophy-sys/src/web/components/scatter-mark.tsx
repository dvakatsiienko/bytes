import { motion } from 'motion/react';

import { CHART_INK, seriesColor } from '../helpers/chart-theme.ts';

/**
 * Shared by both charting libraries on purpose: the bake-off is about scales,
 * axes, tooltips and layout, so the mark itself is held identical and the
 * comparison measures the framework rather than one circle's SVG.
 *
 * Shape carries the same split as colour — ◆ for a platinumed title, ● for the
 * rest — so the chart still reads with the colour removed.
 *
 * The mark listens for nothing. Both charts hit-test by nearest data point at
 * the chart level, because half these marks overlap and a mark buried under a
 * later one can never receive a hover of its own.
 */
export const ScatterMark = (props: ScatterMarkProps) => {
  const fill = seriesColor(props.hasPlatinum);
  const shapeJSX = props.hasPlatinum ? (
    <path
      d={`M 0 ${-props.radius} L ${props.radius} 0 L 0 ${props.radius} L ${-props.radius} 0 Z`}
      fill={fill}
      fillOpacity={props.isActive ? 1 : 0.8}
      stroke={props.isActive ? fill : CHART_INK.surface}
      strokeWidth={1.5}
    />
  ) : (
    <circle
      fill={fill}
      fillOpacity={props.isActive ? 1 : 0.7}
      r={props.radius}
      stroke={props.isActive ? fill : CHART_INK.surface}
      strokeWidth={1.5}
    />
  );

  return (
    <g transform={`translate(${props.cx} ${props.cy})`}>
      <motion.g
        animate={{ opacity: 1, scale: props.isActive ? 1.45 : 1 }}
        initial={{ opacity: 0, scale: 1 }}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        // Split so the hover response is immediate — sharing the enter
        // transition would make it wait out this mark's stagger delay.
        transition={{
          opacity: { delay: props.delay, duration: 0.35, ease: 'easeOut' },
          scale: { duration: 0.15, ease: 'easeOut' },
        }}>
        {shapeJSX}
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
  isActive: boolean;
  radius: number;
}
