'use client';

import {
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import NextLink from 'next/link';

import { type TMutationError, useUpdateInvoice } from '@/lib/mutations';
import { UpdateInvoiceSchema } from '@/lib/schemas';

import { Button } from '@/ui/Button';
import type { Customer, Invoice } from '~/prisma/client';

export const InvoiceFormUpdate = (props: IInvoiceFormUpdateProps) => {
  const updateInvoice = useUpdateInvoice();
  const errors = (updateInvoice.error as TMutationError | null)?.errors;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = UpdateInvoiceSchema.safeParse(formData);

    if (!parsed.success) return; // todo show error message on the ui

    updateInvoice.mutate({ ...parsed.data, id: props.invoice.id });
  };

  const customerListJSX = props.customerList.map((customer) => (
    <option key={customer.id} value={customer.id}>
      {customer.name}
    </option>
  ));

  return (
    <form onSubmit={handleSubmit}>
      <div className='bg-bar/40 p-4 md:p-6'>
        {/* Customer Name */}
        <div className='mb-4'>
          <label className='mb-2 block font-medium text-sm' htmlFor='customer'>
            Choose customer
          </label>
          <div className='relative'>
            <select
              className='peer block w-full cursor-pointer border border-rule py-2 pl-10 text-sm outline-2 placeholder:text-ink-soft'
              defaultValue={props.invoice.customerId}
              id='customer'
              name='customerId'>
              <option disabled value=''>
                Select a customer
              </option>
              {customerListJSX}
            </select>
            <UserCircleIcon className='pointer-events-none absolute top-1/2 left-3 h-[18px] w-[18px] -translate-y-1/2 text-ink-soft' />
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
                className='peer block w-full border border-rule py-2 pl-10 text-sm outline-2 placeholder:text-ink-soft'
                defaultValue={props.invoice.amount}
                id='amount'
                name='amount'
                placeholder='Enter USD amount'
                step='0.01'
                type='number'
              />
              <CurrencyDollarIcon className='pointer-events-none absolute top-1/2 left-3 h-[18px] w-[18px] -translate-y-1/2 text-ink-soft peer-focus:text-ink' />

              <div aria-atomic='true' aria-live='polite' id='amount-error'>
                {errors?.amount?.map((error: string) => (
                  <p className='mt-2 text-flag text-sm' key={error}>
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
          <div className='border border-rule bg-white px-[14px] py-3'>
            <div className='flex gap-4'>
              <div className='flex items-center'>
                <input
                  className='peer/pending h-4 w-4 cursor-pointer border-rule text-ink-soft focus:ring-2'
                  defaultChecked={props.invoice.status === 'pending'}
                  id='pending'
                  name='status'
                  type='radio'
                  value='pending'
                />
                <label
                  className='ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-bar px-3 py-1.5 font-medium text-ink-soft text-xs peer-checked/pending:bg-flag peer-checked/pending:text-paper'
                  htmlFor='pending'>
                  Pending <ClockIcon className='h-4 w-4' />
                </label>
              </div>
              <div className='flex items-center'>
                <input
                  className='peer/paid h-4 w-4 cursor-pointer border-rule text-ink-soft focus:ring-2'
                  defaultChecked={props.invoice.status === 'paid'}
                  id='paid'
                  name='status'
                  type='radio'
                  value='paid'
                />
                <label
                  className='ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-bar px-3 py-1.5 font-medium text-ink-soft text-xs peer-checked/paid:bg-seal peer-checked/paid:text-paper'
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
          className='flex h-10 items-center bg-bar px-4 font-medium text-ink-soft text-sm transition-colors hover:bg-rule'
          href='/dashboard/invoices'>
          Cancel
        </NextLink>

        <Button type='submit'>Edit Invoice</Button>
      </div>
    </form>
  );
};

/* Types */
interface IInvoiceFormUpdateProps {
  customerList: Customer[];
  invoice: Invoice;
}
