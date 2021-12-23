/* Core */
import { ApolloClient, InMemoryCache, from } from '@apollo/client';
import { concatPagination } from '@apollo/client/utilities';
import loggerLink from 'apollo-link-logger';

/* Instruments */
import { errorLink, httpLink } from './links';

export const createApolloClient = () => {
    const ssrMode = typeof window === 'undefined';
    const cache = new InMemoryCache({
        typePolicies: {
            Query: {
                fields: { allPosts: concatPagination() },
            },
        },
    });
    const link = from([ loggerLink, errorLink, httpLink ]);

    return new ApolloClient({ ssrMode, link, cache });
};
