'use client';

import cx from 'clsx';
// import { useQuery } from '@tanstack/react-query';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import NextLink from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { /* fetchInvoicesPages, */ generatePagination } from '@/lib/utils';

export const Pagination = (props: PaginationProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;

  // TODO connect rQuery
  // const totalPages = useQuery({
  //     queryKey: [ 'totalPages', props.query ],
  //     queryFn:  () => fetchInvoicesPages(props.query),
  // });

  const paginationNumberList = generatePagination(
    currentPage,
    props.totalPages,
  );

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());

    return `${pathname}?${params.toString()}`;
  };

  const paginationNumberListJSX = paginationNumberList.map((page, index) => {
    let position: UPosition = null;

    if (index === 0) position = 'first';
    if (index === paginationNumberList.length - 1) position = 'last';
    if (paginationNumberList.length === 1) position = 'single';
    if (page === '...') position = 'middle';

    return (
      <PaginationNumber
        href={createPageURL(page)}
        isActive={currentPage === page}
        key={page}
        page={page}
        position={position}
      />
    );
  });

  return (
    <div className='inline-flex'>
      <PaginationArrow
        direction='left'
        href={createPageURL(currentPage - 1)}
        isDisabled={currentPage <= 1}
      />

      <div className='flex -space-x-px'>{paginationNumberListJSX}</div>

      <PaginationArrow
        direction='right'
        href={createPageURL(currentPage + 1)}
        isDisabled={currentPage >= props.totalPages}
      />
    </div>
  );
};

const PaginationNumber = (props: PaginationNumberProps) => {
  const { page, href, position, isActive } = props;

  const className = cx(
    'flex h-10 w-10 items-center justify-center text-sm border border-gray-400',
    {
      'hover:bg-gray-100': !isActive && position !== 'middle',
      'rounded-l-md': position === 'first' || position === 'single',
      'rounded-r-md': position === 'last' || position === 'single',
      'text-gray-300': position === 'middle',
      'z-10 bg-blue-600 border-blue-600 text-white': isActive,
    },
  );

  return isActive || position === 'middle' ? (
    <div className={className}>{page}</div>
  ) : (
    <NextLink className={className} href={href}>
      {page}
    </NextLink>
  );
};

const PaginationArrow = (props: PaginationArrowProps) => {
  const { href, direction, isDisabled } = props;

  const className = cx(
    'flex h-10 w-10 items-center justify-center rounded-md border border-gray-400',
    {
      'hover:bg-gray-100': !isDisabled,
      'ml-2 md:ml-4': direction === 'right',
      'mr-2 md:mr-4': direction === 'left',
      'pointer-events-none text-gray-300': isDisabled,
    },
  );

  const icon =
    direction === 'left' ? (
      <ArrowLeftIcon className='w-4' />
    ) : (
      <ArrowRightIcon className='w-4' />
    );

  return isDisabled ? (
    <div className={className}>{icon}</div>
  ) : (
    <NextLink className={className} href={href}>
      {icon}
    </NextLink>
  );
};

/* Types */
interface PaginationProps {
  totalPages: number;
  query: string;
}

interface PaginationNumberProps {
  page: number | string;
  href: string;
  position?: UPosition;
  isActive: boolean;
}

interface PaginationArrowProps {
  href: string;
  direction: 'left' | 'right';
  isDisabled?: boolean;
}

type UPosition = 'first' | 'last' | 'single' | 'middle' | null;
