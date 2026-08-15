import { NewsPanel } from './components/news-panel.tsx';
import { useNews, useSnapshot } from './hooks/queries.ts';

export const News = () => {
  const news = useNews();
  const snapshot = useSnapshot();

  return (
    <main className='grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-3'>
      <div className='flex items-center gap-3'>
        <button
          className='cursor-pointer border border-line px-3 py-1 text-[11px] text-dim uppercase tracking-[0.15em] transition-colors hover:border-orange hover:text-orange disabled:cursor-wait disabled:opacity-50'
          disabled={snapshot.isPending}
          onClick={() => snapshot.mutate()}
          type='button'>
          {snapshot.isPending ? 'scanning…' : 'mark all as seen'}
        </button>

        <span className='text-[10px] text-dim'>
          {snapshot.error
            ? `snapshot failed · ${snapshot.error.message}`
            : 'records what you have now, so the next visit shows only what is new'}
        </span>
      </div>

      <NewsPanel error={news.error?.message ?? null} news={news.data ?? null} />
    </main>
  );
};
