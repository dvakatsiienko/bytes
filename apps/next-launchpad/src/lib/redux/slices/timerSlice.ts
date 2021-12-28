/* Core */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    lastUpdate: 0,
    light:      false,
    count:      0,
};

export const timerSlice = createSlice({
    name:     'TIMER',
    initialState,
    reducers: {
        tick(state, action: TickAction) {
            state.lastUpdate = action.payload.lastUpdate;
            state.light = action.payload.light;
        },
        increment(state) {
            state.count += 1;
        },
        decrement(state) {
            state.count -= 1;
        },
        reset(state) {
            state.count = initialState.count;
        },
    },
});

/* Types */
type TickAction = {
    type: string;
    payload: {
        lastUpdate: number;
        light: boolean;
    };
};
