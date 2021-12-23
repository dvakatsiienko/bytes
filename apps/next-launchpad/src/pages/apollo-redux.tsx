/* Core */
import { NextPage } from 'next';

/* Components */
import { Layout, Nav }              from '@/components';
import { PostList, CreatePostForm } from '@/features/apollo';
import { Clock, Counter }           from '@/features/redux';

/* Instruments */
import { useInterval } from '@/hooks';
import { useDispatch } from '@/lib/redux';
import { timerSlice }  from '@/lib/redux/slices';

const ApolloReduxPage: NextPage = () => {
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
            <Nav title = 'Apollo Redux' />

            <Clock />
            <Counter />

            <CreatePostForm />
            <PostList />
        </Layout>
    );
};

export default ApolloReduxPage;
