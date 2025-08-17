import { ApolloClient, InMemoryCache, from } from '@apollo/client';
import loggerLink from 'apollo-link-logger';

import { authLink, errorLink, httpLink } from './links';
import { typeDefs } from './typeDefs';
import { typePolicies } from './typePolicies';

const cache = new InMemoryCache({ typePolicies });
const link = from([loggerLink, errorLink, authLink, httpLink]);

export const client = new ApolloClient({
  cache,
  link,
  typeDefs,
});
