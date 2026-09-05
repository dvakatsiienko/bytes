import { GraphQLError } from 'graphql';

/**
 * The caller's token no longer names a user this server knows.
 *
 * 📌 It carries `UNAUTHENTICATED` so the client can act on a code rather than
 * match an error string. The ui reads that as "your session is over", drops the
 * token and returns to the login screen.
 *
 * ⚠️ This is not a rare edge, it is the normal consequence of a deploy. The
 * client calls itself logged in whenever a token sits in localStorage, while
 * this server authenticates by looking the user up — and the sqlite file is
 * rebuilt from scratch on every deploy, so any browser that was logged in
 * beforehand is holding a token for a user that no longer exists. Without a
 * code to act on, the app looks logged in and refuses every write, with no way
 * out but clearing storage by hand.
 */
export const sessionGone = (message: string) =>
  new GraphQLError(message, { extensions: { code: 'UNAUTHENTICATED' } });
