import type * as gql from '../graphql';
import type { Resolver } from '../types';
import { paginate, sessionGone } from '../utils';

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
    // A stale token reaches here with no email, and findOrCreate would answer
    // "a valid email is required" — an input error for a session problem, which
    // the client cannot tell apart from a genuinely bad login.
    if (!ctx.userEmail) throw sessionGone('Not authenticated.');

    return ctx.dataSources.userAPI.findOrCreate(ctx.userEmail);
  },
};

/* Types */
interface QueryResolvers {
  launch: Resolver<gql.QueryLaunchArgs>;
  launches: Resolver<gql.QueryLaunchesArgs>;
  userProfile: Resolver;
}
