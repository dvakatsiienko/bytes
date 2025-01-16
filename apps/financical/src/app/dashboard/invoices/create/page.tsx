/* Components */
import { CreateInvoiceForm } from './ui/CreateInvoiceForm';
import { Breadcrumbs } from './ui/Breadcrumbs';

/* Instruments */
import { fetchCustomers } from '@/lib/queries';

const CreateInvoicePage = async () => {
    const customerList = await fetchCustomers();

    return (
        <main>
            <Breadcrumbs breadcrumbList = { breadcrumbList } />
            <CreateInvoiceForm customerList = { customerList } />
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
