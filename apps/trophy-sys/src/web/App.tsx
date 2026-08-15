import { useNavigate, useSearch } from '@tanstack/react-router';

import { GameList } from './components/game-list.tsx';
import { GamePanel } from './components/game-panel.tsx';
import { NewsPanel } from './components/news-panel.tsx';
import { ProfileBar } from './components/profile-bar.tsx';
import { useGame, useGames, useNews, useProfile } from './hooks/queries.ts';
import { TABS, type Tab } from './search.ts';

export const App = () => {
  const { tab, game: selectedId } = useSearch({ from: '/' });
  const navigate = useNavigate({ from: '/' });

  const searchSet = (next: Partial<{ game: string; tab: Tab }>) =>
    navigate({ replace: true, search: (prev) => ({ ...prev, ...next }) });

  const profile = useProfile();
  const games = useGames();
  const news = useNews(tab === 'news');

  const activeId = selectedId ?? games.data?.[0]?.id ?? null;
  const game = useGame(activeId);

  const status =
    games.error?.message ??
    profile.error?.message ??
    `${games.data?.length ?? 0} titles synced`;

  return (
    <div className='flex h-full flex-col gap-5 p-6'>
      <div className='flex items-center gap-4'>
        <h1 className='glow text-lg text-orange tracking-[0.3em]'>
          TROPHY.SYS
        </h1>

        <nav className='flex gap-1'>
          {TABS.map((name) => (
            <button
              className={`cursor-pointer border px-3 py-1 text-[11px] uppercase tracking-[0.15em] transition-colors ${
                tab === name
                  ? 'border-orange text-orange'
                  : 'border-line text-dim hover:border-dim hover:text-fg-soft'
              }`}
              key={name}
              onClick={() => searchSet({ tab: name })}
              type='button'>
              {name}
            </button>
          ))}
        </nav>

        <span className='ml-auto text-[10px] text-dim'>{status}</span>
      </div>

      <ProfileBar profile={profile.data ?? null} />

      {tab === 'library' ? (
        <main className='grid min-h-0 flex-1 grid-cols-[minmax(280px,1fr)_1.4fr] gap-5'>
          <GameList
            games={games.data ?? []}
            onSelect={(gameId) => searchSet({ game: gameId })}
            selectedId={activeId}
          />
          <GamePanel
            error={game.error?.message ?? null}
            game={game.data ?? null}
          />
        </main>
      ) : (
        <main className='grid min-h-0 flex-1'>
          <NewsPanel
            error={news.error?.message ?? null}
            news={news.data ?? null}
          />
        </main>
      )}
    </div>
  );
};
