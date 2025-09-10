import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { ErrorLink } from '@apollo/client/link/error';
import debug from 'debug';

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
  } else if (error) {
    logGql(`Network error: ${error}`);
  }
});
