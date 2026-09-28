import type { GraphQLFieldResolver } from 'graphql';

import type { SpaceXAPI, UserAPI } from '../datasources';

export type Resolver<
  TArgs = Record<string, unknown>,
  TSource = undefined,
> = GraphQLFieldResolver<TSource, ResolverCtx, TArgs>;

interface ApolloCtx {
  userEmail: string | null;
}

interface ResolverCtx extends ApolloCtx {
  dataSources: {
    spaceXAPI: SpaceXAPI;
    userAPI: UserAPI;
  };
  userEmail: string | null;
}
