/* Core */
import { useMemo } from 'react';

/* Instruments */
import { initStore } from './initStore';

export const useStore = initialState => {
    const store = useMemo(() => initStore(initialState), [ initialState ]);

    return store;
};
