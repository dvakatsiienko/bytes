import { Suspense } from 'react';
import type { Metadata } from 'next';

import { fetchInvoicesPages } from '@/lib/queries';

import { InvoiceTable, Pagination } from './ui';
import { CreateInvoice } from './ui/Buttons';
import { display } from '@/theme/fonts';
import type { NextPageProps } from '@/types';
import { SearchField } from '@/ui/SearchField';
import { InvoicesTableSkeleton } from '@/ui/Skeletons';

export const metadata: Metadata = { title: 'Invoices' };

const InvoicesPage = async (props: NextPageProps) => {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;

  const totalPages = await fetchInvoicesPages(query);

  return (
    <div className='w-full'>
      <header className='mb-8 border-rule border-b pb-4'>
        <p className='caption text-ink-soft'>Ledger</p>
        <h1
          className={`${display.className} mt-2 text-3xl tracking-tight md:text-4xl`}>
          Invoices
        </h1>
      </header>

      <div className='flex items-center justify-between gap-3'>
        <SearchField placeholder='Search invoices...' />

        <CreateInvoice />
      </div>

      <Suspense fallback={<InvoicesTableSkeleton />} key={query + currentPage}>
        <InvoiceTable currentPage={currentPage} query={query} />
      </Suspense>

      <div className='mt-5 flex w-full justify-center'>
        <Pagination query={query} totalPages={totalPages} />
      </div>
    </div>
  );
};

export default InvoicesPage;
