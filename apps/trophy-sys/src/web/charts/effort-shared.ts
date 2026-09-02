import type { TooltipRow } from '../components/chart-tooltip.tsx';
import type { EffortPoint } from '../helpers/stats.ts';

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
