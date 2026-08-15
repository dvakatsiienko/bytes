import { useState } from 'react';

import type { Game, GameDetail, NewsFeed, Profile } from '../shared/types.ts';
import { GameList } from './components/game-list.tsx';
import { GamePanel } from './components/game-panel.tsx';
import { NewsPanel } from './components/news-panel.tsx';
import { ProfileBar } from './components/profile-bar.tsx';
import { useApi } from './hooks/api.ts';

type Tab = 'library' | 'news';

export const App = () => {
  const [tab, setTab] = useState<Tab>('library');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const profile = useApi<Profile>('/profile');
  const games = useApi<Game[]>('/games');
  const news = useApi<NewsFeed>(tab === 'news' ? '/news' : null);

  const activeId = selectedId ?? games.data?.[0]?.id ?? null;
  const game = useApi<GameDetail>(activeId ? `/games/${activeId}` : null);

  return (
    <div className='flex h-full flex-col gap-5 p-6'>
      <div className='flex items-center gap-4'>
        <h1 className='glow text-lg text-orange tracking-[0.3em]'>
          TROPHY.SYS
        </h1>
        <nav className='flex gap-1'>
          {(['library', 'news'] as const).map((name) => (
            <button
              className={`border px-3 py-1 text-[11px] uppercase tracking-[0.15em] ${
                tab === name
                  ? 'border-orange text-orange'
                  : 'border-line text-dim hover:text-fg-soft'
              }`}
              key={name}
              onClick={() => setTab(name)}
              type='button'>
              {name}
            </button>
          ))}
        </nav>
        <span className='ml-auto text-[10px] text-dim'>
          {games.error ??
            profile.error ??
            `${games.data?.length ?? 0} titles synced`}
        </span>
      </div>

      <ProfileBar profile={profile.data} />

      {tab === 'library' ? (
        <main className='grid min-h-0 flex-1 grid-cols-[minmax(280px,1fr)_1.4fr] gap-5'>
          <GameList
            games={games.data ?? []}
            onSelect={setSelectedId}
            selectedId={activeId}
          />
          <GamePanel error={game.error} game={game.data} />
        </main>
      ) : (
        <main className='grid min-h-0 flex-1'>
          <NewsPanel error={news.error} news={news.data} />
        </main>
      )}
    </div>
  );
};
