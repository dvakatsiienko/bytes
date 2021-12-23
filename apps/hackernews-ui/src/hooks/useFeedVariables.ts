/* Core */
import { useRouter } from 'next/router';

/* Instruments */
import * as gql from '@/graphql';

const POSTS_PER_PAGE = Number(process.env.NEXT_PUBLIC_POSTS_PER_PAGE);

export const useFeedVariables: UseFeedVariables = (
    options = { orderBy: {} },
) => {
    const router = useRouter();

    const page = parseInt(router.query.page as string);

    const skip = (page - 1) * POSTS_PER_PAGE;
    const take = POSTS_PER_PAGE;

    const orderBy: gql.OrderByInput = {
        createdAt: options.orderBy.createdAt,
        voteCount: options.orderBy.voteCount,
    };

    return {
        POSTS_PER_PAGE,
        page,
        variables: {
            skip,
            take,
            orderBy,
        },
    };
};

/* Types */
interface UseFeedVariablesOptions {
    orderBy: gql.OrderByInput;
}

interface UseFeedVariablesReturn {
    POSTS_PER_PAGE: number;
    page: number;
    variables: gql.FeedQueryVariables;
}

type UseFeedVariables = (
    options?: UseFeedVariablesOptions,
) => UseFeedVariablesReturn;
