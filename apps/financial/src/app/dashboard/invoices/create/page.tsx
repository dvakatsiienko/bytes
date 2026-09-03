import { Breadcrumbs } from '@/app/dashboard/invoices/ui/Breadcrumbs';

import { fetchCustomerList } from '@/lib/queries';

import { InvoiceForm } from '../ui';

const CreateInvoicePage = async () => {
  const customerList = await fetchCustomerList();

  return (
    <main>
      <Breadcrumbs breadcrumbList={breadcrumbList} />
      <InvoiceForm customerList={customerList} />
    </main>
  );
};

/* Helpers */
const breadcrumbList = [
  { href: '/dashboard/invoices', label: 'Invoices' },
  {
    active: true,
    href: '/dashboard/invoices/create',
    label: 'Create Invoice',
  },
];

export default CreateInvoicePage;
