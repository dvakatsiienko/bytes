/* Core */
import { useState } from 'react';

/* Components */
import { Header, LaunchTile, Loading, Button } from '@/components';

/* Instruments */
import * as gql from '@/graphql';

export const Launches = () => {
    const { data, loading, fetchMore } = gql.useLaunchesQuery({ fetchPolicy: 'cache-and-network' });
    const [ isLoadingMore, setIsLoadingMore ] = useState(false);

    const launchesListJSX = data?.launches.list.map((launch) => {
        return <LaunchTile key = { launch.id } launch = { launch } />;
    });

    const fetchMoreLaunches = async () => {
        setIsLoadingMore(true);

        await fetchMore({ variables: { after: data?.launches.cursor }});

        setIsLoadingMore(false);
    };

    return (
        <>
            <Header title = 'Space Explorer' />

            {loading && !data ? <Loading /> : null}

            {launchesListJSX}

            {data?.launches.hasMore && isLoadingMore ? <Loading /> : null}
            {data?.launches.hasMore && !isLoadingMore
                ?         <Button onClick = { fetchMoreLaunches }>Load More</Button>
                : null}
        </>
    );
};
