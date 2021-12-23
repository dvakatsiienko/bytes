/* Core */
import { NextPage, GetServerSideProps } from 'next';
import Head                             from 'next/head';
import { useRouter }                    from 'next/router';
import { merge }                        from 'webpack-merge';

/* Components */
import { ErrorMessage }   from '@/components';
import { Layout }         from '@/features/Layout';
import { ProductDetails } from '@/features/Products';

/* Instruments */
import * as gql       from '@/graphql';
import { withApollo } from '@/lib';

const ProductPage: NextPage = () => {
    const router = useRouter();
    const productId = router.query.productId as string;

    const productQuery = gql.useProductQuery({ variables: { id: productId } });
    const { data: product } = productQuery;

    if (productQuery.error) {
        return <ErrorMessage error = { productQuery.error } />;
    }

    return (
        <Layout>
            <Head>
                <title>Clever | {product?.product.name}</title>
            </Head>

            <ProductDetails product = { product?.product } />
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

export default withApollo(ProductPage);
