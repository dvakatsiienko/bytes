/* Core */
import {
    ApolloLink,
    Operation,
    FetchResult,
    Observable
} from '@apollo/client/core';
import { print, GraphQLError } from 'graphql';
import { createClient, ClientOptions, Client } from 'graphql-ws';
import IsomorphicWebSocket from 'isomorphic-ws';

const JWT_TOKEN_NAME = process.env.NEXT_PUBLIC_JWT_TOKEN_NAME;
const GQL_WS_URL = process.env.NEXT_PUBLIC_GQL_WS_URL;

class WebSocketLink extends ApolloLink {
    private client: Client;

    constructor(options: ClientOptions) {
        super();
        this.client = createClient(options);
    }

    public request(operation: Operation): Observable<FetchResult> {
        const obs = new Observable(sink => {
            return this.client.subscribe<FetchResult>(
                { ...operation, query: print(operation.query) },
                {
                    next:     sink.next.bind(sink),
                    complete: sink.complete.bind(sink),
                    error:    err => {
                        if (err instanceof Error) {
                            return sink.error(err);
                        }

                        if (err instanceof CloseEvent) {
                            return sink.error(
                                // reason will be available on clean closes
                                new Error(
                                    `Socket closed with event ${err.code} ${
                                        err.reason || ''
                                    }`,
                                ),
                            );
                        }

                        return sink.error(
                            new Error(
                                (err as GraphQLError[])
                                    .map(({ message }) => message)
                                    .join(', '),
                            ),
                        );
                    },
                },
            );
        });

        return obs;
    }
}

export const wsLink = new WebSocketLink({
    url:              GQL_WS_URL,
    webSocketImpl:    IsomorphicWebSocket,
    connectionParams: () => {
        const token = process.browser
            ? localStorage.getItem(JWT_TOKEN_NAME)
            : '';

        return { Authorization: `Bearer ${token}` };
    },
});
