/* Core */
import { createSlice } from '@reduxjs/toolkit';

const initialState: BrowserSliceState = { isClosed: false, isMinimized: false };

export const browserSlice = createSlice({
    name:     'browser',
    initialState,
    reducers: {
        close: (state) => {
            state.isClosed = true;
        },

        minimize: (state) => {
            state.isMinimized = true;
        },
        maximize: (state) => {
            state.isMinimized = false;
        },
    },
});

/* Types */
interface BrowserSliceState {
    isClosed:    boolean,
    isMinimized: boolean,
}
