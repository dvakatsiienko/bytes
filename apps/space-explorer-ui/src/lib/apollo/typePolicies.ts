/* Core */
import { makeVar, TypePolicy, FieldPolicy, FieldReadFunction } from '@apollo/client';

/* Instruments */
import * as gql from '@/graphql';

export const typePolicies: TTypePolicies = {
    Query: {
        fields: {
            isLoggedIn: { read: () => isLoggedInVar() },
            cartItems:  { read: () => cartItemsVar() },
            launches:   {
                keyArgs: false,
                merge (existing, incoming) {
                    let list: gql.Launch[] = [];

                    if (existing?.list) {
                        list = list.concat(existing.list);
                    }

                    if (incoming?.list) {
                        list = list.concat(incoming.list);
                    }

                    return {
                        ...incoming,
                        list,
                    };
                },
            },
        },
    },
};

export const isLoggedInVar = makeVar<boolean>(Boolean(localStorage.getItem('token')));
export const cartItemsVar = makeVar<string[]>([]);

/* Types */
type TQueryFieldPolicy = Omit<gql.QueryFieldPolicy, 'launches'> & {
    launches: FieldPolicy<gql.LaunchesPayload> | FieldReadFunction<gql.LaunchesPayload>,
};
type TTypePolicy = Omit<TypePolicy, 'fields'> & {
    fields: TQueryFieldPolicy,
};
type TTypePolicies = Omit<gql.TypedTypePolicies, 'Query'> & {
    Query: TTypePolicy,
};
