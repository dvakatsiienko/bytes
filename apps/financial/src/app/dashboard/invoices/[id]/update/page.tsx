
import { notFound } from 'next/navigation';


import { Breadcrumbs } from '@/app/dashboard/invoices/ui/Breadcrumbs';
import { InvoiceFormUpdate } from './ui';


import { fetchInvoiceById, fetchCustomerList } from '@/lib';
import type { NextPageProps } from '@/types';

const UpdateInvoicePage = async (props: NextPageProps) => {
    const params = await props.params;

    const [ invoice, customerList ] = await Promise.all([
        fetchInvoiceById(params.id),
        fetchCustomerList(),
    ]);

    if (!invoice) notFound();

    return (
        <main>
            <Breadcrumbs
                breadcrumbList = { [
                    { label: 'Invoices', href: '/dashboard/invoices' },
                    {
                        label:  'Update Invoice',
                        href:   `/dashboard/invoices/${ params.id }/update`,
                        active: true,
                    },
                ] }
            />

            <InvoiceFormUpdate customerList = { customerList } invoice = { invoice } />
        </main>
    );
};

export default UpdateInvoicePage;
