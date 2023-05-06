/* Core */
import type { GraphQLFieldResolver } from 'graphql';

/* Instruments */
import { SpaceXAPI, UserAPI } from '../datasources';

export type Resolver<
    TArgs = Record<string, unknown>,
    TSource = undefined,
> = GraphQLFieldResolver<TSource, ResolverCtx, TArgs>;

export interface ApolloCtx {
    userEmail: string | null,
}

export interface ResolverCtx extends ApolloCtx {
    userEmail:   string | null,
    dataSources: {
        spaceXAPI: SpaceXAPI,
        userAPI:   UserAPI,
    },
}
