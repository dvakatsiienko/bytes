/* Core */
import { useMemo } from 'react';

/* Instruments */
import { initApollo } from './initApollo';

export const useApollo = initialState => {
    const client = useMemo(() => initApollo(initialState), [ initialState ]);

    return client;
};
