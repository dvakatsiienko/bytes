import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Build, Other } from '../server/build.ts';
import type { AnswerInput, JobView } from '../server/job.ts';

const jobKey = ['job'] as const;

/** the job, fetched again whenever the server sees a job file change */
export const useJob = () => {
  const queryClient = useQueryClient();
  useEffect(() => {
    const refresh = () => queryClient.invalidateQueries({ queryKey: jobKey });
    import.meta.hot?.on('loupe:job', refresh);
    return () => import.meta.hot?.off('loupe:job', refresh);
  }, [queryClient]);
  return useQuery({
    queryFn: () => api<JobView>('/api/job'),
    queryKey: jobKey,
  });
};

/** this loupe's checkout */
export const useBuild = () =>
  useQuery({ queryFn: () => api<Build>('/api/build'), queryKey: ['build'] })
    .data;

/** the other loupes that answer right now; a server that stops drops out within about 10 s */
export const useOthers = () =>
  useQuery({
    queryFn: () => api<Other[]>('/api/loupes'),
    queryKey: ['loupes'],
    refetchInterval: 10_000,
  }).data ?? [];

export const useAnswer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AnswerInput) => post('/api/answer', input),
    onSettled: () => queryClient.invalidateQueries({ queryKey: jobKey }),
  });
};

export const useReopen = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => post('/api/reopen', { id }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: jobKey }),
  });
};

/** «send round»: hands the round's answers to the designer now */
export const useSendRound = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => post('/api/send', {}),
    onSettled: () => queryClient.invalidateQueries({ queryKey: jobKey }),
  });
};

/* Helpers */

const api = async <T>(path: string): Promise<T> => {
  const response = await fetch(path);
  const body: unknown = await response.json();
  if (!response.ok) throw new Error(errorOf(body, response.status));
  return body as T;
};

const post = async (path: string, body: unknown) => {
  const response = await fetch(path, {
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  });
  if (!response.ok)
    throw new Error(errorOf(await response.json(), response.status));
};

const errorOf = (body: unknown, status: number) =>
  typeof body === 'object' && body !== null && 'error' in body
    ? String(body.error)
    : `the server answered ${status}`;
