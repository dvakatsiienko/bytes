/* Core */
import { NextPage } from 'next';

/* Components */
import { Layout, Nav } from '@/components';
import { Clock, Counter } from '@/features/redux';

/* Instruments */
import { useInterval } from '@/hooks';
import { useDispatch } from '@/lib/redux';
import { timerSlice } from '@/lib/redux/slices';

const ReduxPage: NextPage = () => {
    const dispatch = useDispatch();

    useInterval(() => {
        dispatch(
            timerSlice.actions.tick({
                light:      true,
                lastUpdate: Date.now(),
            }),
        );
    }, 1000);

    return (
        <Layout>
            <Nav title = 'Redux' />
            <Clock />
            <Counter />
        </Layout>
    );
};

export default ReduxPage;
