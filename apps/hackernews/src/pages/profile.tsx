/* Core */
import type { NextPage, GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';

/* Instruments */
import { useTodo1Query, trpc } from '@/api';
import { getServerSideSession } from '@/server/auth';

const ProfilePage: NextPage = () => {
    const todo1query = useTodo1Query();

    const session = useSession();

    const userQuery = trpc.user.getCurrentUserProfile.useQuery({ email: 'admin@email.io' });

    return (
        <section>
            <h1>Profile...</h1>

            <h6>Hello, {session.data?.user.name}</h6>
            <h6>Bio: {session.data?.user.bio}</h6>
            <h6>Location: {session.data?.user.location}</h6>

            <br />
            <br />

            <h1>TRPC Profile</h1>
            <h6>Hello, {userQuery.data?.user?.name}</h6>
            <h6>Bio: {userQuery.data?.user?.bio}</h6>
            <h6>Location: {userQuery.data?.user?.location}</h6>

            <br />
            <br />

            {todo1query.data?.title}

            <br />
            <br />
        </section>
    );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const session = await getServerSideSession(ctx);

    if (!session) {
        return {
            redirect: {
                destination: '/login',
                permanent:   false,
            },
        };
    }

    return { props: { session }};
};

export default ProfilePage;
