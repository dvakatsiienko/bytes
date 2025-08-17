import { Suspense } from 'react';
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query';
import type { Metadata } from 'next';

import { fetchInvoicesPages } from '@/lib';

import { InvoiceTable, Pagination } from './ui';
import { CreateInvoice } from './ui/Buttons';
import { lusitana } from '@/theme/fonts';
import type { NextPageProps } from '@/types';
import { SearchField } from '@/ui/SearchField';
import { InvoicesTableSkeleton } from '@/ui/Skeletons';

export const metadata: Metadata = { title: 'Invoices' };

const InvoicesPage = async (props: NextPageProps) => {
  const queryClient = new QueryClient();

  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  await queryClient.prefetchQuery({
    queryFn: () => fetchInvoicesPages(query),
    queryKey: ['totalPages', query],
  });

  const totalPages = await fetchInvoicesPages(query);

  return (
    <div className='w-full'>
      <div className='flex w-full items-center justify-between'>
        <h1 className={`${lusitana.className} text-2xl`}>Invoices</h1>
      </div>

      <div className='mt-4 flex items-center justify-between gap-2 md:mt-8'>
        <SearchField placeholder='Search invoices...' />

        <CreateInvoice />
      </div>

      <Suspense fallback={<InvoicesTableSkeleton />} key={query + currentPage}>
        <InvoiceTable currentPage={currentPage} query={query} />
      </Suspense>

      <div className='mt-5 flex w-full justify-center'>
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Pagination query={query} totalPages={totalPages} />
        </HydrationBoundary>
      </div>
    </div>
  );
};

export default InvoicesPage;
