/* Core */
import { NextPage, GetServerSideProps } from 'next';

/* Components */
import { Layout } from '@/features/Layout';

/* Instruments */
import * as gql       from '@/graphql';
import { withApollo } from '@/lib';

const ProfilePage: NextPage = () => {
    const userQuery = gql.useUserQuery();

    return (
        <Layout>
            <h1>Profile</h1>
            <h3>{userQuery.data?.authenticatedItem?.name}</h3>
            <div title = 'test' />
        </Layout>
    );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
    const [ userQuery ] = await Promise.all([ gql.getServerPageUser({}, ctx) ]);

    return userQuery;
};

export default withApollo(ProfilePage);
