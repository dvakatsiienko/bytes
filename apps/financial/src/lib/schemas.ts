import { z } from 'zod';

export const InvoiceSchema = z.object({
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  createdAt: z.string(),
  customerId: z.string({ message: 'Please select a customer.' }),
  id: z.string(),
  status: z.enum(['pending', 'paid'], {
    message: 'Please select an invoice status.',
  }),
});

export const CreateInvoiceSchema = InvoiceSchema.omit({
  createdAt: true,
  id: true,
});

export const UpdateInvoiceSchema = InvoiceSchema.omit({
  createdAt: true,
  id: true,
});

/* Types */
export type TInvoiceStatus = z.infer<typeof InvoiceSchema>['status'];

export type TInvoiceFormErrors = {
  amount?: string[];
  customerId?: string[];
  status?: string[];
};
