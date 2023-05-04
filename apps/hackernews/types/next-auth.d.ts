/* Core */
import type { DefaultSession, DefaultUser } from 'next-auth';

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
    interface Session extends DefaultSession {
        sessionToken: string,
        user: DefaultSession['user'] & {
            id:       string,
            bio:      string | null,
            location: string | null,
        },
    }

    interface User extends DefaultUser {
        bio:      string | null,
        location: string | null,
    }
}
