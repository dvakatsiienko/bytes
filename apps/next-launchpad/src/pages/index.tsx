/* Core */
import { NextPage } from 'next';

/* Components */
import { Layout, Nav } from '@/components';

const IndexPage: NextPage = () => {
    return (
        <Layout>
            <Nav title = 'Home' />
        </Layout>
    );
};

export default IndexPage;
