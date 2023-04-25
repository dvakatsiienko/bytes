/* Instruments */
import { injectLaunchesIntoTrips } from '../utils';
import type * as gql from '../graphql';
import type { Resolver } from '../types';

export const Mutation: MutationResolvers = {
    login: async (_, args, { dataSources }) => {
        const userProfile = await dataSources.userAPI.findOrCreate(args.email);

        return userProfile;
    },
    bookTrips: async (_, args, { dataSources }) => {
        const { launchIds } = args;

        const bookedTrips = await dataSources.userAPI.bookTrips(launchIds);
        const launches = await dataSources.spaceXAPI.getLaunchesByIds(launchIds);

        const finalTrips = injectLaunchesIntoTrips(bookedTrips, launches);

        return finalTrips;
    },
    cancelTrip: async (_, args, { dataSources }) => {
        const { tripId } = args;

        await dataSources.userAPI.cancelTrip(tripId);

        return true;
    },
};

/* Types */
interface MutationResolvers {
    login: Resolver<gql.MutationLoginArgs>;
    bookTrips: Resolver<gql.MutationBookTripsArgs>;
    cancelTrip: Resolver<gql.MutationCancelTripArgs>;
}
