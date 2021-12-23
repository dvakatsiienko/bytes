/* Core */
import { GetServerSidePropsContext } from 'next';
import {
    ApolloClient,
    InMemoryCache,
    NormalizedCacheObject,
    from
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { createUploadLink } from 'apollo-upload-client';
import debug                from 'debug';

/* Instruments */
import { allProductsPolicy } from './fieldPolicies';
import { loggerLink }        from './links';

const logGql = debug('[GraphQL error]');

const KEYSTONE_COOKIE_NAME = 'keystonejs-session';

export const createApolloClient = (
    ctx?: GetServerSidePropsContext,
    initialState?: NormalizedCacheObject,
) => {
    const headers: { cookie?: string } = {};

    if (ctx?.req.cookies) {
        const cookie = ctx.req.cookies[ KEYSTONE_COOKIE_NAME ];

        headers.cookie = `${KEYSTONE_COOKIE_NAME}=${cookie}`;
    }

    return new ApolloClient({
        ssrMode: typeof window === 'undefined',
        link:    from([
            loggerLink,
            onError(net => {
                logGql('Operation:', net.operation);
                logGql('Response:', net.response);
                logGql(`Errors quantity: ${net.graphQLErrors?.length}`);

                if (net.graphQLErrors) {
                    for (const error of net.graphQLErrors) {
                        logGql(
                            `Message: ${error.message}, Location: ${error.locations}, Path: ${error.path}`,
                        );
                    }
                }

                if (net.networkError) {
                    logGql(`Network error: ${net.networkError}`);
                }
            }),

            createUploadLink({
                uri: __DEV__
                    ? process.env.NEXT_PUBLIC_DEV_GQL_URL
                    : process.env.NEXT_PUBLIC_PROD_GQL_URL,
                credentials: 'include',
                headers,
                fetch,
            }),
        ]),
        cache: new InMemoryCache({
            typePolicies: {
                Query: {
                    fields: {
                        allProducts: allProductsPolicy,
                    },
                },
            },
        }).restore(initialState || {}),
    });
};
