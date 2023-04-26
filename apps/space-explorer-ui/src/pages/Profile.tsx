/* Components */
import { Loading, Header, LaunchTile } from '@/components';

/* Instruments */
import * as gql from '@/graphql';

export const Profile: React.FC = () => {
    const { data, loading } = gql.useUserProfileQuery({ fetchPolicy: 'cache-and-network' });

    const tripsListJSX = data?.userProfile?.trips.map((trip) => {
        return <LaunchTile key = { trip.id } launch = { trip.launch } trip = { trip } />;
    }) ?? [];

    return (
        <>
            <Header title = 'My Trips' />

            {loading && !data && <Loading />}
            {tripsListJSX}
            {!loading && !data?.userProfile?.trips.length && <h4>You haven't booked any trips.</h4>}
        </>
    );
};
