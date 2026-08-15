import type { NewsFeed } from '../../shared/types.ts';
import { TrophyRow } from './trophy-row.tsx';

interface NewsPanelProps {
  error: string | null;
  news: NewsFeed | null;
}

export const NewsPanel = ({ news, error }: NewsPanelProps) => (
  <section className='panel flex min-h-0 flex-col'>
    <span className='panel-title'>new since last snapshot</span>

    {error && <p className='p-4 text-red'>error · {error}</p>}
    {!(news || error) && (
      <p className='p-4 text-dim'>scanning recent titles…</p>
    )}
    {news?.isBaseline && (
      <p className='p-4 text-yellow'>
        baseline not set — run snapshot to start tracking.
      </p>
    )}
    {news && !news.isBaseline && news.trophies.length === 0 && (
      <p className='p-4 text-dim'>nothing new. go play something.</p>
    )}

    {news?.drifted.map((drift) => (
      <p className='px-4 py-2 text-[11px] text-yellow' key={drift.gameId}>
        {drift.gameName} changed its trophy set
        {drift.added > 0 ? ` · ${drift.added} trophies added` : ''}
      </p>
    ))}

    <ul className='min-h-0 flex-1 overflow-y-auto'>
      {news?.trophies.map((trophy) => (
        <TrophyRow
          key={`${trophy.gameId}-${trophy.id}`}
          note={trophy.gameName}
          trophy={trophy}
        />
      ))}
    </ul>
  </section>
);
