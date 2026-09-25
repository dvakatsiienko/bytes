import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Time } from '../art/time.ts';
import type { Stash, Take, TakeList } from '../server/takes.ts';
import type { Settings } from './stage/settings.ts';

const api = async <T>(
  path: string,
  init?: { method: string; body?: unknown },
): Promise<T> => {
  const response = await fetch(path, {
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
    headers:
      init?.body === undefined
        ? undefined
        : { 'content-type': 'application/json' },
    method: init?.method ?? 'GET',
  });
  const body: unknown = await response.json();
  if (!response.ok) {
    const message =
      typeof body === 'object' && body !== null && 'error' in body
        ? String(body.error)
        : response.statusText;
    throw new Error(message);
  }
  return body as T;
};

const takesKey = (piece: string) => ['takes', piece] as const;

export const takeUrl = (
  take: Pick<Take, 'piece' | 'id'>,
  file: 'bake.webp' | 'bake.avif' | 'piece.svg' = 'bake.webp',
) =>
  `/api/takes/${encodeURIComponent(take.piece)}/${encodeURIComponent(take.id)}/${file}`;

export const useTakes = (piece: string) =>
  useQuery({
    queryFn: () => api<TakeList>(`/api/takes/${encodeURIComponent(piece)}`),
    queryKey: takesKey(piece),
  });

export const useBake = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      piece: string;
      time: Time;
      settings: Settings;
      note: string;
    }) => api<Take>('/api/bake', { body: input, method: 'POST' }),
    onSuccess: (take) =>
      client.invalidateQueries({ queryKey: takesKey(take.piece) }),
  });
};

export const useUpdateTake = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { take: Take; note?: string; stash?: Stash | null }) =>
      api<Take>(
        `/api/takes/${encodeURIComponent(input.take.piece)}/${encodeURIComponent(input.take.id)}`,
        {
          body: { note: input.note, stash: input.stash },
          method: 'PATCH',
        },
      ),
    onSuccess: (take) =>
      client.invalidateQueries({ queryKey: takesKey(take.piece) }),
  });
};

export const usePromote = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (take: Take) =>
      api<TakeList>(
        `/api/takes/${encodeURIComponent(take.piece)}/${encodeURIComponent(take.id)}/promote`,
        {
          method: 'POST',
        },
      ),
    onSuccess: (list, take) => client.setQueryData(takesKey(take.piece), list),
  });
};
