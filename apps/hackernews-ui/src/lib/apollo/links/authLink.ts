/* Core */
import { setContext } from '@apollo/client/link/context';

const JWT_TOKEN_NAME = process.env.NEXT_PUBLIC_JWT_TOKEN_NAME;

export const authLink = setContext((_, prevCtx) => {
    const token = process.browser
        ? localStorage.getItem(JWT_TOKEN_NAME)
        : null;

    const ctx = {
        headers: {
            ...prevCtx.headers,
            Authorization: token ? `Bearer ${token}` : '',
        },
    };

    return ctx;
});
