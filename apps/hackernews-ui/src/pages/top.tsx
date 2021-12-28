/* Core */
import { NextPage, GetStaticProps } from 'next';

/* Components */
import { PostList } from '@/components';

/* Instruments */
import * as gql from '@/graphql';
import { getStaticAC } from '@/lib/apollo';

const TopPostsPage: TopPostsPageProps = (props) => {
    // const feedQuery = gql.useFeedQuery({
    //     variables:   { take: 25, orderBy },
    //     fetchPolicy: 'cache-and-network',
    // });

    // const postList = feedQuery.data?.feed.posts ?? props.feed.posts ?? [];

    return <PostList orderBy = { orderBy } postList = { props.feed.posts } />;
};

const orderBy = { voteCount: gql.Order_By_Enum.Desc };

export const getStaticProps: GetStaticProps = async () => {
    const apolloClient = getStaticAC();

    const feedQuery = await apolloClient.query<gql.FeedQuery>({
        variables: { take: 25, orderBy },
        query:     gql.FeedDocument,
    });

    return { props: feedQuery.data, revalidate: 5 };
};

/* Types */
export type TopPostsPageProps = NextPage<{ feed: gql.Feed }>;

export default TopPostsPage;
