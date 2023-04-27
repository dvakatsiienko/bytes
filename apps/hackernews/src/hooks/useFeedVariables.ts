/* Core */
import { useRouter } from 'next/router';

const POSTS_PER_PAGE = Number(5);

export const useFeedVariables: UseFeedVariables = (options = { orderBy: {} }) => {
    const router = useRouter();

    const page = parseInt(router.query.page as string);

    const skip = (page - 1) * POSTS_PER_PAGE;
    const take = POSTS_PER_PAGE;

    const orderBy = {
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
    orderBy: any;
}

interface UseFeedVariablesReturn {
    POSTS_PER_PAGE: number;
    page: number;
    variables: any;
}

type UseFeedVariables = (options?: UseFeedVariablesOptions) => UseFeedVariablesReturn;
