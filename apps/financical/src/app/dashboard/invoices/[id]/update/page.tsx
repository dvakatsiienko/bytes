/* Components */
import { Breadcrumbs } from '@/app/dashboard/invoices/create/ui';
import { UpdateInfoiceForm } from './ui/UpdateInfoiceForm';

/* Instruments */
import { fetchInvoiceById, fetchCustomers, type NextPageProps } from '@/lib';

const UpdateInvoicePage = async (props: NextPageProps) => {
    const params = await props.params;

    const [ invoice, customerList ] = await Promise.all([
        fetchInvoiceById(params.id),
        fetchCustomers(),
    ]);

    return (
        <main>
            test
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
            <UpdateInfoiceForm customerList = { customerList } invoice = { invoice } />
        </main>
    );
};

export default UpdateInvoicePage;
