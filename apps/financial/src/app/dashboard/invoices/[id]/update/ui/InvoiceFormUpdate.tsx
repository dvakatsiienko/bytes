'use client';

import { useActionState } from 'react';
import {
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import NextLink from 'next/link';

import { type State, updateInvoice } from '@/lib';

import { Button } from '@/ui/Button';
import type { Customer, Invoice } from '~/prisma/client/client';

export const InvoiceFormUpdate = (props: InvoiceFormUpdateProps) => {
  const initialState: State = { errors: {}, message: null };
  const updateInvoiceWithId = updateInvoice.bind(null, props.invoice.id);
  const [actionState, formAction] = useActionState(
    updateInvoiceWithId,
    initialState,
  );

  const customerListJSX = props.customerList.map((customer) => (
    <option key={customer.id} value={customer.id}>
      {customer.name}
    </option>
  ));

  return (
    <form action={formAction}>
      <div className='rounded-md bg-gray-50 p-4 md:p-6'>
        <input name='id' type='hidden' value={props.invoice.id} />

        {/* Customer Name */}
        <div className='mb-4'>
          <label className='mb-2 block font-medium text-sm' htmlFor='customer'>
            Choose customer
          </label>
          <div className='relative'>
            <select
              className='peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500'
              defaultValue={props.invoice.customerId}
              id='customer'
              name='customerId'>
              <option disabled value=''>
                Select a customer
              </option>
              {customerListJSX}
            </select>
            <UserCircleIcon className='pointer-events-none absolute top-1/2 left-3 h-[18px] w-[18px] -translate-y-1/2 text-gray-500' />
          </div>
        </div>

        {/* Invoice Amount */}
        <div className='mb-4'>
          <label className='mb-2 block font-medium text-sm' htmlFor='amount'>
            Choose an amount
          </label>
          <div className='relative mt-2 rounded-md'>
            <div className='relative'>
              <input
                aria-describedby='amount-error'
                className='peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500'
                defaultValue={props.invoice.amount}
                id='amount'
                name='amount'
                placeholder='Enter USD amount'
                step='0.01'
                type='number'
              />
              <CurrencyDollarIcon className='pointer-events-none absolute top-1/2 left-3 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900' />

              <div aria-atomic='true' aria-live='polite' id='amount-error'>
                {actionState.errors?.amount?.map((error: string) => (
                  <p className='mt-2 text-red-500 text-sm' key={error}>
                    {error}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Status */}
        <fieldset>
          <legend className='mb-2 block font-medium text-sm'>
            Set the invoice status
          </legend>
          <div className='rounded-md border border-gray-200 bg-white px-[14px] py-3'>
            <div className='flex gap-4'>
              <div className='flex items-center'>
                <input
                  className='h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2'
                  defaultChecked={props.invoice.status === 'pending'}
                  id='pending'
                  name='status'
                  type='radio'
                  value='pending'
                />
                <label
                  className='ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 font-medium text-gray-600 text-xs'
                  htmlFor='pending'>
                  Pending <ClockIcon className='h-4 w-4' />
                </label>
              </div>
              <div className='flex items-center'>
                <input
                  className='h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2'
                  defaultChecked={props.invoice.status === 'paid'}
                  id='paid'
                  name='status'
                  type='radio'
                  value='paid'
                />
                <label
                  className='ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 font-medium text-white text-xs'
                  htmlFor='paid'>
                  Paid <CheckIcon className='h-4 w-4' />
                </label>
              </div>
            </div>
          </div>
        </fieldset>
      </div>

      <div className='mt-6 flex justify-end gap-4'>
        <NextLink
          className='flex h-10 items-center rounded-lg bg-gray-100 px-4 font-medium text-gray-600 text-sm transition-colors hover:bg-gray-200'
          href='/dashboard/invoices'>
          Cancel
        </NextLink>

        <Button type='submit'>Edit Invoice</Button>
      </div>
    </form>
  );
};

/* Helpers */
// const InvoiceSchema = z.object({
//     id:         z.string(),
//     customerId: z.string(),
//     amount:     z.coerce.number(),
//     status:     z.enum([ 'pending', 'paid' ]),
//     createdAt:       z.string(),
// });

// const UpdateInvoice = InvoiceSchema.omit({ id: true, createdAt: true });

/* Types */
interface InvoiceFormUpdateProps {
  invoice: Invoice;
  customerList: Customer[];
}
