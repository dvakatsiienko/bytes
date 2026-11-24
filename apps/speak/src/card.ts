import type { Status } from '@/api.ts';

// a card plays exactly while the daemon names its read
export const cardOf = <T extends { read: number }>(
  started: T | undefined,
  status: Pick<Status, 'read'> | undefined,
) =>
  started?.read !== undefined && status?.read === started.read
    ? started
    : undefined;
