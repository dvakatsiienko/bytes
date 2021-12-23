/* Core */
import { HttpLink } from '@apollo/client';

const GQL_HTTP_URL = process.env.NEXT_PUBLIC_GQL_HTTP_URL;

export const httpLink = new HttpLink({
    uri:         GQL_HTTP_URL,
    // credentials: 'include',
    credentials: 'same-origin',
});
