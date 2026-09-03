import type { ReactNode } from 'react';

/** The one tooltip every chart uses, with the game icon slot. */
export const ChartTooltip = (props: ChartTooltipProps) => {
  const rowListJSX = props.rows.map((row) => {
    return (
      <div className='contents' key={row.label}>
        <dt className='text-mute'>{row.label}</dt>
        <dd className='text-right text-fg-soft'>{row.value}</dd>
      </div>
    );
  });

  return (
    <div className='pointer-events-none border border-line bg-bg-lift px-2 py-1.5 text-[10px] leading-relaxed'>
      <div className='flex items-center gap-1.5'>
        {props.iconUrl && (
          <img
            alt=''
            className='size-5 shrink-0 border border-line object-cover'
            height={20}
            src={props.iconUrl}
            width={20}
          />
        )}
        <span className='max-w-44 select-text truncate text-fg'>
          {props.title}
        </span>
      </div>

      {props.note && (
        <p className='mt-1 max-w-44 text-[9px] text-mute'>{props.note}</p>
      )}

      <dl className='mt-1 grid grid-cols-[auto_auto] gap-x-3'>{rowListJSX}</dl>
    </div>
  );
};

/**
 * Parks a tooltip at a point inside the chart and flips it back over that point
 * near the right or bottom edge, so it never leaves the panel.
 *
 * Deterministic, and deliberately not measured: visx's own bounds-detecting
 * tooltip builds a portal during render and destroys it on unmount, and that
 * portal leaves the document whenever the measured container bounds change.
 */
export const TooltipLayer = (props: TooltipLayerProps) => {
  const left = props.left ?? 0;
  const top = props.top ?? 0;
  const x = left > props.width * 0.6 ? 'calc(-100% - 12px)' : '12px';
  const y = top > props.height * 0.6 ? 'calc(-100% - 12px)' : '12px';

  return (
    <div
      className='pointer-events-none absolute z-50'
      style={{ left, top, transform: `translate(${x}, ${y})` }}>
      {props.children}
    </div>
  );
};

/* Types */
export interface TooltipRow {
  label: string;
  value: string;
}

interface ChartTooltipProps {
  iconUrl?: string;
  /** A line of prose above the readings — what a bucket means, say. */
  note?: string;
  rows: TooltipRow[];
  title: string;
}

interface TooltipLayerProps {
  children: ReactNode;
  height: number;
  left: number | undefined;
  top: number | undefined;
  width: number;
}
