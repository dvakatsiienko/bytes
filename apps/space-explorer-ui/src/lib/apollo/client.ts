import { ApolloClient, ApolloLink } from '@apollo/client';

import { cache, evictPerUserFields } from './cache';
import { authLink, errorLink, httpLink, loggerLink } from './links';
import { cartItemsVar, cartRead, isLoggedInVar } from './typePolicies';

const link = ApolloLink.from([loggerLink, errorLink, authLink, httpLink]);

export const client = new ApolloClient({
  cache,
  link,
});

// re-sync auth state and drop the previous user's cached data when another tab logs in/out
window.addEventListener('storage', (event) => {
  // `cart` is mirrored to storage on every change, so a tab that ignored it
  // would keep a stale cart and overwrite the other tab's on its next write.
  if (event.key === 'cart') {
    cartItemsVar(cartRead());
    return;
  }

  if (!(event.key === 'token' || event.key === null)) return;

  isLoggedInVar(Boolean(localStorage.getItem('token')));
  cartItemsVar([]);
  evictPerUserFields();
});
