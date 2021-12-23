/* Core */
import { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';

/* Components */
import { UserProfile } from '@/components';

/* Instruments */
import * as gql from '@/graphql';
import { getStaticAC } from '@/lib/apollo';

const UserByIdPage: UserByIdPageProps = props => {
    const router = useRouter();
    const userId = router.query.userId as string;

    const userQuery = gql.useUserQuery({ variables: { id: userId } });

    const user = userQuery.data?.user ?? props.user;

    return <UserProfile user = { user } />;
};

export const getStaticProps: GetStaticProps<unknown, { userId: string }> = async ctx => {
    const ac = getStaticAC();

    const userQuery = await ac.query<gql.UserQuery, gql.UserQueryVariables>(
        { variables: { id: ctx.params.userId }, query: gql.UserDocument },
    );

    return { props: userQuery.data, revalidate: 5 };
};

export const getStaticPaths: GetStaticPaths = async () => {
    const ac = getStaticAC();

    const usersQuery = await ac.query<gql.UsersQuery>({
        query: gql.UsersDocument,
    });

    const paths = usersQuery.data.users.map(user => ({
        params: { userId: user.id },
    }));

    return { paths, fallback: 'blocking' };
};

/* Types */
export type UserByIdPageProps = NextPage<{ user: gql.User }>;

export default UserByIdPage;
