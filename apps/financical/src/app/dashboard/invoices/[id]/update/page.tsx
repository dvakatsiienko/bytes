/* Core */
import { notFound } from 'next/navigation';

/* Components */
import { Breadcrumbs } from '@/app/dashboard/invoices/ui/Breadcrumbs';
import { InvoiceFormUpdate } from './ui';

/* Instruments */
import { fetchInvoiceById, fetchCustomers, type NextPageProps } from '@/lib';

const UpdateInvoicePage = async (props: NextPageProps) => {
    const params = await props.params;

    const [ invoice, customerList ] = await Promise.all([
        fetchInvoiceById(params.id),
        fetchCustomers(),
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
