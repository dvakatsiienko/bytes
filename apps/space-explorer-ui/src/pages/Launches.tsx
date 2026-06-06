import { useState } from 'react';
import { useQuery } from '@apollo/client/react';

import { Button, Header, LaunchTile, Loading } from '@/components';
import * as gql from '@/graphql';

export const Launches = () => {
  const { data, loading, fetchMore } = useQuery(gql.LaunchesDocument, {
    fetchPolicy: 'cache-and-network',
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const launchesListJSX = data?.launches.list.map((launch) => {
    return <LaunchTile key={launch.id} launch={launch} />;
  });

  const fetchMoreLaunches = async () => {
    setIsLoadingMore(true);

    await fetchMore({ variables: { after: data?.launches.cursor } });

    setIsLoadingMore(false);
  };

  return (
    <>
      <Header title='Space Explorer' />

      {loading && !data ? <Loading /> : null}

      {launchesListJSX}

      {data?.launches.hasMore && isLoadingMore ? <Loading /> : null}
      {data?.launches.hasMore && !isLoadingMore ? (
        <Button onClick={fetchMoreLaunches}>Load More</Button>
      ) : null}
    </>
  );
};
