import type { LaunchModel } from '../datasources';
import type { Trip } from '~/prisma/client';

export const injectLaunchesIntoTrips = (
  trips: Trip[],
  launches: LaunchModel[],
) => {
  // drop trips whose launch could not be resolved rather than throwing — a single
  // dead launch must not null a whole trip list. bookTrips validates ids up front,
  // so its trips are always kept; only stale history trips are skipped.
  return trips.flatMap((trip) => {
    const launch = launches.find((_launch) => _launch.id === trip.launchId);

    return launch ? [{ ...trip, launch }] : [];
  });
};
