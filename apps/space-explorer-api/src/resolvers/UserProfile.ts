import type { Resolver } from '@/types';
import { injectLaunchesIntoTrips } from '@/utils';

export const UserProfile: UserProfileResolvers = {
  trips: async (_, __, { dataSources }) => {
    const userTrips = await dataSources.userAPI.getTrips();

    const launchIds = userTrips.map((trip) => trip.launchId);
    const launches = await dataSources.spaceXAPI.getLaunchesByIds(launchIds);

    const finalTrips = injectLaunchesIntoTrips(userTrips, launches);

    return finalTrips;
  },
};

/* Types */
interface UserProfileResolvers {
  trips: Resolver;
}
