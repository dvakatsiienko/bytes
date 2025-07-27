
import { useParams } from 'react-router-dom';


import { Header, Loading, LaunchTile } from '@/components';


import * as gql from '@/graphql';

export const Launch = () => {
    const params = useParams();
    const { data, loading, error } = gql.useLaunchQuery({ variables: { id: params.launchId ?? '' }});

    if (loading) return <Loading />;
    if (error) return <p>ERROR:{error.message}</p>;
    if (!data) return <p>Not found</p>;

    return (
        <>
            <Header image = { data.launch?.mission?.missionPatch } title = { data.launch?.mission?.name } />

            <LaunchTile isDetailed launch = { data.launch } />
        </>
    );
};
