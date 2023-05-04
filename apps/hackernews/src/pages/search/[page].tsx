/* Core */
import type { NextPage, GetServerSideProps } from 'next';

/* Instruments */
import { withAuth } from '@/server/auth';

/* Components */
import { Pagination } from '@/elements';

const SearchPage: NextPage = () => {
    return (
        <section>
            <h1>Search</h1>
            <Pagination />
        </section>
    );
};

export const getServerSideProps: GetServerSideProps = withAuth;

export default SearchPage;
