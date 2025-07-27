
import { setContext } from '@apollo/client/link/context';

export const authLink = setContext((_, prevCtx) => {
    const token = localStorage.getItem('token') || '';

    const ctx = {
        headers: {
            ...prevCtx.headers,
            Authorization: token,
        },
    };

    return ctx;
});
