/* Core */
import waait from 'waait';

import { Pagination } from './ui/Pagination';
import { Search } from '@/ui/search';
import { InvoicesTable } from '@/_ui/invoices/InvoicesTable';
import { CreateInvoice } from '@/_ui/invoices/Buttons';
import { lusitana } from '@/_ui/fonts';
import { InvoicesTableSkeleton } from '@/_ui/Skeletons';
import { Suspense } from 'react';

const InvoicesPage = async () => {
    // await waait(2000);

    return <p>Invoices Page</p>;
};

export default InvoicesPage;
