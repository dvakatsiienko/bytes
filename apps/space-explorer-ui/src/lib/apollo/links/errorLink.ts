/* Core */
import { onError } from '@apollo/client/link/error';
import debug from 'debug';

const logGql = debug('[GraphQL error]');

export const errorLink = onError(net => {
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
});
