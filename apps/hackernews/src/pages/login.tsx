/* Core */
import { type NextPage, type GetServerSideProps } from 'next';

/* Components */
import { LoginForm } from '@/components';

/* Instruments */
import { getServerSideSession } from '@/server/auth';

const LoginPage: NextPage = () => {
    return <LoginForm />;
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const session = await getServerSideSession(ctx);

    if (session) {
        return {
            redirect: {
                destination: '/',
                permanent:   false,
            },
        };
    }

    return { props: {} };
};

export default LoginPage;
