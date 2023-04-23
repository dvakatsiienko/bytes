/* Instruments */
import type { Resolver } from '../types';
import type * as gql from '../graphql';

export const Launch: LaunchResolvers = {
    isBooked: async (launch, _, { dataSources }) => {
        return dataSources.userAPI.isBookedOnLaunch(launch.id);
    },
};

/* Types */
interface LaunchResolvers {
    isBooked: Resolver<unknown, gql.Launch>;
}
