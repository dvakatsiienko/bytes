/* Core */
import { combineReducers } from '@reduxjs/toolkit';

/* Reducers */
import { timerSlice } from './slices';

export const rootReducer = combineReducers({
    timer: timerSlice.reducer,
});
