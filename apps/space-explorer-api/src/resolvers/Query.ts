import type * as gql from '../graphql';
import type { Resolver } from '../types';
import { paginate } from '../utils';

export const Query: QueryResolvers = {
  launch: (_, args, { dataSources }) => {
    const { id } = args;

    return dataSources.spaceXAPI.getLaunch(id);
  },
  launches: async (_, args, { dataSources }) => {
    const launches = await dataSources.spaceXAPI.getLaunches();

    const list = paginate({
      after: args.after ?? 0,
      pageSize: args.pageSize ?? 10,
      results: launches,
    });

    const last = list.at(-1);

    return {
      // cursor is Int! — fall back to 0 for an empty page rather than null
      cursor: last?.flightNumber ?? 0,
      hasMore: last
        ? last.flightNumber !== launches.at(-1)?.flightNumber
        : false,
      list,
    };
  },
  userProfile: (_, __, ctx) => {
    return ctx.dataSources.userAPI.findOrCreate(ctx.userEmail);
  },
};

/* Types */
interface QueryResolvers {
  launch: Resolver<gql.QueryLaunchArgs>;
  launches: Resolver<gql.QueryLaunchesArgs>;
  userProfile: Resolver;
}
