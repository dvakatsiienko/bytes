import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Time } from '../art/time.ts';
import type { BakeEvent } from '../server/plugin.ts';
import type { Stash, Take, TakeList } from '../server/takes.ts';
import { useRoute } from './route.ts';
import type { Settings } from './stage/settings.ts';

export type TakeFilter = (typeof takeFilters)[number];

const request = (path: string, init?: { method: string; body?: unknown }) =>
  fetch(path, {
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
    // every write says json: the server refuses anything else
    headers: init ? { 'content-type': 'application/json' } : undefined,
    method: init?.method ?? 'GET',
  });

const failure = async (response: Response) => {
  const body: unknown = await response.json().catch(() => null);
  return new Error(
    typeof body === 'object' && body !== null && 'error' in body
      ? String(body.error)
      : response.statusText,
  );
};

export const api = async <T>(
  path: string,
  init?: { method: string; body?: unknown },
): Promise<T> => {
  const response = await request(path, init);
  if (!response.ok) throw await failure(response);
  return (await response.json()) as T;
};

/** a bake answers one json line per step as it runs; the last line is the take or the error */
const postBake = async (
  input: BakeRequest,
  onStep: (step: string) => void,
): Promise<Take> => {
  const response = await request('/api/bake', { body: input, method: 'POST' });
  if (!(response.ok && response.body)) throw await failure(response);
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  let rest = '';
  for (;;) {
    // biome-ignore lint/performance/noAwaitInLoops: a stream is read one chunk after another
    const chunk = await reader.read();
    if (chunk.done) break;
    const lines = (rest + chunk.value).split('\n');
    rest = lines.pop() ?? '';
    for (const line of lines) {
      if (!line) continue;
      const event = JSON.parse(line) as BakeEvent;
      if ('step' in event) onStep(event.step);
      else if ('take' in event) return event.take;
      else throw new Error(event.error);
    }
  }
  throw new Error('the bake ended without a take');
};

const takesKey = (piece: string) => ['takes', piece] as const;

export const takeFilters = ['all', 'current', 'stashed'] as const;

/** `current` is what ships, by day or by night; `stashed` is what waits for another job */
export const filterTakes = (list: TakeList, filter: TakeFilter) => {
  if (filter === 'all') return list.takes;
  if (filter === 'stashed') return list.takes.filter((take) => take.stash);
  const current = new Set(Object.values(list.current));
  return list.takes.filter((take) => current.has(take.id));
};

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

/** the take the route shows, when it is one of this piece's takes */
export const useShownTake = (piece: string) => {
  const { view } = useRoute();
  const list = useTakes(piece).data;
  const take =
    view.kind === 'take'
      ? list?.takes.find((candidate) => candidate.id === view.take)
      : undefined;
  return { list, take };
};

export const useBake = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      onStep,
      ...input
    }: BakeRequest & { onStep: (step: string) => void }) =>
      postBake(input, onStep),
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

/* Types */

interface BakeRequest {
  frames: number;
  note: string;
  piece: string;
  settings: Settings;
  time: Time;
}
