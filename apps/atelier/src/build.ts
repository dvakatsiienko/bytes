import { useQuery } from '@tanstack/react-query';

import type { Build, Other } from '../server/build.ts';
import { api } from './takes.ts';

/** this studio's checkout; asked again when the tab comes back, so a pull shows without a reload */
export const useBuild = () =>
  useQuery({
    queryFn: () => api<Build>('/api/build'),
    queryKey: ['build'],
  }).data;

/** the other ateliers that answer right now; a server that stops drops out on the next ask, about 10 s at most */
export const useOthers = () =>
  useQuery({
    queryFn: () => api<Other[]>('/api/ateliers'),
    queryKey: ['ateliers'],
    refetchInterval: 10_000,
  }).data ?? [];
