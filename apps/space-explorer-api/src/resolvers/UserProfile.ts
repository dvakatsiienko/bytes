import type { Resolver } from '@/types';
import { injectLaunchesIntoTrips } from '@/utils';
import type { Trip } from '~/prisma/client';

export const UserProfile: UserProfileResolvers = {
  // use the trips already loaded on the parent profile rather than re-querying
  // the auth context — the latter breaks first-login (no auth header yet) and
  // attaches the caller's trips to whatever profile login returned
  trips: async (profile, __, { dataSources }) => {
    const userTrips = profile.trips;

    const launchIds = userTrips.map((trip) => trip.launchId);
    // allowMissing: one dead launch drops just that trip, not the whole profile
    const launches = await dataSources.spaceXAPI.getLaunchesByIds(
      launchIds,
      true,
    );

    return injectLaunchesIntoTrips(userTrips, launches);
  },
};

/* Types */
interface UserProfileSource {
  trips: Trip[];
}

interface UserProfileResolvers {
  trips: Resolver<Record<string, unknown>, UserProfileSource>;
}
