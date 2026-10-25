import { useQuery } from '@tanstack/react-query';
import type { Build } from '@ui/kit/lib/build';

import { api } from './takes.ts';

/** this studio's checkout; asked again when the tab comes back, so a pull shows without a reload */
export const useBuild = () =>
  useQuery({
    queryFn: () => api<Build>('/api/build'),
    queryKey: ['build'],
  }).data;
