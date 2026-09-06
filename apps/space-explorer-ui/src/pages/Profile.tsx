import { useQuery } from '@apollo/client/react';
import { Link } from 'react-router-dom';

import { Header, LaunchTile, Loading } from '@/components';
import * as gql from '@/graphql';

export const Profile = () => {
  const { data, loading } = useQuery(gql.UserProfileDocument, {
    fetchPolicy: 'cache-and-network',
  });

  const trips = data?.userProfile?.trips ?? [];
  const tripsListJSX = trips.map((trip) => {
    return <LaunchTile key={trip.id} launch={trip.launch} trip={trip} />;
  });

  return (
    <>
      <Header title='My trips' />

      {loading && !data ? <Loading /> : null}

      <div className='flex flex-col gap-6'>{tripsListJSX}</div>

      {!loading && trips.length === 0 ? (
        <section className='panel mt-2 p-6'>
          <span className='panel-title'>manifest</span>
          <p className='text-mute'>
            No seats booked yet.{' '}
            <Link
              className='text-primary underline underline-offset-4 hover:text-fg-soft'
              to='/launches'>
              Pick a launch
            </Link>{' '}
            and it lands here.
          </p>
        </section>
      ) : null}
    </>
  );
};
