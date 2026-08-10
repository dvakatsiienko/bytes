import type { LaunchModel } from '../datasources';

export const paginate = ({ after: cursor, pageSize, results }: Options) => {
  if (pageSize < 1) return [];

  if (!cursor) return results.slice(0, pageSize);

  // value-based cursor: the first launch *after* the cursor's flightNumber.
  // Robust to a cursor launch having been dropped from the list (getLaunches
  // skips launches whose rocket/launchpad can't be resolved); relies on the
  // ascending order guaranteed by getLaunches.
  const startIndex = results.findIndex((item) => item.flightNumber > cursor);

  if (startIndex < 0) return [];

  return results.slice(startIndex, startIndex + pageSize);
};

/* Types */
interface Options {
  after: number;
  pageSize: number;
  results: LaunchModel[];
}
