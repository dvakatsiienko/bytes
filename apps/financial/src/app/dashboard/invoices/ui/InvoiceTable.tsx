import NextImage from 'next/image';

import { formatCurrency } from '@/lib/money';
import { fetchInvoiceListFiltered } from '@/lib/queries';
import { formatDateToLocal } from '@/lib/utils';

import { DeleteInvoice, UpdateInvoice } from './Buttons';
import { InvoiceStatus } from './InvoiceStatus';
import { figures } from '@/theme/fonts';

export const InvoiceTable = async (props: IInvoiceTableProps) => {
  const invoicesList = await fetchInvoiceListFiltered(
    props.query,
    props.currentPage,
  );

  const invoiceListMobileJSX = invoicesList?.map((invoice) => (
    <div
      className='mb-2 w-full border border-rule bg-white p-4'
      key={invoice.id}>
      <div className='flex items-center justify-between border-rule border-b pb-4'>
        <div>
          <div className='mb-2 flex items-center'>
            <NextImage
              alt={`${invoice.customer.name}'s profile picture`}
              className='mr-2 rounded-full'
              height={28}
              src={invoice.customer.imageUrl ?? ''}
              width={28}
            />
            <p>{invoice.customer.name}</p>
          </div>
          <p className='text-ink-soft text-sm'>{invoice.customer.email}</p>
        </div>
        <InvoiceStatus status={invoice.status} />
      </div>
      <div className='flex w-full items-center justify-between pt-4'>
        <div>
          <p className={`${figures.className} text-xl tabular-nums`}>
            {formatCurrency(invoice.amount)}
          </p>
          <p className='text-ink-soft text-sm'>
            {formatDateToLocal(invoice.createdAt)}
          </p>
        </div>
        <div className='flex justify-end gap-2'>
          <UpdateInvoice id={invoice.id} />
          <DeleteInvoice id={invoice.id} />
        </div>
      </div>
    </div>
  ));

  const invoiceListDesktopJSX = invoicesList?.map((invoice) => (
    <tr className='text-sm' key={invoice.id}>
      <td className='whitespace-nowrap py-3 pr-3 pl-6'>
        <div className='flex items-center gap-3'>
          <NextImage
            alt={`${invoice.customer.name}'s profile picture`}
            className='rounded-full'
            height={28}
            src={invoice.customer.imageUrl ?? ''}
            width={28}
          />
          <p>{invoice.customer.name}</p>
        </div>
      </td>
      <td className='whitespace-nowrap px-3 py-3 text-ink-soft'>
        {invoice.customer.email}
      </td>
      <td
        className={`${figures.className} whitespace-nowrap px-3 py-3 text-right tabular-nums`}>
        {formatCurrency(invoice.amount)}
      </td>
      <td
        className={`${figures.className} whitespace-nowrap px-3 py-3 text-ink-soft`}>
        {formatDateToLocal(invoice.createdAt)}
      </td>
      <td className='whitespace-nowrap px-3 py-3'>
        <InvoiceStatus status={invoice.status} />
      </td>
      <td className='whitespace-nowrap py-3 pr-3 pl-6'>
        <div className='flex justify-end gap-3'>
          <UpdateInvoice id={invoice.id} />
          <DeleteInvoice id={invoice.id} />
        </div>
      </td>
    </tr>
  ));

  return (
    <div className='mt-6 flow-root'>
      <div className='inline-block min-w-full align-middle'>
        <div className='md:hidden'>{invoiceListMobileJSX}</div>

        <table className='hidden min-w-full border border-rule bg-white text-ink md:table'>
          <thead className='caption border-rule border-b bg-bar/50 text-ink-soft'>
            <tr>
              <th className='px-4 py-3 text-left sm:pl-6' scope='col'>
                Customer
              </th>
              <th className='px-3 py-3 text-left' scope='col'>
                Email
              </th>
              <th className='px-3 py-3 text-right' scope='col'>
                Amount
              </th>
              <th className='px-3 py-3 text-left' scope='col'>
                Date
              </th>
              <th className='px-3 py-3 text-left' scope='col'>
                Status
              </th>
              <th className='relative py-3 pr-3 pl-6' scope='col'>
                <span className='sr-only'>Edit</span>
              </th>
            </tr>
          </thead>

          <tbody className='greenbar'>{invoiceListDesktopJSX}</tbody>
        </table>
      </div>
    </div>
  );
};

/* Types */
interface IInvoiceTableProps {
  currentPage: number;
  query: string;
}
