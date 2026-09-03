import { dateFormat, hoursFormat } from '../helpers/format.ts';
import type { AbandonedRun } from './abandoned-runs.ts';
import { gradeBreakdown } from './abandoned-runs.ts';
import type { BarChart } from './bar-rows.tsx';
import { BarRows } from './bar-rows.tsx';

/**
 * The funnel, plus the one bucket worth naming its members. Titles dropped
 * between 80% and the platinum used to be their own panel, but they are exactly
 * a slice of "deep in" — five rows restating five rows. Folded in as a
 * disclosure instead, which is keyboard-reachable with no work from us.
 */
export const BacklogPanel = (props: BacklogPanelProps) => {
  const runListJSX = props.abandoned.map((run) => {
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

  return (
    <div className='flex flex-col'>
      <BarRows
        axis={props.chart.axis}
        empty='no titles in the library yet'
        label='Titles bucketed by completion'
        rows={props.chart.bars}
      />

      <details className='border-line border-t px-4 py-2 text-[10px]'>
        <summary className='cursor-pointer text-dim marker:text-mute hover:text-orange'>
          dropped one step from the platinum ({props.abandoned.length})
        </summary>

        {props.abandoned.length ? (
          <ul className='mt-1.5'>{runListJSX}</ul>
        ) : (
          <p className='mt-1.5 text-mute'>
            nothing sitting between 80% and a platinum.
          </p>
        )}
      </details>
    </div>
  );
};

/* Types */
interface BacklogPanelProps {
  abandoned: AbandonedRun[];
  chart: BarChart;
  onSelect: (gameId: string) => void;
}
