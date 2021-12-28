/* Instruments */
import { createStore } from './createStore';

/**
 * Server: always null.
 * Client: null at first call, object on subsequent calls.
 */
export let store = null; // eslint-disable-line

export const initStore = (preloadedState) => {
    let nextStore = store ?? createStore(preloadedState);

    /**
     * After navigating to a page with an initial Redux state, merge that state
     * with the current state in the store, and create a new store.
     */
    if (preloadedState && store) {
        nextStore = createStore({
            ...store.getState(),
            ...preloadedState,
        });

        /**
         * Reset the current store.
         */
        store = null;
    }

    /**
     * For SSG and SSR always create a new store.
     */
    if (typeof window === 'undefined') return nextStore;

    /**
     * Create the store once in the client.
     */
    if (!store) {
        store = nextStore;
    }

    return nextStore;
};
