/* Core */
import { Suspense } from 'react';

/* Components */
import { Search } from '@/ui/Search';
import { InvoicesTable } from '@/app/dashboard/invoices/ui/InvoicesTable';
import { CreateInvoice } from '@/ui/invoices/Buttons';
import { lusitana } from '@/ui/fonts';
import { InvoicesTableSkeleton } from '@/ui/Skeletons';
import { Pagination } from './ui/Pagination';

/* Instruments */
import { fetchInvoicesPages, type NextPageProps } from '@/lib';

const InvoicesPage = async (props: NextPageProps) => {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';
    const currentPage = Number(searchParams?.page) || 1;

    const totalPages = await fetchInvoicesPages(query);

    return (
        <div className = 'w-full'>
            <div className = 'flex w-full items-center justify-between'>
                <h1 className = { `${ lusitana.className } text-2xl` }>Invoices</h1>
            </div>

            <div className = 'mt-4 flex items-center justify-between gap-2 md:mt-8'>
                <Search placeholder = 'Search invoices...' />
                <CreateInvoice />
            </div>

            <Suspense key = { query + currentPage } fallback = { <InvoicesTableSkeleton /> }>
                <InvoicesTable currentPage = { currentPage } query = { query } />
            </Suspense>

            <div className = 'mt-5 flex w-full justify-center'>
                <Pagination totalPages = { totalPages } />
            </div>
        </div>
    );
};

export default InvoicesPage;
