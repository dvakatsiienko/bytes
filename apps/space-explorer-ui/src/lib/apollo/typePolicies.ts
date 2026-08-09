import { type Reference, type TypePolicies, makeVar } from '@apollo/client';

export const typePolicies: TypePolicies = {
  Query: {
    fields: {
      cartItems: { read: () => cartItemsVar() },
      isLoggedIn: { read: () => isLoggedInVar() },
      launches: {
        keyArgs: false,
        merge(existing, incoming, { args, readField }) {
          if (!(existing?.list && incoming?.list)) {
            return incoming;
          }

          if (args?.after) {
            // pagination: append only launches not already present
            const ids = new Set(
              existing.list.map((ref: Reference) => readField('id', ref)),
            );
            const fresh = incoming.list.filter(
              (ref: Reference) => !ids.has(readField('id', ref)),
            );

            return { ...incoming, list: [...existing.list, ...fresh] };
          }

          // page-1 refresh (falsy `after`) over an accumulated list:
          // refresh the head, keep the accumulated tail and its cursor
          const ids = new Set(
            incoming.list.map((ref: Reference) => readField('id', ref)),
          );
          const tail = existing.list.filter(
            (ref: Reference) => !ids.has(readField('id', ref)),
          );

          return { ...existing, list: [...incoming.list, ...tail] };
        },
      },
    },
  },
};

export const isLoggedInVar = makeVar<boolean>(
  Boolean(localStorage.getItem('token')),
);
export const cartItemsVar = makeVar<string[]>([]);
