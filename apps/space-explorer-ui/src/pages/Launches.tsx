/* Core */
import { useState } from 'react';

/* Components */
import {
    Header, LaunchTile, Loading, Button
} from '@/components';

/* Instruments */
import * as gql from '@/graphql';

export const Launches: React.FC = () => {
    const { data, loading, fetchMore } = gql.useLaunchesQuery();
    const [ isLoadingMore, setIsLoadingMore ] = useState(false);

    const launchesListJSX = data?.launches.list.map((launch) => {
        return <LaunchTile key = { launch.id } launch = { launch } />;
    });

    const fetchMoreLaunches = async () => {
        setIsLoadingMore(true);

        await fetchMore({ variables: { after: data?.launches.cursor } });

        setIsLoadingMore(false);
    };

    return (
        <>
            <Header title = 'Space Explorer' />

            {loading && !data && <Loading />}

            {launchesListJSX}

            {data?.launches.hasMore
                && (isLoadingMore ? (
                    <Loading />
                ) : (
                    <Button onClick = { fetchMoreLaunches }>Load More</Button>
                ))}
        </>
    );
};
