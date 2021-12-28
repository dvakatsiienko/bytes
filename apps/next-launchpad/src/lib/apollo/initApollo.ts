/* Core */
import merge from 'deepmerge';
import { isEqual } from 'lodash';

/* Instruments */
import { createApolloClient } from './createApolloClient';

let apolloClient = null;

export const initApollo = (initialState = null) => {
    const nextApolloClient = apolloClient ?? createApolloClient();

    /**
     * If your page has Next.js data fetching methods that use Apollo Client, the initial state
     * gets hydrated here.
     */
    if (initialState) {
        /**
         * Get existing cache, loaded during client side data fetching.
         */
        const existingCache = nextApolloClient.extract();

        /**
         * Merge the existing cache into data passed from getStaticProps/getServerSideProps
         */
        const data = merge(initialState, existingCache, {
            /**
             * combine arrays using object equality (like in sets)
             */
            arrayMerge: (destinationArray, sourceArray) => [
                ...sourceArray,
                ...destinationArray.filter((d) => sourceArray.every((s) => !isEqual(d, s))),
            ],
        });

        /**
         * Restore the cache with the merged data
         */
        nextApolloClient.cache.restore(data);
    }

    /**
     * For SSG and SSR always create a new Apollo Client
     */
    if (typeof window === 'undefined') {
        return nextApolloClient;
    }

    /**
     * Create the Apollo Client once in the client
     */
    if (!apolloClient) {
        apolloClient = nextApolloClient;
    }

    return nextApolloClient;
};
