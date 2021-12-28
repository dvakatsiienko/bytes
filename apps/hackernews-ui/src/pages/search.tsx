/* Core */
import { NextPage } from 'next';
import { useState, useEffect } from 'react';

/* Components */
import { SearchPostForm, PostList } from '@/components';

/* Instruments */
import * as gql from '@/graphql';

const SearchPage: NextPage = () => {
    const [ isRefetching, setIsRefetching ] = useState(false);
    const feedLazyQuery = gql.useFeedLazyQuery({
        fetchPolicy:                 'cache-and-network',
        notifyOnNetworkStatusChange: true,
        variables:                   { take: 6 },
    });
    const [ lazySearch, feedQuery ] = feedLazyQuery;
    const isDisabled = feedQuery.loading || isRefetching;

    useEffect(() => {
        lazySearch();
    }, []);

    return (
        <>
            <SearchPostForm
                feedLazyQuery = { feedLazyQuery }
                isDisabled = { isDisabled }
                isRefetching = { isRefetching }
                setIsRefetching = { setIsRefetching }
            />

            <PostList postList = { feedQuery.data?.feed.posts ?? [] } />
        </>
    );
};

export default SearchPage;
