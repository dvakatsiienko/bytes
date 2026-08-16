import { Suspense } from 'react';
import Image from 'next/image';

import { display, figures } from '@/theme/fonts';
import { SearchField } from '@/ui/SearchField';
import type { Customer } from '~/prisma/client';

export const CustomerTable = (props: ICustomerTableProps) => {
  const customerListHeadJSX = props.customerList.map((customer) => (
    <div
      className='mb-2 w-full border border-rule bg-white p-4'
      key={customer.id}>
      <div className='flex items-center justify-between border-rule border-b pb-4'>
        <div>
          <div className='mb-2 flex items-center'>
            <div className='flex items-center gap-3'>
              <Image
                alt={`${customer.name}'s profile picture`}
                className='rounded-full'
                height={28}
                src={customer.imageUrl}
                width={28}
              />
              <p>{customer.name}</p>
            </div>
          </div>
          <p className='text-ink-soft text-sm'>{customer.email}</p>
        </div>
      </div>
      <div className='flex w-full items-center justify-between border-rule border-b py-5'>
        <div className='flex w-1/2 flex-col'>
          <p className='caption text-ink-soft'>Pending</p>
          <p className={`${figures.className} mt-1 text-flag tabular-nums`}>
            {/* @ts-expect-error: add this field to prisma query */}
            {customer.total_pending}
          </p>
        </div>
        <div className='flex w-1/2 flex-col'>
          <p className='caption text-ink-soft'>Paid</p>
          <p className={`${figures.className} mt-1 text-seal tabular-nums`}>
            {/* @ts-expect-error: add this field to prisma query */}
            {customer.total_paid}
          </p>
        </div>
      </div>
      <div className='pt-4 text-sm'>
        {/* @ts-expect-error: add this field to prisma query */}
        <p>{customer.total_invoices} invoices</p>
      </div>
    </div>
  ));

  const customerListBodyJSX = props.customerList.map((customer) => (
    <tr className='group' key={customer.id}>
      <td className='whitespace-nowrap py-4 pr-3 pl-4 text-sm sm:pl-6'>
        <div className='flex items-center gap-3'>
          <Image
            alt={`${customer.name}'s profile picture`}
            className='rounded-full'
            height={28}
            src={customer.imageUrl}
            width={28}
          />
          <p>{customer.name}</p>
        </div>
      </td>
      <td className='whitespace-nowrap px-4 py-4 text-ink-soft text-sm'>
        {customer.email}
      </td>
      <td
        className={`${figures.className} whitespace-nowrap px-4 py-4 text-right text-sm tabular-nums`}>
        {/* @ts-expect-error: add this field to prisma query */}
        {customer.total_invoices}
      </td>
      <td
        className={`${figures.className} whitespace-nowrap px-4 py-4 text-right text-flag text-sm tabular-nums`}>
        {/* @ts-expect-error: add this field to prisma query */}
        {customer.total_pending}
      </td>
      <td
        className={`${figures.className} whitespace-nowrap px-4 py-4 text-right text-seal text-sm tabular-nums`}>
        {/* @ts-expect-error: add this field to prisma query */}
        {customer.total_paid}
      </td>
    </tr>
  ));

  return (
    <div className='w-full'>
      <header className='mb-8 border-rule border-b pb-4'>
        <p className='caption text-ink-soft'>Ledger</p>
        <h1
          className={`${display.className} mt-2 text-3xl tracking-tight md:text-4xl`}>
          Customers
        </h1>
      </header>

      <Suspense>
        <SearchField placeholder='Search customers...' />
      </Suspense>

      <div className='mt-6 flow-root'>
        <div className='overflow-x-auto'>
          <div className='inline-block min-w-full align-middle'>
            <div className='md:hidden'>{customerListHeadJSX}</div>

            <table className='hidden min-w-full border border-rule bg-white text-ink md:table'>
              <thead className='caption border-rule border-b bg-bar/50 text-ink-soft'>
                <tr>
                  <th className='px-4 py-3 text-left sm:pl-6' scope='col'>
                    Name
                  </th>
                  <th className='px-4 py-3 text-left' scope='col'>
                    Email
                  </th>
                  <th className='px-4 py-3 text-right' scope='col'>
                    Invoices
                  </th>
                  <th className='px-4 py-3 text-right' scope='col'>
                    Pending
                  </th>
                  <th className='px-4 py-3 text-right' scope='col'>
                    Paid
                  </th>
                </tr>
              </thead>

              <tbody className='greenbar'>{customerListBodyJSX}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Types */
interface ICustomerTableProps {
  customerList: Customer[];
}
