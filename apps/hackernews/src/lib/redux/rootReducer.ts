/* Instruments */
import * as slices from './slices';

export const reducer = {
    counter: slices.counterSlice.reducer,
    browser: slices.browserSlice.reducer,
};
