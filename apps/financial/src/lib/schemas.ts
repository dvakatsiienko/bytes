import { z } from 'zod';

import { usdToCents } from './money';

export const InvoiceInputSchema = z.object({
  amount: z.string().transform((value, ctx) => {
    const cents = usdToCents(value);

    if (cents === null || cents <= 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Please enter an amount greater than $0.',
      });

      return z.NEVER;
    }

    return cents;
  }),
  customerId: z.string().min(1, { message: 'Please select a customer.' }),
  status: z.enum(['pending', 'paid'], {
    message: 'Please select an invoice status.',
  }),
});

/* Types */
export type InvoiceInput = z.input<typeof InvoiceInputSchema>;

export type InvoiceStatus = z.infer<typeof InvoiceInputSchema>['status'];

export type InvoiceFormErrors = {
  amount?: string[];
  customerId?: string[];
  status?: string[];
};
