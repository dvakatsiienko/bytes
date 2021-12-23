/* Core */
import { NextPage, GetServerSideProps } from 'next';
import { useDispatch }                  from 'react-redux';

/* Components */
import { Layout, Nav }              from '@/components';
import { PostList, CreatePostForm } from '@/features/apollo';
import { Clock, Counter }           from '@/features/redux';

/* Instruments */
import * as gql              from '@/graphql';
import { useInterval }       from '@/hooks';
import { initApollo }        from '@/lib/apollo';
import { timerSlice }        from '@/lib/redux/slices';
import { allPostsQueryVars } from '@/features/apollo/helpers';

const ApolloReduxSSRPage: NextPage = () => {
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
            <Nav title = 'Apollo Redux SSR' />

            <Clock />
            <Counter />

            <CreatePostForm />
            <PostList />
        </Layout>
    );
};

export const getServerSideProps: GetServerSideProps = async () => {
    const client = initApollo();

    await client.query({
        query:     gql.AllPostsDocument,
        variables: allPostsQueryVars,
    });

    return {
        props: {
            initialApolloState: client.cache.extract(),
        },
    };
};

export default ApolloReduxSSRPage;
