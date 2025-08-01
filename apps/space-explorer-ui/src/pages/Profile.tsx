import { Header, LaunchTile, Loading } from '@/components';
import * as gql from '@/graphql';

export const Profile = () => {
  const { data, loading } = gql.useUserProfileQuery({
    fetchPolicy: 'cache-and-network',
  });

  const tripsListJSX =
    data?.userProfile?.trips.map((trip) => {
      return <LaunchTile key={trip.id} launch={trip.launch} trip={trip} />;
    }) ?? [];

  return (
    <>
      <Header title='My Trips' />

      {loading && !data ? <Loading /> : null}

      {tripsListJSX}

      {!(loading || data?.userProfile?.trips.length) && (
        <h4>You haven't booked any trips.</h4>
      )}
    </>
  );
};
