import { cacheClear, cached } from './cache.ts';
import { newsFetch } from './news.ts';
import { gameDetailFetch, gamesFetch, profileFetch } from './psn.ts';
import { isStateWritable, stateBackend } from './state.ts';

const GAME_PATH = /^\/api\/games\/([\w-]+)$/;

export interface RouteResult {
  body: unknown;
  status: number;
}

export const routeResolve = async (
  url: URL,
  method: string,
): Promise<RouteResult> => {
  const path = url.pathname;
  const ok = (body: unknown) => ({ body, status: 200 });

  if (path === '/api/health') return ok({ ok: true, stateBackend });
  if (path === '/api/profile') return ok(await cached('profile', profileFetch));
  if (path === '/api/news')
    return ok(await cached('news', () => newsFetch({ commit: false })));

  if (path === '/api/games') {
    const limit = Number(url.searchParams.get('limit') ?? 100);
    return ok(await cached(`games:${limit}`, () => gamesFetch(limit)));
  }

  if (path === '/api/snapshot' && method === 'POST') {
    if (!isStateWritable) {
      return {
        body: {
          error: 'no KV store linked — the baseline cannot persist here',
        },
        status: 501,
      };
    }

    cacheClear();
    return ok(await newsFetch({ commit: true }));
  }

  const gameId = path.match(GAME_PATH)?.[1];
  if (gameId)
    return ok(await cached(`game:${gameId}`, () => gameDetailFetch(gameId)));

  return { body: { error: 'not found' }, status: 404 };
};
