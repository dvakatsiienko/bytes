/* Core */
import type { NextPage, GetServerSideProps } from 'next';

/* Instruments */
import { withAuth } from '@/server/auth';

const TopPage: NextPage = () => {
    return (
        <section>
            <h1>Top</h1>
        </section>
    );
};

export const getServerSideProps: GetServerSideProps = withAuth;

export default TopPage;
