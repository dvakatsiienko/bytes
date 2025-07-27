import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import NextLink from 'next/link';

import { deleteInvoice } from '@/lib';

export const CreateInvoice = () => {
    return (
        <NextLink
            className='flex h-10 items-center rounded-lg bg-blue-600 px-4 font-medium text-sm text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2'
            href='/dashboard/invoices/create'>
            <span className='hidden md:block'>Create Invoice</span>{' '}
            <PlusIcon className='h-5 md:ml-4' />
        </NextLink>
    );
};

export const UpdateInvoice = ({ id }: { id: string }) => {
    return (
        <NextLink
            className='rounded-md border border-gray-200 p-2 hover:bg-gray-100'
            href={`/dashboard/invoices/${id}/update`}>
            <PencilIcon className='w-5' />
        </NextLink>
    );
};

export const DeleteInvoice = ({ id }: { id: string }) => {
    const deleteInvoiceWithId = deleteInvoice.bind(null, id);

    return (
        // @ts-expect-error - get rid of server actions
        <form action={deleteInvoiceWithId}>
            <button
                className='rounded-md border border-gray-200 p-2 hover:bg-gray-100'
                type='button'>
                <span className='sr-only'>Delete</span>
                <TrashIcon className='w-5' />
            </button>
        </form>
    );
};
