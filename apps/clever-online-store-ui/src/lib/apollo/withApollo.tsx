/* Core */
import { NextPage }       from 'next';
import { ApolloProvider } from '@apollo/client';

/* Instruments */
import { createApolloClient } from './createApolloClient';

export const withApollo = (Comp: NextPage) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const WithApollo = (props: any) => {
        return (
            <ApolloProvider
                client = { createApolloClient(null, props.apolloState) }
            >
                <Comp { ...props } />
            </ApolloProvider>
        );
    };

    return WithApollo;
};

/**
 * ? GraphQL-codegen requires a function called specifically «getApolloClient»,
 * ? so it is re-exported with corresponding name.
 */
export { createApolloClient as getApolloClient };
