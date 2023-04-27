/* Core */
import { configureStore } from '@reduxjs/toolkit';
import {
    useSelector as useReduxSelector,
    useDispatch as useReduxDispatch,
    type TypedUseSelectorHook
} from 'react-redux';

/* Instruments */
import { reducer } from './rootReducer';
import { middleware } from './middleware';

export const reduxStore = configureStore({ reducer, middleware });

/* Helpers */
export const useDispatch = () => useReduxDispatch<Dispatch>();
export const useSelector: TypedUseSelectorHook<ReduxState> = useReduxSelector;

/* Types */
export type Store = typeof reduxStore;
export type ReduxState = ReturnType<typeof reduxStore.getState>;
export type Dispatch = typeof reduxStore.dispatch;
