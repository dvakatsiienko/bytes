import { cacheClear, cached } from './cache.ts';
import { newsFetch } from './news.ts';
import { gameDetailFetch, gamesFetch, profileFetch } from './psn.ts';
import { isStateWritable, stateBackend } from './state.ts';
import { statsFetch, statsSync } from './stats.ts';

const GAME_PATH = /^\/api\/games\/([\w-]+)$/;

/**
 * 800 is PSN's page size for this endpoint, and the whole library rather than a
 * slice — a lower default silently truncated it. It also matches the key
 * gameDetailFetch caches under, so the list and any deep link share one fetch.
 */
const LIMIT_DEFAULT = 800;

/**
 * The value reaches PSN and becomes a cache key, so it is clamped rather than
 * trusted: `?limit=abc` used to pass NaN straight through, and an open range
 * let a query string mint unbounded cache entries.
 */
const limitParse = (raw: string | null) => {
  const parsed = Number(raw);
  if (raw === null || !Number.isInteger(parsed) || parsed < 1)
    return LIMIT_DEFAULT;

  return Math.min(parsed, LIMIT_DEFAULT);
};

export interface RouteResult {
  body: unknown;
  /** Extra response headers, lower-cased. Most routes need none. */
  headers?: Record<string, string>;
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
    const limit = limitParse(url.searchParams.get('limit'));
    return ok(await cached(`games:${limit}`, () => gamesFetch(limit)));
  }

  if (path === '/api/stats') {
    // The archive refreshes itself on read, and `x-archive-refresh` says which
    // way it went — the one thing about this route that cannot be established
    // without a live deploy. See `ArchiveRefresh`.
    const read = await cached('stats', statsFetch);
    return {
      body: read.archive,
      headers: { 'x-archive-refresh': read.refresh },
      status: 200,
    };
  }

  if (path === '/api/stats/sync' && method === 'POST') {
    if (!isStateWritable) {
      return {
        body: {
          error: 'no KV store linked — the trophy archive cannot persist here',
        },
        status: 501,
      };
    }

    cacheClear();
    return ok(await statsSync());
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
