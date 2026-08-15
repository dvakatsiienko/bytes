import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  Game,
  GameDetail,
  NewsFeed,
  Profile,
} from '../../shared/types.ts';

const apiGet = async <T>(path: string): Promise<T> => {
  const res = await fetch(`/api${path}`);
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.error ?? res.statusText);
  return payload as T;
};

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

export const useNews = () =>
  useQuery({
    queryFn: () => apiGet<NewsFeed>('/news'),
    queryKey: ['news'],
    // A failed news scan costs 15 titles x 2 PSN calls; never replay it.
    retry: 0,
  });

/**
 * Commits the current earnings as the new baseline, which is what makes the
 * next /api/news diff meaningful. Deliberately a button rather than a side
 * effect of reading the feed.
 */
export const useSnapshot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/snapshot', { method: 'POST' });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? res.statusText);
      return payload;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['news'] }),
  });
};
