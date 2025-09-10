import { type TypePolicies, makeVar } from '@apollo/client';

import type * as gql from '@/graphql';

export const typePolicies: TypePolicies = {
  Query: {
    fields: {
      cartItems: { read: () => cartItemsVar() },
      isLoggedIn: { read: () => isLoggedInVar() },
      launches: {
        keyArgs: false,
        merge(existing, incoming) {
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

export const isLoggedInVar = makeVar<boolean>(
  Boolean(localStorage.getItem('token')),
);
export const cartItemsVar = makeVar<string[]>([]);
