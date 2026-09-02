import type { TooltipRow } from '../components/chart-tooltip.tsx';
import { type CircadianHour, hourLabel } from '../helpers/stats.ts';

export const SPOKES = 24;
export const SPOKE_ANGLE = (Math.PI * 2) / SPOKES;
/** A hair of padding so neighbouring spokes read as separate marks. */
export const SPOKE_PAD = 0.012;

export const circadianRows = (hour: CircadianHour): TooltipRow[] => [
  { label: 'trophies', value: String(hour.count) },
  { label: 'share', value: `${hour.share.toFixed(1)}%` },
  { label: 'top title', value: hour.topGame ?? '—' },
];

export const circadianTitle = (hour: CircadianHour) =>
  `${hourLabel(hour.hour)}–${hourLabel((hour.hour + 1) % SPOKES)}`;
