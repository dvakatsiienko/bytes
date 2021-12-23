/* Core */
import { NextPage, GetServerSideProps } from 'next';
import { useRouter }                    from 'next/router';
import { merge }                        from 'webpack-merge';

/* Components */
import { CreateProductForm } from '@/components';
import { Layout }            from '@/features/Layout';

/* Instruments */
import * as gql       from '@/graphql';
import { withApollo } from '@/lib';

const SellPage: NextPage = () => {
    const router = useRouter();
    const userQuery = gql.useUserQuery();

    if (!userQuery.data?.authenticatedItem) {
        if (process.browser) {
            router.replace('/login');
        }
        return null;
    }

    return (
        <Layout>
            <CreateProductForm />
        </Layout>
    );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
    const queries = await Promise.all([
        gql.getServerPageAllProducts({}, ctx),
        gql.getServerPageProductsCount({}, ctx),
        gql.getServerPageUser({}, ctx),
    ]);

    return merge(queries);
};

export default withApollo(SellPage);
