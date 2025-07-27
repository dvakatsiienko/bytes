import type * as gql from '../graphql';
import type { Resolver } from '../types';

export const Launch: LaunchResolvers = {
  isBooked: (launch, _, { dataSources }) => {
    return dataSources.userAPI.isBookedOnLaunch(launch.id);
  },
};

/* Types */
interface LaunchResolvers {
  isBooked: Resolver<unknown, gql.Launch>;
}
