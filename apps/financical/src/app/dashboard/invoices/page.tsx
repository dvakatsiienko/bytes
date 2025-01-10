/* Core */
import waait from 'waait';

import { Pagination } from './ui/Pagination';
import { Search } from '@/ui/Search';
import { InvoicesTable } from '@/ui/invoices/InvoicesTable';
import { CreateInvoice } from '@/ui/invoices/Buttons';
import { lusitana } from '@/ui/fonts';
import { InvoicesTableSkeleton } from '@/ui/Skeletons';
import { Suspense } from 'react';

const InvoicesPage = async () => {
    // await waait(2000);

    return <p>Invoices Page</p>;
};

export default InvoicesPage;
