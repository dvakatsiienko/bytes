import { dateFormat, hoursFormat } from '../helpers/format.ts';
import type { AbandonedRun } from './abandoned-runs.ts';
import { gradeBreakdown } from './abandoned-runs.ts';

/**
 * Titles dropped between 80% and the platinum. A ranked list rather than a
 * plotted chart: five rows of names, grades and hours say more than five bars
 * of one number, and the row is the link to the title.
 */
export const AbandonedPanel = (props: AbandonedPanelProps) => {
  if (props.runs.length === 0)
    return (
      <p className='grid h-24 place-items-center px-6 text-center text-[12px] text-dim'>
        nothing sitting between 80% and a platinum.
      </p>
    );

  const runListJSX = props.runs.map((run) => {
    return (
      <li
        className='flex items-baseline gap-2 border-line/60 border-b py-1 last:border-b-0'
        key={run.gameId}>
        <button
          className='min-w-0 flex-1 cursor-pointer truncate text-left text-fg-soft hover:text-orange'
          onClick={() => props.onSelect(run.gameId)}
          type='button'>
          {run.name}
        </button>
        <span className='shrink-0 text-yellow tabular-nums'>
          {run.progress}%
        </span>
        <span className='shrink-0 text-mute'>{gradeBreakdown(run.left)}</span>
        <span className='shrink-0 text-dim tabular-nums'>
          {hoursFormat(run.hours)}
        </span>
        <span className='shrink-0 text-dim'>{dateFormat(run.playedAt)}</span>
      </li>
    );
  });

  return <ul className='px-4 py-2 text-[12px]'>{runListJSX}</ul>;
};

/* Types */
interface AbandonedPanelProps {
  onSelect: (gameId: string) => void;
  runs: AbandonedRun[];
}
