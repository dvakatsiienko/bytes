/* Core */
import { split, from } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import loggerLink from 'apollo-link-logger';

/* Instruments */
import { errorLink } from './errorLink';
import { authLink } from './authLink';
import { httpLink } from './httpLink';
import { wsLink } from './wsLink';

export const createIsomorphicLink = () => {
    const baseLinks = [ errorLink ];
    const httpLinks = [ ...baseLinks, authLink, httpLink ];

    if (process.browser && __DEV__) {
        baseLinks.unshift(loggerLink);
        httpLinks.unshift(loggerLink);
    }

    const link = split(
        (operation) => {
            const mainDefinition = getMainDefinition(operation.query);

            return (
                process.browser
                && mainDefinition.kind === 'OperationDefinition'
                && mainDefinition.operation === 'subscription'
            );
        },
        from([ ...baseLinks, wsLink ]),
        from(httpLinks),
    );

    return link;
};
