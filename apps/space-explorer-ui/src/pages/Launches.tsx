import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { Button } from '@ui/kit/components/button';

import { Header, LaunchTile, Loading } from '@/components';
import * as gql from '@/graphql';

export const Launches = () => {
  const { data, loading, error, fetchMore } = useQuery(gql.LaunchesDocument, {
    fetchPolicy: 'cache-and-network',
  });
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const launchesListJSX = data?.launches.list.map((launch) => {
    return <LaunchTile key={launch.id} launch={launch} />;
  });

  const fetchMoreLaunches = async () => {
    setIsLoadingMore(true);

    try {
      await fetchMore({ variables: { after: data?.launches.cursor } });
    } catch (fetchError) {
      console.error('Failed to load more launches:', fetchError);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <>
      <Header title='Upcoming launches' />

      {loading && !data ? <Loading /> : null}
      {error && !data ? (
        <p className='text-red' role='alert'>
          Could not load launches: {error.message}
        </p>
      ) : null}

      <div className='flex flex-col gap-6'>{launchesListJSX}</div>

      {data?.launches.hasMore && isLoadingMore ? <Loading /> : null}
      {data?.launches.hasMore && !isLoadingMore ? (
        <Button
          className='mt-8 self-center'
          onClick={fetchMoreLaunches}
          variant='outline'>
          Load more
        </Button>
      ) : null}
    </>
  );
};
