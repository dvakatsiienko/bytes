import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { ErrorLink } from '@apollo/client/link/error';
import debug from 'debug';

import { cartItemsVar, isLoggedInVar } from '../typePolicies';

const logGql = debug('[GraphQL error]');

export const errorLink = new ErrorLink(({ error, operation }) => {
  logGql('Operation:', operation);

  if (CombinedGraphQLErrors.is(error)) {
    logGql(`GraphQL errors: ${error.errors.length}`);
    for (const gqlError of error.errors) {
      logGql(
        `Message: ${gqlError.message}, Location: ${gqlError.locations}, Path: ${gqlError.path}`,
      );
    }

    if (error.errors.some(isSessionGone)) sessionEnd();
  } else if (error) {
    logGql(`Network error: ${error}`);
  }
});

/* Helpers */
const isSessionGone = (error: { extensions?: Record<string, unknown> }) =>
  error.extensions?.code === 'UNAUTHENTICATED';

/**
 * Ends a session the server has already stopped honouring.
 *
 * 📌 Being logged in meant only "a token is in localStorage", while the server
 * decides by looking the user up — so the two can disagree, and they do every
 * time the api is deployed and rebuilds its sqlite file. The app then looked
 * signed in and answered "Not authenticated." to every write, with no way back
 * but clearing storage by hand.
 *
 * Flipping `isLoggedInVar` is all the redirect needs: `ProtectedRoute` reads it
 * and sends the page to /login on its own, so this stays out of the router.
 */
const sessionEnd = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  cartItemsVar([]);
  isLoggedInVar(false);
};
