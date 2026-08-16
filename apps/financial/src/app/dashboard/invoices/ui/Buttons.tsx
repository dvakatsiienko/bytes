'use client';

import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import NextLink from 'next/link';

import { useDeleteInvoice } from '@/lib/mutations';

export const CreateInvoice = () => {
  return (
    <NextLink
      className='flex h-10 items-center bg-seal px-5 font-medium text-paper text-sm transition-colors hover:bg-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-seal focus-visible:outline-offset-2'
      href='/dashboard/invoices/create'>
      <span className='hidden md:block'>Create invoice</span>{' '}
      <PlusIcon className='h-5 md:ml-4' />
    </NextLink>
  );
};

export const UpdateInvoice = (props: { id: string }) => {
  return (
    <NextLink
      className='border border-rule p-2 text-ink-soft transition-colors hover:border-seal hover:text-seal'
      href={`/dashboard/invoices/${props.id}/update`}>
      <PencilIcon className='w-5' />
    </NextLink>
  );
};

export const DeleteInvoice = (props: { id: string }) => {
  const deleteInvoice = useDeleteInvoice();

  const handleClick = () => {
    deleteInvoice.mutate(props.id);
  };

  return (
    <button
      className='border border-rule p-2 text-ink-soft transition-colors hover:border-flag hover:text-flag'
      onClick={handleClick}
      type='button'>
      <span className='sr-only'>Delete</span>
      <TrashIcon className='w-5' />
    </button>
  );
};
