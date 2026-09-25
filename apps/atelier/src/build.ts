import { useQuery } from '@tanstack/react-query';

import type { Build, Other } from '../server/build.ts';
import { api } from './takes.ts';

/** this studio's checkout; asked again when the tab comes back, so a pull shows without a reload */
export const useBuild = () =>
  useQuery({
    queryFn: () => api<Build>('/api/build'),
    queryKey: ['build'],
  }).data;

/** the other ateliers that answer right now; a server that stops drops out on the next ask */
export const useOthers = () =>
  useQuery({
    queryFn: () => api<Other[]>('/api/ateliers'),
    queryKey: ['ateliers'],
    refetchInterval: 15_000,
  }).data ?? [];
