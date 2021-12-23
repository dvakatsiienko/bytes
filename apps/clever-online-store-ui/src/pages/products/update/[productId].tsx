/* Core */
import { NextPage, GetServerSideProps } from 'next';
import { useRouter }                    from 'next/router';
import { merge }                        from 'webpack-merge';

/* Components */
import { UpdateProductForm } from '@/components';
import { Layout }            from '@/features/Layout';

/* Instruments */
import * as gql       from '@/graphql';
import { withApollo } from '@/lib';

const UpdatePage: NextPage = () => {
    const router = useRouter();
    const productId = router.query.productId as string;
    const userQuery = gql.useUserQuery();

    if (!userQuery.data?.authenticatedItem) {
        if (process.browser) {
            router.replace('/login');
        }
        return null;
    }

    return (
        <Layout>
            <UpdateProductForm productId = { productId } />
        </Layout>
    );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
    const productId = ctx.query.productId as string;

    const queries = await Promise.all([
        gql.getServerPageUser({}, ctx),
        gql.getServerPageProduct({ variables: { id: productId } }, ctx),
    ]);

    return merge(queries);
};

export default withApollo(UpdatePage);
