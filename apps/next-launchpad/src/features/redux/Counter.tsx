/* Core */
import styled from 'styled-components';

/* Components */
import { H6, Button } from '@/components/styled';

/* Instruments */
import { timerSlice }               from '@/lib/redux/slices';
import { useSelector, useDispatch } from '@/lib/redux';

export const Counter = () => {
    const dispatch = useDispatch();
    const { count } = useSelector(state => state.timer);

    const increment = () => dispatch(timerSlice.actions.increment());
    const decrement = () => dispatch(timerSlice.actions.decrement());
    const reset = () => dispatch(timerSlice.actions.reset());

    return (
        <div>
            <H6>Count: {count}</H6>

            <ControlsContainer>
                <Button onClick = { increment }>+1</Button>
                <Button onClick = { decrement }>-1</Button>
                <Button onClick = { reset }>Reset</Button>
            </ControlsContainer>
        </div>
    );
};

/* Styles */
const ControlsContainer = styled.div`
    button:not(:last-child) {
        margin-right: 10px;
    }
`;
