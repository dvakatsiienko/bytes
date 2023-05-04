/* Core */
import { createSlice } from '@reduxjs/toolkit';

const initialState: ConterSliceState = { count: 0 };

export const counterSlice = createSlice({
    name:     'counterSlice',
    initialState,
    reducers: {
        increment: (state) => {
            state.count += 1;
        },
        decrement: (state) => {
            state.count -= 1;
        },
        changeByAmount: (state, action: ChangeByAction) => {
            if (action.payload.type === 'increment') {
                state.count += action.payload.value;
            } else if (action.payload.type === 'decrement') {
                state.count -= action.payload.value;
            }
        },
    },
});

/* Types */
interface ConterSliceState {
    count: number,
}

interface ChangeByAction {
    payload: {
        value: number,
        type:  'decrement' | 'increment',
    },
}
