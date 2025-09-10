import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';

import { authLink, errorLink, httpLink, loggerLink } from './links';
import { typePolicies } from './typePolicies';

const cache = new InMemoryCache({ typePolicies });
const link = ApolloLink.from([loggerLink, errorLink, authLink, httpLink]);

export const client = new ApolloClient({
  cache,
  link,
});
