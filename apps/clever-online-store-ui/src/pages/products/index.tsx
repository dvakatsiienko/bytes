/* Core */
import { GetServerSideProps } from 'next';
import { ApolloError }        from '@apollo/client';
import { merge }              from 'webpack-merge';

/* Components */
import { ErrorMessage }    from '@/components';
import { Layout }          from '@/features/Layout';
import { Pagination }      from '@/features/Pagination';
import { ProductCardList } from '@/features/Products';

/* Instruments */
import * as gql       from '@/graphql';
import { withApollo } from '@/lib';

const ITEMS_PER_PAGE = Number(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE);

const PaginatedProductsPage: PageAllProductsComp = props => {
    const allProductsQuery = gql.ssrAllProducts.usePage(() => {
        return {
            variables: {
                first: ITEMS_PER_PAGE,
                skip:  props.initialPage * ITEMS_PER_PAGE - ITEMS_PER_PAGE,
            },
        };
    });

    if (allProductsQuery.error) {
        return <ErrorMessage error = { allProductsQuery.error } />;
    }

    return (
        <Layout>
            <h1>Products</h1>
            <Pagination page = { props.initialPage || 1 } />

            <ProductCardList
                allProductsQuery = { allProductsQuery.data }
                page = { props.initialPage || 1 }
            />

            <Pagination page = { props.initialPage || 1 } />
        </Layout>
    );
};

export const getServerSideProps: GetServerSideProps = async ctx => {
    const page = Number(ctx.query.page ?? 1);
    let initialPage = page;

    if (Number.isNaN(page) || page < 1 || !ctx.query.page) {
        if (ctx.res) {
            ctx.res.writeHead(301, {
                Location: '/products?page=1',
            });
            ctx.res.end();
        }

        initialPage = 1;
    }

    const queries = await Promise.all([
        gql.getServerPageAllProducts(
            {
                variables: {
                    first: ITEMS_PER_PAGE,
                    skip:  initialPage * ITEMS_PER_PAGE - ITEMS_PER_PAGE,
                },
            },
            ctx,
        ),
        gql.getServerPageUser({}, ctx),
        gql.getServerPageProductsCount({}, ctx),
    ]);

    // @ts-expect-error: pagination props have different shape rather than queries
    queries.push({ props: { initialPage } });

    return merge(queries);
};

/* Types */
export type PageAllProductsComp = React.FC<{
    data?: gql.AllProductsQuery;
    error?: ApolloError;
    initialPage: number;
}>;

export default withApollo(PaginatedProductsPage);
