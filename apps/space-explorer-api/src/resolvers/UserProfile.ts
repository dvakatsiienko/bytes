/* Instruments */
import { injectLaunchesIntoTrips } from '@/utils';
import type { Resolver } from '@/types';

export const UserProfile: UserProfileResolvers = {
    trips: async (_, __, { dataSources }) => {
        const userTrips = await dataSources.userAPI.getTrips();

        const launchIds = userTrips.map(trip => trip.launchId);
        const launches = await dataSources.spaceXAPI.getLaunchesByIds(launchIds);

        const finalTrips = injectLaunchesIntoTrips(userTrips, launches);

        return finalTrips;
    },
};

/* Types */
interface UserProfileResolvers {
    trips: Resolver;
}
