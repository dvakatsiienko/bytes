import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import type {
  Game,
  GameDetail,
  NpssoStatus,
  Profile,
  Settings,
  TrophyArchive,
} from '../../shared/types.ts';

/**
 * Read as text first, parse second. Our own errors answer in JSON, but a
 * platform failure does not — Vercel's FUNCTION_INVOCATION_FAILED is plain
 * text, and parsing before the `ok` check turned that into a SyntaxError that
 * hid the real cause. Measured against production on 2026-09-04.
 */
const apiCall = async <T>(
  path: string,
  method = 'GET',
  sent?: unknown,
): Promise<T> => {
  const res = await fetch(`/api${path}`, {
    body: sent === undefined ? undefined : JSON.stringify(sent),
    // The admin session is an HttpOnly cookie on this same origin.
    credentials: 'same-origin',
    headers:
      sent === undefined ? undefined : { 'content-type': 'application/json' },
    method,
  });
  const body = await res.text();

  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    payload = null;
  }

  if (!res.ok) throw new Error(errorRead(payload) ?? bodyRead(body, res));
  if (payload === null)
    throw new Error(`${path} answered ${res.status} with a non-JSON body`);

  return payload as T;
};

/** The `{ error }` shape every route of ours uses for a failure. */
const errorRead = (payload: unknown) => {
  if (typeof payload !== 'object' || payload === null) return null;
  const { error } = payload as { error?: unknown };
  return typeof error === 'string' ? error : null;
};

/** Whatever the platform said, trimmed to something a toast can hold. */
const bodyRead = (body: string, res: Response) =>
  body.trim().slice(0, 200) || res.statusText || `HTTP ${res.status}`;

const apiGet = <T>(path: string) => apiCall<T>(path);
const apiPost = <T>(path: string, sent?: unknown) =>
  apiCall<T>(path, 'POST', sent);
const apiDelete = <T>(path: string) => apiCall<T>(path, 'DELETE');

export const useProfile = () =>
  useQuery({
    queryFn: () => apiGet<Profile>('/profile'),
    queryKey: ['profile'],
  });

export const useGames = () =>
  useQuery({
    queryFn: () => apiGet<Game[]>('/games'),
    queryKey: ['games'],
  });

export const useGame = (gameId: string | null) =>
  useQuery({
    enabled: Boolean(gameId),
    queryFn: () =>
      apiGet<GameDetail>(`/games/${encodeURIComponent(gameId ?? '')}`),
    queryKey: ['game', gameId],
  });

export const useStats = () =>
  useQuery({
    queryFn: () => apiGet<TrophyArchive>('/stats'),
    queryKey: ['stats'],
  });

/**
 * Public on purpose — the charts read it with no cookie. Only the admin page
 * writes, through `useSettingsSave`.
 */
export const useSettings = () =>
  useQuery({
    queryFn: () => apiGet<Settings>('/settings'),
    queryKey: ['settings'],
  });

/* Admin */

/**
 * Never 401s — it answers `{ authed }` either way, so the page picks a screen
 * from data instead of from a thrown error. `staleTime: 0` so signing in or
 * out is reflected the moment the mutation invalidates it.
 */
export const useAdminSession = () =>
  useQuery({
    queryFn: () => apiGet<{ authed: boolean }>('/admin/session'),
    queryKey: ['admin', 'session'],
    retry: false,
    staleTime: 0,
  });

/** Every title, hidden ones included, each carrying its `hidden` flag. */
export const useAdminGames = (enabled: boolean) =>
  useQuery({
    enabled,
    queryFn: () => apiGet<Game[]>('/games?all=1'),
    queryKey: ADMIN_GAMES_KEY,
  });

/**
 * How old the stored NPSSO is, and how long the dead ones lasted. Read-only:
 * the measuring is the server's, and this only reports it.
 */
export const useNpssoStatus = (enabled: boolean) =>
  useQuery({
    enabled,
    queryFn: () => apiGet<NpssoStatus>('/admin/token'),
    queryKey: ['admin', 'token'],
  });

export const useAdminLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      apiPost<{ ok: true }>('/admin/login', credentials),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin'] }),
  });
};

export const useAdminLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiPost<{ ok: true }>('/admin/logout'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin'] }),
  });
};

/** The server echoes the saved settings, so the cache takes them directly. */
export const useSettingsSave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Settings) =>
      apiPost<Settings>('/admin/settings', settings),
    onSuccess: (saved) => queryClient.setQueryData(['settings'], saved),
  });
};

/**
 * Takes the rows to flip, never the whole set: the set is derived here, from
 * the cache, at the moment the request fires.
 *
 * ⚠️ Both halves of that are load-bearing. Deriving in the component reads a
 * value from the last render, so two fast toggles both computed from the same
 * starting set and the second silently undid the first. And the rollback is
 * conditional, because a failure restoring its own snapshot erases every toggle
 * made after it — which is how the admin once showed rows hidden that the store
 * never held.
 */
export const useHiddenSave = () => {
  const queryClient = useQueryClient();

  const hiddenNext = (ids: string[], hide: boolean) => {
    const games = queryClient.getQueryData<Game[]>(ADMIN_GAMES_KEY) ?? [];
    const next = new Set(
      games.filter((game) => game.hidden).map((game) => game.id),
    );

    for (const id of ids) {
      if (hide) next.add(id);
      else next.delete(id);
    }

    return [...next];
  };

  // Generics are spelled out because `onError` sorts before `onMutate`, and
  // the context type is inferred from whichever comes first.
  return useMutation<{ ids: string[] }, Error, HiddenFlip, HiddenContext>({
    mutationFn: (flip) =>
      apiPost<{ ids: string[] }>('/admin/hidden', {
        ids: hiddenNext(flip.ids, flip.hide),
      }),
    mutationKey: HIDDEN_KEY,
    onError: (_error, _flip, context) => {
      // Something newer is still in flight and owns the cache now.
      if (queryClient.isMutating({ mutationKey: HIDDEN_KEY }) > 1) return;
      queryClient.setQueryData(ADMIN_GAMES_KEY, context?.previous);
    },
    onMutate: async (flip) => {
      await queryClient.cancelQueries({ queryKey: ADMIN_GAMES_KEY });

      const previous = queryClient.getQueryData<Game[]>(ADMIN_GAMES_KEY);
      const flipping = new Set(flip.ids);

      queryClient.setQueryData<Game[]>(ADMIN_GAMES_KEY, (games) =>
        games?.map((game) =>
          flipping.has(game.id) ? { ...game, hidden: flip.hide } : game,
        ),
      );

      return { previous };
    },
    onSuccess: () => appRefetch(queryClient),
  });
};

const HIDDEN_KEY = ['admin', 'hidden'] as const;

export interface HiddenFlip {
  hide: boolean;
  ids: string[];
}

/**
 * A new token invalidates everything, not just the admin keys: repairing the
 * NPSSO is what makes the rest of the app work again, and it should recover
 * without a reload.
 */
export const useNpssoSave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (npsso: string) =>
      apiPost<{ ok: true }>('/admin/npsso', { npsso }),
    onSuccess: () => appRefetch(queryClient),
  });
};

/** Forgets the pasted token so the `NPSSO` env var becomes the source again. */
export const useNpssoDrop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiDelete<{ ok: true }>('/admin/npsso'),
    onSuccess: () => appRefetch(queryClient),
  });
};

/* Helpers */

const ADMIN_GAMES_KEY = ['admin', 'games'] as const;

/**
 * Everything the change could have altered, minus the admin session itself.
 * A bare `invalidateQueries()` also resets that one, and the admin screen
 * flickers back through its pending state — which throws away the filter and
 * the page size the owner was mid-way through using. Measured 2026-09-10.
 */
const appRefetch = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({
    predicate: (query) =>
      !(query.queryKey[0] === 'admin' && query.queryKey[1] === 'session'),
  });

/* Types */

/** What `useHiddenSave`'s optimistic write hands its own rollback. */
interface HiddenContext {
  previous: Game[] | undefined;
}
