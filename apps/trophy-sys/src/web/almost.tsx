import { AlmostPanel } from './components/almost-panel.tsx';
import { useAlmost } from './hooks/queries.ts';

export const Almost = () => {
  const almost = useAlmost();

  return (
    <main className='grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-3'>
      <span className='text-[10px] text-dim'>
        {almost.data
          ? `${almost.data.trophies.length} trophies in progress across ${almost.data.scanned} unfinished ps5 titles`
          : 'progress counters are a ps5 feature — older titles report nothing'}
      </span>

      <AlmostPanel
        almost={almost.data ?? null}
        error={almost.error?.message ?? null}
      />
    </main>
  );
};
