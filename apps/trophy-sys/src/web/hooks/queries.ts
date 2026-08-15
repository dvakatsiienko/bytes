import { useQuery } from '@tanstack/react-query';

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
    queryFn: () => apiGet<GameDetail>(`/games/${gameId}`),
    queryKey: ['game', gameId],
  });

export const useNews = (enabled: boolean) =>
  useQuery({
    enabled,
    queryFn: () => apiGet<NewsFeed>('/news'),
    queryKey: ['news'],
  });
