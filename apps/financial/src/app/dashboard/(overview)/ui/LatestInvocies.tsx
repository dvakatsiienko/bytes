import { ArrowPathIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

import { fetchLatestInvoiceList } from '@/lib/queries';

import { display, figures } from '@/theme/fonts';

export const LatestInvoices = async () => {
  const latestInvoicesList = await fetchLatestInvoiceList();

  const latestInvoicesListJSX = latestInvoicesList.map((invoice) => {
    return (
      <div
        className='flex flex-row items-center justify-between px-4 py-3'
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
            <p className='truncate font-medium text-sm'>
              {invoice.customer.name}
            </p>
            <p className='hidden truncate text-ink-soft text-xs sm:block'>
              {invoice.customer.email}
            </p>
          </div>
        </div>
        <p
          className={`${figures.className} shrink-0 pl-4 text-sm tabular-nums`}>
          {invoice.amount}
        </p>
      </div>
    );
  });

  return (
    <div className='flex w-full flex-col md:col-span-4'>
      <h2 className={`${display.className} mb-3 text-xl tracking-tight`}>
        Latest invoices
      </h2>

      <div className='flex grow flex-col justify-between border border-rule bg-white'>
        <div className='greenbar'>{latestInvoicesListJSX}</div>

        <div className='flex items-center gap-2 border-rule border-t bg-bar/50 px-4 py-2.5'>
          <ArrowPathIcon className='h-4 w-4 text-ink-soft' />
          <h3 className='caption text-ink-soft'>Updated just now</h3>
        </div>
      </div>
    </div>
  );
};
