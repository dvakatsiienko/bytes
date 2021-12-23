/* Core */
import { TypePolicy, FieldPolicy, FieldReadFunction } from '@apollo/client';

/* Instruments */
import * as gql from '@/graphql';

export const typePolicies: TTypePolicies = {
    Post: {
        fields: {
            votes: {
                merge(_, incoming) {
                    return incoming;
                },
            },
        },
    },
};

/* Types */
type TQueryFieldPolicy = Omit<gql.QueryFieldPolicy, 'votes'> & {
    votes: FieldPolicy<gql.Vote[]> | FieldReadFunction<gql.Vote[]>;
};
type TTypePolicy = Omit<TypePolicy, 'fields'> & {
    fields: TQueryFieldPolicy;
};
type TTypePolicies = Omit<gql.TypedTypePolicies, 'Post'> & {
    Post: TTypePolicy;
};
