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

    return {
      cursor: list.length ? list[list.length - 1].flightNumber : null,
      hasMore: list.length
        ? list[list.length - 1].flightNumber !==
          launches[launches.length - 1].flightNumber
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
  launches: Resolver<gql.QueryLaunchesArgs>;
  launch: Resolver<gql.QueryLaunchArgs>;
  userProfile: Resolver;
}
