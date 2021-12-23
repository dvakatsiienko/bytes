/* Core */
import { makeVar, useReactiveVar } from '@apollo/client';

export const vars = {
    isAuthenticated:    makeVar<boolean>(false),
    useIsAuthenticated: () => useReactiveVar(vars.isAuthenticated),
};
