/* Core */
import { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import waait from 'waait';

/* Components */
import { PostList } from '@/components';

/* Instruments */
import * as gql from '@/graphql';
import { useFeedVariables } from '@/hooks';

const NewPostsPaginatedPage: NextPage = () => {
    const [ isFetchingMore, setIsFetchingMore ] = useState(false);

    const router = useRouter();
    const { page, variables: feedVariables, POSTS_PER_PAGE } = useFeedVariables();

    const feedQuery = gql.useFeedQuery({
        variables:                   feedVariables,
        fetchPolicy:                 'cache-and-network',
        notifyOnNetworkStatusChange: true,
    });

    if (process.browser) {
        feedQuery.subscribeToMore<gql.PostCreatedSubscription>({
            document:    gql.PostCreatedDocument,
            updateQuery: (prev, opts) => {
                const { subscriptionData } = opts;

                if (!subscriptionData.data) return prev;

                const newPost = subscriptionData.data.postCreated;

                const isExists = prev.feed.posts.find((post) => post.id === newPost.id);

                if (isExists) return prev;

                const result = {
                    ...prev,
                    feed: {
                        __typename: prev.feed.__typename,
                        posts:      [ newPost, ...prev.feed.posts ],
                        count:      prev.feed.posts.length + 1,
                    },
                };

                return result;
            },
        });
    }

    const setPage = async (nextPage: number) => {
        setIsFetchingMore(true);

        const skip = nextPage - 1;
        const take = POSTS_PER_PAGE;

        await feedQuery.fetchMore({ variables: { skip, take } });
        await waait(100);

        router.push(`/new/${nextPage}`);
        setIsFetchingMore(false);
    };

    const feed = feedQuery.data?.feed;
    const totalPages = Math.ceil(feed?.count ?? POSTS_PER_PAGE / POSTS_PER_PAGE);
    const postList = feed?.posts ?? [];

    return (
        <PostList
            pagination = {{
                isFetchingMore,
                page,
                totalPages,
                setPage,
                skip: feedVariables.skip,
            }}
            postList = { postList }
        />
    );
};

export default NewPostsPaginatedPage;
