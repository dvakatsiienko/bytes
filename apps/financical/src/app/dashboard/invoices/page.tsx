/* Core */
import { Suspense } from 'react';
import waait from 'waait';

/* Components */
import { Search } from '@/ui/Search';
import { InvoicesTable } from '@/ui/invoices/InvoicesTable';
import { CreateInvoice } from '@/ui/invoices/Buttons';
import { lusitana } from '@/ui/fonts';
import { InvoicesTableSkeleton } from '@/ui/Skeletons';
import { Pagination } from './ui/Pagination';

const InvoicesPage = async () => {
    // await waait(2000);

    return (
        <div className = 'w-full'>
            <div className = 'flex w-full items-center justify-between'>
                <h1 className = { `${ lusitana.className } text-2xl` }>Invoices</h1>
            </div>
            <div className = 'mt-4 flex items-center justify-between gap-2 md:mt-8'>
                <Search placeholder = 'Search invoices...' />
                <CreateInvoice />
            </div>
            {/*  <Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
      <Table query={query} currentPage={currentPage} />
    </Suspense> */}
            <div className = 'mt-5 flex w-full justify-center'>
                {/* <Pagination totalPages={totalPages} /> */}
            </div>
        </div>
    );
};

export default InvoicesPage;
