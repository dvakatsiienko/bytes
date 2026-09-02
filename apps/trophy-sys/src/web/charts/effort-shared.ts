import type { TooltipRow } from '../components/chart-tooltip.tsx';
import type { EffortPoint } from '../helpers/stats.ts';

/** Held identical across both libraries: a fair A/B needs one encoding. */
export const SCATTER_MARGIN = { bottom: 36, left: 42, right: 14, top: 12 };

const MARK_MIN = 4;
const MARK_MAX = 15;

export const markPeak = (points: EffortPoint[]) =>
  Math.max(...points.map((point) => point.trophies), 2);

/**
 * d3's sqrt scale over [1, peak] → [4, 15] written out longhand, rather than
 * taken from @visx/scale, so recharts cannot drift from it. Area, not radius,
 * tracks the trophy count — a radius-linear dot lies about magnitude.
 */
export const markRadius = (trophies: number, peak: number) =>
  MARK_MIN +
  ((MARK_MAX - MARK_MIN) * (Math.sqrt(Math.max(trophies, 1)) - 1)) /
    (Math.sqrt(Math.max(peak, 2)) - 1);

export const hoursLabel = (hours: number) =>
  hours < 1 ? `${Math.round(hours * 60)}m` : `${Math.round(hours)}h`;

/** One tooltip body for both libraries, so only the plumbing differs. */
export const effortRows = (point: EffortPoint): TooltipRow[] => [
  { label: 'played', value: hoursLabel(point.hours) },
  { label: 'trophies', value: `${point.earned}/${point.trophies}` },
  { label: 'progress', value: `${point.progress}%` },
  {
    label: 'per trophy',
    value: point.perTrophy ? hoursLabel(point.perTrophy) : '—',
  },
];
