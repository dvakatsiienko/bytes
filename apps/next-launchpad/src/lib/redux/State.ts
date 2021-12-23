/* Core */
import {
    useDispatch as useUntypedDispatch,
    useSelector as useUntypedSelector,
    TypedUseSelectorHook
} from 'react-redux';

/* Instruments */
import { rootReducer } from './rootReducer';
import { createStore } from './createStore';

const store = createStore();

type Dispatch = typeof store.dispatch;
export type State = ReturnType<typeof rootReducer>;

export const useDispatch = () => useUntypedDispatch<Dispatch>(); // Export a hook that can be reused to resolve types
export const useSelector: TypedUseSelectorHook<State> = useUntypedSelector;
