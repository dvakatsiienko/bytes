import { Outlet, useNavigate, useParams } from '@tanstack/react-router';

import { GameList } from './components/game-list.tsx';
import { GamePanel } from './components/game-panel.tsx';
import { useGame, useGames } from './hooks/queries.ts';

/** Layout for /library — the list persists while the detail route swaps. */
export const Library = () => {
  const navigate = useNavigate();
  const games = useGames();
  const params = useParams({ strict: false }) as { gameId?: string };

  return (
    <main className='grid min-h-0 flex-1 grid-cols-[minmax(280px,1fr)_1.4fr] gap-5'>
      <GameList
        games={games.data ?? []}
        onSelect={(gameId) =>
          navigate({ params: { gameId }, to: '/library/$gameId' })
        }
        selectedId={params.gameId ?? null}
      />
      <Outlet />
    </main>
  );
};

export const LibraryEmpty = () => (
  <section className='panel grid place-items-center text-dim'>
    pick a title on the left
  </section>
);

export const LibraryGame = () => {
  const { gameId } = useParams({ from: '/library/$gameId' });
  const game = useGame(gameId);

  return (
    <GamePanel error={game.error?.message ?? null} game={game.data ?? null} />
  );
};
