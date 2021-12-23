/* Core */
import { NextPage, GetServerSideProps } from 'next';
import Head                             from 'next/head';
import { useRouter }                    from 'next/router';
import { merge }                        from 'webpack-merge';

/* Components */
import { ErrorMessage } from '@/components';
import { Layout }       from '@/features/Layout';
import { OrderDetails } from '@/features/Orders';

/* Instruments */
import * as gql       from '@/graphql';
import { withApollo } from '@/lib';

const OrderByIdPage: NextPage = () => {
    const router = useRouter();
    const orderId = router.query.orderId as string;

    const orderQuery = gql.useOrderQuery({ variables: { id: orderId } });

    if (orderQuery.error) {
        return <ErrorMessage error = { orderQuery.error } />;
    }

    const { data: order } = orderQuery;

    return (
        <Layout>
            <Head>
                <title>Clever — {order?.order.id}</title>
            </Head>

            <OrderDetails order = { order?.order } />
        </Layout>
    );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
    const orderId = ctx.query.orderId as string;

    const [ userQuery, allOrdersQuery ] = await Promise.all([
        gql.getServerPageUser({}, ctx),
        gql.getServerPageOrder({ variables: { id: orderId } }, ctx),
    ]);

    return merge(userQuery, allOrdersQuery);
};

export default withApollo(OrderByIdPage);
