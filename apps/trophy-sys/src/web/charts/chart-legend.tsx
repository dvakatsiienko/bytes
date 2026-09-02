import { EFFORT_SERIES } from '../helpers/chart-theme.ts';

/**
 * Plain HTML rather than a charting-library legend: matching the terminal look
 * through style props cost more than these six lines. Shape sits beside the
 * colour, so the split survives a greyscale print.
 */
export const EffortLegend = () => {
  const itemListJSX = EFFORT_SERIES.map((series) => {
    return (
      <span className='flex items-center gap-1.5' key={series.key}>
        <span style={{ color: series.color }}>
          {series.key === 'platinum' ? '◆' : '●'}
        </span>
        {series.label}
      </span>
    );
  });

  return (
    <div className='flex flex-wrap gap-4 px-4 py-1.5 text-[10px] text-dim'>
      {itemListJSX}
    </div>
  );
};
