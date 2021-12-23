/* Core */
import { NextPage, GetServerSideProps } from 'next';

/* Components */
import { Layout, Nav }              from '@/components';
import { P, Link }                  from '@/components/styled';
import { PostList, CreatePostForm } from '@/features/apollo';

/* Instruments */
import * as gql              from '@/graphql';
import { initApollo }        from '@/lib/apollo';
import { allPostsQueryVars } from '@/features/apollo/helpers';

const ApolloSSRPage: NextPage = () => {
    return (
        <Layout>
            <Nav title = 'Apollo SSR' />

            <P>
                This example shows how to fetch all initial apollo queries on
                the server. If you <Link href = '/'>reload</Link> this page you
                won&apos;t see a loader since Apollo fetched all needed data on
                the server. This prevents{' '}
                <Link
                    href = 'https://nextjs.org/blog/next-9#automatic-static-optimization'
                    rel = 'noopener noreferrer'
                    target = '_blank'
                >
                    automatic static optimization
                </Link>{' '}
                in favour of full Server-Side-Rendering.
            </P>

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

export default ApolloSSRPage;
