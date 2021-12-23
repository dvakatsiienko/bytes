/* Core */
import { ApolloLink } from '@apollo/client';

/* Instruments */
import formatMessage from './formatMessage';
import logging       from './logging';

export const loggerLink = new ApolloLink((operation, forward) => {
    const startTime = new Date().getTime();

    return forward(operation).map(result => {
        // @ts-expect-error: Broken typescript support as for 16.06.2020.
        const operationType = operation.query.definitions[ 0 ].operation;
        const elapsed = new Date().getTime() - startTime;

        const group = formatMessage(operationType, operation, elapsed);

        if (process.browser) {
            logging.groupCollapsed(...group);

            logging.log('INIT', operation);
            logging.log('RESULT', result);

            logging.groupEnd(...group);
        }

        return result;
    });
});
