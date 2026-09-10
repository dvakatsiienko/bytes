import type { Settings } from '../shared/types.ts';
import {
  ADMIN_COOKIE,
  adminConfig,
  clearCookie,
  cookieRead,
  gamesView,
  hiddenSet,
  loginAttempt,
  npssoSet,
  sessionCookie,
  sessionVerify,
} from './admin.ts';
import { cacheClear, cached } from './cache.ts';
import { newsFetch } from './news.ts';
import { gameDetailFetch, profileFetch } from './psn.ts';
import {
  hiddenLoad,
  isStateWritable,
  npssoStatusLoad,
  settingsLoad,
  settingsSave,
  stateBackend,
} from './state.ts';
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

/**
 * The parts of the request the admin routes need beyond the path: the cookie
 * and host headers, and the parsed JSON body.
 */
export interface RouteRequest {
  body: unknown;
  headers: Record<string, string | undefined>;
}

const UNWRITABLE = {
  body: { error: 'no KV store linked — admin settings cannot persist here' },
  status: 501,
};

/** Null when the admin is unconfigured — never a reason to grant access. */
const adminAuthed = (request: RouteRequest) => {
  const config = adminConfig();
  if (!config) return null;

  return sessionVerify(
    config,
    cookieRead(request.headers.cookie, ADMIN_COOKIE),
  );
};

export const routeResolve = async (
  url: URL,
  method: string,
  request: RouteRequest = { body: null, headers: {} },
): Promise<RouteResult> => {
  const path = url.pathname;
  const ok = (body: unknown) => ({ body, status: 200 });

  if (path.startsWith('/api/admin/')) {
    const config = adminConfig();
    if (!config)
      return { body: { error: 'admin is not configured' }, status: 503 };

    const host = request.headers.host ?? '';
    const body = (request.body ?? {}) as Record<string, unknown>;
    const authed = sessionVerify(
      config,
      cookieRead(request.headers.cookie, ADMIN_COOKIE),
    );

    if (path === '/api/admin/session') return ok({ authed });

    if (path === '/api/admin/login' && method === 'POST') {
      const attempt = loginAttempt(config, body.email, body.password);

      if (attempt.kind === 'locked')
        return {
          body: {
            error: `too many attempts — try again in ${attempt.retryAfterSeconds}s`,
          },
          headers: { 'retry-after': String(attempt.retryAfterSeconds) },
          status: 429,
        };

      if (attempt.kind === 'rejected')
        return { body: { error: 'bad credentials' }, status: 401 };

      return {
        body: { ok: true },
        headers: { 'set-cookie': sessionCookie(config, host) },
        status: 200,
      };
    }

    if (path === '/api/admin/logout' && method === 'POST')
      return {
        body: { ok: true },
        headers: { 'set-cookie': clearCookie(host) },
        status: 200,
      };

    if (!authed) return { body: { error: 'not signed in' }, status: 401 };

    if (path === '/api/admin/token' && method === 'GET')
      return ok(await npssoStatusLoad());

    if (path === '/api/admin/hidden' && method === 'GET')
      return ok({ ids: await hiddenLoad() });

    if (path === '/api/admin/hidden' && method === 'POST') {
      if (!isStateWritable) return UNWRITABLE;

      const ids = await hiddenSet(body.ids);
      if (!ids)
        return {
          body: { error: 'ids must be an array of strings' },
          status: 400,
        };

      // The library answers are memoised, and the hidden set is what they were
      // filtered by.
      cacheClear();
      return ok({ ids });
    }

    if (path === '/api/admin/settings' && method === 'POST') {
      if (!isStateWritable) return UNWRITABLE;

      if (typeof body.effortHideUntouched !== 'boolean')
        return {
          body: { error: 'effortHideUntouched must be a boolean' },
          status: 400,
        };

      const settings: Settings = {
        effortHideUntouched: body.effortHideUntouched,
      };
      await settingsSave(settings);
      cacheClear();
      return ok(settings);
    }

    if (path === '/api/admin/npsso' && method === 'POST') {
      if (!isStateWritable) return UNWRITABLE;

      if (!(await npssoSet(body.npsso)))
        return {
          body: { error: 'npsso must be a 64-character token' },
          status: 400,
        };

      cacheClear();
      return ok({ ok: true });
    }

    return { body: { error: 'not found' }, status: 404 };
  }

  if (path === '/api/health') return ok({ ok: true, stateBackend });
  // Read without the cookie: the charts need these, and nothing here is a
  // secret — the write side is what the admin session guards.
  if (path === '/api/settings')
    return ok(await cached('settings', settingsLoad));

  if (path === '/api/profile') return ok(await cached('profile', profileFetch));
  if (path === '/api/news')
    return ok(await cached('news', () => newsFetch({ commit: false })));

  if (path === '/api/games') {
    const limit = limitParse(url.searchParams.get('limit'));

    // ⚠️ `all=1` is the admin's view — every title plus the `hidden` flag — and
    // it was reachable without a cookie, so the whole hide feature came undone
    // by appending a query string. Unauthenticated callers get the filtered
    // list rather than a 401: refusing would confirm the parameter exists.
    const all =
      url.searchParams.get('all') === '1' && adminAuthed(request) === true;

    const key = all ? `games:all:${limit}` : `games:${limit}`;
    return ok(await cached(key, () => gamesView(limit, all)));
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
