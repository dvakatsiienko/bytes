/* Core */
import Head   from 'next/head';
import Link   from 'next/link';
import styled from 'styled-components';

/* Components */
import { ErrorMessage } from '@/components';

/* Instruments */
import * as gql from '@/graphql';

const ITEMS_PER_PAGE = Number(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE);

export const Pagination: React.FC<PaginationProps> = props => {
    const productsCountQuery = gql.useProductsCountQuery();

    const pageCount = Math.ceil(
        productsCountQuery.data?._allProductsMeta.count / ITEMS_PER_PAGE,
    );

    if (productsCountQuery.loading) {
        return <h6>Loading...</h6>;
    }
    if (productsCountQuery.error) {
        return <ErrorMessage error = { productsCountQuery.error } />;
    }

    return (
        <Container>
            <Head>
                <title>
                    Clever - Page {props.page} of {pageCount}
                </title>
            </Head>

            <Link href = { `/products?page=${props.page - 1}` }>
                <a aria-disabled = { props.page <= 1 }>← Prev</a>
            </Link>
            <p>
                Page {props.page} of {pageCount}
            </p>
            <p>{productsCountQuery.data?._allProductsMeta.count} Items Total</p>
            <Link href = { `/products?page=${props.page + 1}` }>
                <a aria-disabled = { props.page >= pageCount }>Next →</a>
            </Link>
        </Container>
    );
};

/* Styles */
export const Container = styled.div`
    display: inline-grid;
    grid-template-columns: repeat(4, auto);
    align-content: center;
    align-items: stretch;
    justify-content: center;
    margin: 2rem 0;
    font-size: 16px;
    text-align: center;
    border: 1px solid var(--lightGray);
    border-radius: 10px;

    & > * {
        padding: 15px 30px;
        margin: 0;
        user-select: none;
        border-right: 1px solid var(--lightGray);

        &:last-child {
            border-right: 0;
        }
    }

    a[aria-disabled='true'] {
        color: grey;
        pointer-events: none;
        cursor: not-allowed;
    }

    a {
        font-weight: 600;
        transition: color 0.1s ease, background-color 0.1s ease;

        &:first-child {
            border-radius: 10px 0 0 10px;
        }

        &:last-child {
            border-radius: 0 10px 10px 0;
        }

        &:hover {
            color: white;
            background-color: black;
        }
    }
`;

/* Types */
interface PaginationProps {
    page: number;
}
