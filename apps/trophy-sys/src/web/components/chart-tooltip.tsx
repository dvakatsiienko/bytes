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

      <dl className='mt-1 grid grid-cols-[auto_auto] gap-x-3'>{rowListJSX}</dl>
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
  rows: TooltipRow[];
  title: string;
}
