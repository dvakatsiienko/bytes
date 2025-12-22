import { notFound } from 'next/navigation';

import { Breadcrumbs } from '@/app/dashboard/invoices/ui/Breadcrumbs';

import { fetchCustomerList, fetchInvoiceById } from '@/lib/queries';

import { InvoiceFormUpdate } from './ui';
import type { NextPageProps } from '@/types';

const UpdateInvoicePage = async (props: NextPageProps) => {
  const params = await props.params;

  const [invoice, customerList] = await Promise.all([
    fetchInvoiceById(params.id),
    fetchCustomerList(),
  ]);

  if (!invoice) notFound();

  return (
    <main>
      <Breadcrumbs
        breadcrumbList={[
          { href: '/dashboard/invoices', label: 'Invoices' },
          {
            active: true,
            href: `/dashboard/invoices/${params.id}/update`,
            label: 'Update Invoice',
          },
        ]}
      />

      <InvoiceFormUpdate customerList={customerList} invoice={invoice} />
    </main>
  );
};

export default UpdateInvoicePage;
