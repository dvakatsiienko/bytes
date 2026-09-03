import { z } from 'zod';

import { usdToCents } from './money';

/**
 * Client edge: what the user types. `amount` transforms to integer cents,
 * so everything past the form speaks canonical money.
 */
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

/** Server edge: canonical shape the api stores. */
export const InvoiceRecordSchema = z.object({
  amount: z.number().int().positive(),
  customerId: z.string().min(1),
  status: z.enum(['pending', 'paid']),
});

export const LoginSchema = z.object({
  email: z.email({ message: 'Please enter a valid email.' }),
  password: z.string().min(4, { message: 'At least 4 characters.' }),
});

export const SignupSchema = LoginSchema.extend({
  name: z.string().min(1, { message: 'Please enter your name.' }),
});

/* Types */
export type InvoiceFormValues = z.input<typeof InvoiceInputSchema>;

export type InvoiceRecord = z.infer<typeof InvoiceRecordSchema>;

export type InvoiceStatus = InvoiceRecord['status'];

export type LoginValues = z.infer<typeof LoginSchema>;

export type SignupValues = z.infer<typeof SignupSchema>;

export type InvoiceFormErrors = {
  amount?: string[];
  customerId?: string[];
  status?: string[];
};
