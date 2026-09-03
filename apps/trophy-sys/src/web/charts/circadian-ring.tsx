import { Group } from '@visx/group';
import { ParentSize } from '@visx/responsive';
import { scaleLinear } from '@visx/scale';
import { Arc } from '@visx/shape';
import { useTooltip } from '@visx/tooltip';
import { motion } from 'motion/react';

import type { TooltipRow } from '../components/chart-tooltip.tsx';
import { ChartTooltip, TooltipLayer } from '../components/chart-tooltip.tsx';
import { CHART_INK } from '../helpers/chart-theme.ts';
import { type CircadianHour, hourRangeFormat } from '../helpers/stats.ts';

export const CircadianRing = (props: CircadianRingProps) => (
  <div className='relative h-80 w-full'>
    <ParentSize>
      {(size) =>
        size.width > 0 ? (
          <Ring height={size.height} hours={props.hours} width={size.width} />
        ) : null
      }
    </ParentSize>
  </div>
);

const Ring = (props: RingProps) => {
  const half = Math.min(props.width, props.height) / 2;
  const outer = half * RING_OUTER;
  const inner = half * RING_INNER;

  const rScale = scaleLinear<number>({
    domain: [0, Math.max(...props.hours.map((hour) => hour.count), 1)],
    range: [inner + 2, outer],
  });

  const tooltip = useTooltip<CircadianHour>();

  const centerX = props.width / 2;
  const centerY = props.height / 2;

  const spokeListJSX = props.hours.map((hour) => {
    const start = SPOKE_ANGLE * hour.hour + SPOKE_PAD;
    const end = SPOKE_ANGLE * (hour.hour + 1) - SPOKE_PAD;
    const mid = (start + end) / 2;
    const radius = rScale(hour.count);

    return (
      <Arc<CircadianHour>
        cornerRadius={1}
        data={hour}
        endAngle={end}
        innerRadius={inner}
        key={hour.hour}
        outerRadius={radius}
        startAngle={start}>
        {({ path }) => (
          <motion.path
            animate={{ opacity: 1 }}
            className='cursor-pointer'
            d={path(hour) ?? ''}
            fill={CHART_INK.ring}
            fillOpacity={0.7}
            initial={{ opacity: 0 }}
            onMouseEnter={() => {
              tooltip.showTooltip({
                tooltipData: hour,
                tooltipLeft: centerX + Math.sin(mid) * radius,
                tooltipTop: centerY - Math.cos(mid) * radius,
              });
            }}
            onMouseLeave={tooltip.hideTooltip}
            stroke={CHART_INK.surface}
            strokeWidth={1}
            transition={{ delay: hour.hour * 0.02, duration: 0.35 }}
            whileHover={{ fillOpacity: 1 }}
          />
        )}
      </Arc>
    );
  });

  const labelListJSX = props.hours
    .filter((hour) => hour.hour % 3 === 0)
    .map((hour) => {
      const mid = SPOKE_ANGLE * (hour.hour + 0.5);

      return (
        <text
          dominantBaseline='middle'
          fill={CHART_INK.axis}
          fontSize={9}
          key={hour.hour}
          textAnchor='middle'
          x={Math.sin(mid) * (outer + 12)}
          y={-Math.cos(mid) * (outer + 12)}>
          {String(hour.hour).padStart(2, '0')}
        </text>
      );
    });

  return (
    <>
      <svg
        aria-label='Trophies earned by hour of day, one spoke per hour'
        height={props.height}
        role='img'
        width={props.width}>
        <motion.g
          animate={{ opacity: 1, scale: 1 }}
          initial={{ opacity: 0, scale: 0.92 }}
          style={{ transformBox: 'view-box', transformOrigin: 'center' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}>
          <Group left={centerX} top={centerY}>
            <circle
              fill='none'
              r={outer}
              stroke={CHART_INK.grid}
              strokeOpacity={0.3}
            />
            {spokeListJSX}
            {labelListJSX}
          </Group>
        </motion.g>
      </svg>

      {tooltip.tooltipOpen && tooltip.tooltipData && (
        <TooltipLayer left={tooltip.tooltipLeft} top={tooltip.tooltipTop}>
          <ChartTooltip
            rows={circadianRows(tooltip.tooltipData)}
            title={hourRangeFormat(tooltip.tooltipData)}
          />
        </TooltipLayer>
      )}
    </>
  );
};

/* Helpers */
const SPOKES = 24;
const SPOKE_ANGLE = (Math.PI * 2) / SPOKES;
/** A hair of padding so neighbouring spokes read as separate marks. */
const SPOKE_PAD = 0.012;

/** Fractions of half the plot square. */
const RING_OUTER = 0.86;
const RING_INNER = 0.28;

const circadianRows = (hour: CircadianHour): TooltipRow[] => [
  { label: 'trophies', value: String(hour.count) },
  { label: 'share', value: `${hour.share.toFixed(1)}%` },
  { label: 'top title', value: hour.topGame ?? '—' },
];

/* Types */
interface CircadianRingProps {
  hours: CircadianHour[];
}

interface RingProps extends CircadianRingProps {
  height: number;
  width: number;
}
