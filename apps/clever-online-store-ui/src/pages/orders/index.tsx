/* Core */
import { NextPage, GetServerSideProps } from 'next';
import Head                             from 'next/head';
import { merge }                        from 'webpack-merge';

/* Components */
import { ErrorMessage } from '@/components';
import { Layout }       from '@/features/Layout';
import { OrderList }    from '@/features/Orders';

/* Instruments */
import * as gql       from '@/graphql';
import { withApollo } from '@/lib';

const OrdersPage: NextPage = () => {
    const allOrdersQuery = gql.useAllOrdersQuery();

    if (allOrdersQuery.error) {
        return <ErrorMessage error = { allOrdersQuery.error } />;
    }

    const allOrders = allOrdersQuery.data?.allOrders;

    return (
        <Layout>
            <Head>
                <title>Your Orders ({allOrders.length}).</title>
            </Head>

            <h1>You have {allOrders.length} orders!</h1>
            <OrderList allOrders = { allOrders } />
        </Layout>
    );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
    const queries = await Promise.all([
        gql.getServerPageUser({}, ctx),
        gql.getServerPageAllOrders({}, ctx),
    ]);

    return merge(queries);
};

export default withApollo(OrdersPage);
