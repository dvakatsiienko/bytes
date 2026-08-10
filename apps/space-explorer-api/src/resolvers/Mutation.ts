import type * as gql from '@/graphql';
import type { Resolver } from '@/types';
import { injectLaunchesIntoTrips } from '@/utils';

export const Mutation: MutationResolvers = {
  bookTrips: async (_, args, { dataSources }) => {
    const launchIds = [...new Set(args.launchIds)];

    // validate every launch exists before writing anything — a bogus id throws
    // here, so no trip row is ever created for a launch the SpaceX API rejects
    const launches = await dataSources.spaceXAPI.getLaunchesByIds(launchIds);
    const bookedTrips = await dataSources.userAPI.bookTrips(launchIds);

    return injectLaunchesIntoTrips(bookedTrips, launches);
  },
  cancelTrip: (_, args, { dataSources }) => {
    return dataSources.userAPI.cancelTrip(args.tripId);
  },
  login: (_, args, { dataSources }) => {
    return dataSources.userAPI.findOrCreate(args.email);
  },
  // auth is a stateless bearer token; logout is a client-side token discard
  logout: () => true,
};

/* Types */
interface MutationResolvers {
  bookTrips: Resolver<gql.MutationBookTripsArgs>;
  cancelTrip: Resolver<gql.MutationCancelTripArgs>;
  login: Resolver<gql.MutationLoginArgs>;
  logout: Resolver;
}
