/* Core */
import { NextPage, GetServerSideProps } from 'next';
import { ApolloError, NormalizedCacheObject } from '@apollo/client';

/* Components */
import { UserProfile } from '@/components';

/* Instruments */
import * as gql from '@/graphql';
import { getJwtToken } from '@/utils';

const ProfilePage: ProfilePageProps = (props) => {
    const authQuery = gql.useAuthenticateQuery({
        variables: { token: getJwtToken() },
    });

    const user = authQuery.data?.authenticate ?? props.data.user;

    return <UserProfile isEditable user = { user } />;
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const userQuery = await gql.getServerPageUser(
        { variables: { id: 'f2a1dc1e-b093-4075-9f74-7da6bcf1f3ec' } },
        ctx,
    );

    return userQuery;
};

/* Types */
export type ProfilePageProps = NextPage<{
    apolloState: NormalizedCacheObject;
    data?: gql.UserQuery;
    error?: ApolloError | null;
}>;

export default ProfilePage;
