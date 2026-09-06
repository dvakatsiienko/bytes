import { useQuery } from '@apollo/client/react';
import { Link, useParams } from 'react-router-dom';

import { Header, LaunchTile, Loading } from '@/components';
import * as gql from '@/graphql';

export const Launch = () => {
  const params = useParams();
  const { data, loading, error } = useQuery(gql.LaunchDocument, {
    variables: { id: params.launchId ?? '' },
  });

  if (loading) return <Loading />;
  if (error) {
    return (
      <p className='text-red' role='alert'>
        Could not load the launch: {error.message}
      </p>
    );
  }
  if (!data?.launch) return <p className='text-mute'>Launch not found.</p>;

  return (
    <>
      <Header
        image={data.launch.mission?.missionPatch}
        title={data.launch.mission?.name ?? 'Launch'}
      />

      <Link
        className='mb-4 self-start py-1 text-mute text-xs uppercase tracking-[0.18em] transition-colors hover:text-primary'
        to='/launches'>
        ← all launches
      </Link>

      <LaunchTile isDetailed launch={data.launch} />
    </>
  );
};
