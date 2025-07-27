import clsx from 'clsx';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

import { fetchLatestInvoiceList } from '@/lib/queries';

import { lusitana } from '@/theme/fonts';

export const LatestInvoices = async () => {
  const latestInvoicesList = await fetchLatestInvoiceList();

  const latestInvoicesListJSX = latestInvoicesList.map((invoice, i) => {
    return (
      <div
        className={clsx(
          'flex flex-row items-center justify-between border-gray-200 py-4',
          { 'border-t': i !== 0 },
        )}
        key={invoice.id}>
        <div className='flex items-center'>
          <Image
            alt={`${invoice.customer.name}'s profile picture`}
            className='mr-4 rounded-full'
            height={32}
            src={invoice.customer.imageUrl ?? ''}
            width={32}
          />
          <div className='min-w-0'>
            <p className='truncate font-semibold text-sm md:text-base'>
              {invoice.customer.name}
            </p>
            <p className='hidden text-gray-500 text-sm sm:block'>
              {invoice.customer.email}
            </p>
          </div>
        </div>
        <p
          className={`${lusitana.className} truncate font-medium text-sm md:text-base`}>
          {invoice.amount}
        </p>
      </div>
    );
  });

  return (
    <div className='flex w-full flex-col md:col-span-4'>
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Latest Invoices
      </h2>

      <div className='flex grow flex-col justify-between rounded-xl bg-gray-50 p-4'>
        <div className='bg-white px-6'>{latestInvoicesListJSX}</div>

        <div className='flex items-center pt-6 pb-2'>
          <ArrowPathIcon className='h-5 w-5 text-gray-500' />
          <h3 className='ml-2 text-gray-500 text-sm'>Updated just now</h3>
        </div>
      </div>
    </div>
  );
};
