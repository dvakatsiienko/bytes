/* Core */
import { HttpLink } from '@apollo/client';

export const httpLink = new HttpLink({
    uri:         process.env.NEXT_PUBLIC_GQL_URL,
    credentials: 'same-origin',
});
