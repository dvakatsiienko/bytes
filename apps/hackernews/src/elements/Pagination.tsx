/* Core */
import { useRouter } from 'next/router';
import {
    Pagination as NextUiPagination,
    PaginationProps as NextPaginationProps
} from '@nextui-org/react';

export const Pagination = () => {
    const router = useRouter();

    const changePage: NextPaginationProps['onChange'] = (nextPage) => {
        const pathSegment = router.pathname.split('/')[ 1 ];
        router.push(`/${pathSegment}/${nextPage}`);
    };

    if (!router.query.page) return null;

    return (
        <NextUiPagination
            shadow
            boundaries = { 2 }
            color = 'gradient'
            initialPage = { Number(router.query.page) }
            size = 'sm'
            total = { 20 }
            onChange = { changePage }
        />
    );
};
