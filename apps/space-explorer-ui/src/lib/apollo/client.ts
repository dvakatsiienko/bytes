import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';

import { authLink, errorLink, httpLink, loggerLink } from './links';
import { cartItemsVar, isLoggedInVar, typePolicies } from './typePolicies';

const cache = new InMemoryCache({ typePolicies });
const link = ApolloLink.from([loggerLink, errorLink, authLink, httpLink]);

export const client = new ApolloClient({
  cache,
  link,
});

export function evictPerUserFields() {
  cache.evict({ fieldName: 'userProfile' });
  cache.evict({ fieldName: 'launches' });
  cache.evict({ fieldName: 'launch' });
  cache.gc();
}

// re-sync auth state and drop the previous user's cached data when another tab logs in/out
window.addEventListener('storage', (event) => {
  if (!(event.key === 'token' || event.key === null)) return;

  isLoggedInVar(Boolean(localStorage.getItem('token')));
  cartItemsVar([]);
  evictPerUserFields();
});
