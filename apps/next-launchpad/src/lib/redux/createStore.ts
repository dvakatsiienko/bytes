/* Core */
import { configureStore } from '@reduxjs/toolkit';

/* Instruments */
import { rootReducer } from './rootReducer';
import { middleware }  from './middleware';

export const createStore = (preloadedState = {}) => {
    return configureStore({
        reducer: rootReducer,
        preloadedState,
        middleware: getDefaultMiddleware =>
            getDefaultMiddleware({
                immutableCheck: false,
                serializableCheck: false,
            }).prepend(middleware),
    });
};
