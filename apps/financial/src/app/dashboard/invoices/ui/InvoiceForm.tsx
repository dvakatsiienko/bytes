'use client';

import {
  CheckIcon,
  ClockIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
/* Core */
import { zodResolver } from '@hookform/resolvers/zod';
import NextLink from 'next/link';
import { Controller, useForm } from 'react-hook-form';

/* Instruments */
import { centsToUsd } from '@/lib/money';
import {
  type MutationError,
  useCreateInvoice,
  useUpdateInvoice,
} from '@/lib/mutations';
import {
  type InvoiceFormValues,
  InvoiceInputSchema,
  type InvoiceRecord,
} from '@/lib/schemas';

/* Components */
import { AmountInput, AmountInputIcon } from './AmountInput';
import { Button } from '@/ui/Button';
import type { Customer, Invoice } from '~/prisma/client';

export const InvoiceForm = (props: InvoiceFormProps) => {
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const mutation = props.invoice ? updateInvoice : createInvoice;
  const serverErrors = (mutation.error as MutationError | null)?.errors;

  const form = useForm<InvoiceFormValues, unknown, InvoiceRecord>({
    defaultValues: props.invoice
      ? {
          amount: centsToUsd(props.invoice.amount),
          customerId: props.invoice.customerId,
          status: props.invoice.status as InvoiceRecord['status'],
        }
      : { amount: '', customerId: '', status: 'pending' },
    resolver: zodResolver(InvoiceInputSchema),
  });

  const fieldError = (name: keyof InvoiceFormValues) => {
    return form.formState.errors[name]?.message ?? serverErrors?.[name]?.[0];
  };

  const handleSubmit = form.handleSubmit((record) => {
    if (props.invoice) {
      updateInvoice.mutate({ ...record, id: props.invoice.id });
    } else {
      createInvoice.mutate(record);
    }
  });

  const customerListJSX = props.customerList.map((customer) => {
    return (
      <option key={customer.id} value={customer.id}>
        {customer.name}
      </option>
    );
  });

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
              aria-describedby='customer-error'
              className='peer block w-full cursor-pointer border border-rule py-2 pl-10 text-sm outline-2 placeholder:text-ink-soft'
              id='customer'
              {...form.register('customerId')}>
              <option disabled value=''>
                Select a customer
              </option>
              {customerListJSX}
            </select>

            <UserCircleIcon className='pointer-events-none absolute top-1/2 left-3 h-[18px] w-[18px] -translate-y-1/2 text-ink-soft' />

            <FieldError
              id='customer-error'
              message={fieldError('customerId')}
            />
          </div>
        </div>

        {/* Invoice Amount */}
        <div className='mb-4'>
          <label className='mb-2 block font-medium text-sm' htmlFor='amount'>
            Choose an amount
          </label>
          <div className='relative mt-2 rounded-md'>
            <div className='relative'>
              <Controller
                control={form.control}
                name='amount'
                render={({ field }) => {
                  return (
                    <AmountInput
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                      value={field.value}
                    />
                  );
                }}
              />

              <AmountInputIcon />

              <FieldError id='amount-error' message={fieldError('amount')} />
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
                  id='pending'
                  type='radio'
                  value='pending'
                  {...form.register('status')}
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
                  id='paid'
                  type='radio'
                  value='paid'
                  {...form.register('status')}
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

        <Button type='submit'>
          {props.invoice ? 'Edit Invoice' : 'Create Invoice'}
        </Button>
      </div>
    </form>
  );
};

const FieldError = (props: FieldErrorProps) => {
  return (
    <div aria-atomic='true' aria-live='polite' id={props.id}>
      {props.message ? (
        <p className='mt-2 text-flag text-sm'>{props.message}</p>
      ) : null}
    </div>
  );
};

/* Types */
interface InvoiceFormProps {
  customerList: Customer[];
  invoice?: Invoice;
}

interface FieldErrorProps {
  id: string;
  message?: string;
}
