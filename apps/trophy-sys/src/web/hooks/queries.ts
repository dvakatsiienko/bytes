import { useQuery } from '@tanstack/react-query';

import type {
  Game,
  GameDetail,
  Profile,
  TrophyArchive,
} from '../../shared/types.ts';

/**
 * Read as text first, parse second. Our own errors answer in JSON, but a
 * platform failure does not — Vercel's FUNCTION_INVOCATION_FAILED is plain
 * text, and parsing before the `ok` check turned that into a SyntaxError that
 * hid the real cause. Measured against production on 2026-09-04.
 */
const apiCall = async <T>(path: string, method = 'GET'): Promise<T> => {
  const res = await fetch(`/api${path}`, { method });
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
