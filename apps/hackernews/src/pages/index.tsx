/* Core */
import type { NextPage, GetServerSideProps } from 'next';

/* Instruments */
import { trpc } from '@/api';
import { withAuth } from '@/server/auth';

const HomePage: NextPage = () => {
    const hello = trpc.example.hello.useQuery({ text: 'from tRPC' });

    return (
        <section>
            <h1 className = 'text-3xl font-bold underline'>All news...</h1>

            <p>{hello?.data?.greeting}</p>
        </section>
    );
};

export const getServerSideProps: GetServerSideProps = withAuth;

export default HomePage;
