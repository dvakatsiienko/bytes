import { useEffect, useMemo } from 'react';
import { Outlet, useNavigate, useParams } from '@tanstack/react-router';

import { GameList } from './components/game-list.tsx';
import { GamePanel } from './components/game-panel.tsx';
import {
  GAME_SORT_ORDER,
  type GameSort,
  PLATINUM_MODE_ORDER,
  type PlatinumMode,
  gamesArrange,
} from './helpers/game-sort.ts';
import { useGame, useGames } from './hooks/queries.ts';
import { useStored } from './hooks/use-stored.ts';

/**
 * Layout for /library — the list persists while the detail route swaps. The
 * arrangement lives here rather than in GameList because the route needs the
 * top of the list to pick a default game.
 */
export const Library = () => {
  const navigate = useNavigate();
  const games = useGames();
  const params = useParams({ strict: false }) as { gameId?: string };

  const [sort, setSort] = useStored<GameSort>(
    'library-sort',
    'played',
    GAME_SORT_ORDER,
  );
  const [platinum, setPlatinum] = useStored<PlatinumMode>(
    'library-platinum',
    'mixed',
    PLATINUM_MODE_ORDER,
  );

  const arranged = useMemo(
    () => gamesArrange(games.data ?? [], sort, platinum),
    [games.data, sort, platinum],
  );

  // Landing on /library with nothing selected opens the top of the list, so the
  // right panel is never empty on arrival or after a reload. `replace` keeps
  // the bare /library out of history — going back would only redirect again.
  const firstId = arranged[0]?.id;

  useEffect(() => {
    if (params.gameId || !firstId) return;

    navigate({
      params: { gameId: firstId },
      replace: true,
      to: '/library/$gameId',
    });
  }, [params.gameId, firstId, navigate]);

  return (
    <main className='grid min-h-0 flex-1 grid-cols-[minmax(280px,1fr)_1.4fr] gap-5'>
      <GameList
        games={arranged}
        onPlatinumChange={setPlatinum}
        onSelect={(gameId) =>
          navigate({ params: { gameId }, to: '/library/$gameId' })
        }
        onSortChange={setSort}
        platinum={platinum}
        selectedId={params.gameId ?? null}
        sort={sort}
        total={games.data?.length ?? 0}
      />
      <Outlet />
    </main>
  );
};

/** Only reachable while the library loads, or when it arranges to nothing. */
export const LibraryEmpty = () => {
  const games = useGames();

  return (
    <section className='panel grid place-items-center text-dim'>
      {games.isPending ? 'loading library…' : 'no titles to show'}
    </section>
  );
};

export const LibraryGame = () => {
  const { gameId } = useParams({ from: '/library/$gameId' });
  const game = useGame(gameId);

  return (
    <GamePanel error={game.error?.message ?? null} game={game.data ?? null} />
  );
};
