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

/** The swatch row for any chart drawing more than one series. */
export const SeriesLegend = (props: SeriesLegendProps) => {
  const itemListJSX = props.items.map((item) => {
    return (
      <span className='flex items-center gap-1.5' key={item.label}>
        <span
          className='inline-block size-2 shrink-0'
          style={{ background: item.tone }}
        />
        <span className='max-w-36 truncate'>{item.label}</span>
      </span>
    );
  });

  return (
    <div className='flex flex-wrap gap-x-4 gap-y-1 px-4 py-1.5 text-[10px] text-dim'>
      {itemListJSX}
    </div>
  );
};

/* Types */
export interface LegendItem {
  label: string;
  tone: string;
}

interface SeriesLegendProps {
  items: LegendItem[];
}
