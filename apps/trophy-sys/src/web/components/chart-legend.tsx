import { EFFORT_SERIES } from '../helpers/chart-theme.ts';

/**
 * The swatch row for any chart drawing more than one series. Plain HTML rather
 * than a charting-library legend: matching the terminal look through visx style
 * props cost more than these few lines.
 *
 * An item may carry a glyph instead of a square, which is how the effort
 * scatter keeps colour from being its only cue — the mark shape says the same
 * thing, so the split survives a greyscale print.
 */
export const SeriesLegend = (props: SeriesLegendProps) => {
  const itemListJSX = props.items.map((item) => {
    return (
      <span className='flex items-center gap-1.5' key={item.label}>
        {item.glyph ? (
          <span style={{ color: item.tone }}>{item.glyph}</span>
        ) : (
          <span
            className='inline-block size-2 shrink-0'
            style={{ background: item.tone }}
          />
        )}
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

export const EffortLegend = () => (
  <SeriesLegend
    items={EFFORT_SERIES.map((series) => ({
      glyph: series.key === 'platinum' ? '◆' : '●',
      label: series.label,
      tone: series.color,
    }))}
  />
);

/* Types */
export interface LegendItem {
  /** A character drawn instead of the square, when shape carries meaning. */
  glyph?: string;
  label: string;
  tone: string;
}

interface SeriesLegendProps {
  items: LegendItem[];
}
