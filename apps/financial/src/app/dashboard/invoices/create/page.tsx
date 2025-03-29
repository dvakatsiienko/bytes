/* Components */
import { Breadcrumbs } from '@/app/dashboard/invoices/ui/Breadcrumbs';
import { InvoiceFormCreate } from './ui/InvoiceFormCreate';

/* Instruments */
import { fetchCustomerList } from '@/lib/queries';

const CreateInvoicePage = async () => {
    const customerList = await fetchCustomerList();

    return (
        <main>
            <Breadcrumbs breadcrumbList = { breadcrumbList } />
            <InvoiceFormCreate customerList = { customerList } />
        </main>
    );
};

/* Helpers */
const breadcrumbList = [
    { label: 'Invoices', href: '/dashboard/invoices' },
    {
        label:  'Create Invoice',
        href:   '/dashboard/invoices/create',
        active: true,
    },
];

export default CreateInvoicePage;
