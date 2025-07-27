'use server';

import { randomUUID } from 'node:crypto';
import to from 'await-to-js';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { prisma } from './prisma';

export const createInvoice = async (_: State, formData: FormData) => {
  const validatedFields = CreateInvoice.safeParse({
    amount: formData.get('amount'),
    customerId: formData.get('customerId'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  const sqlPromise = prisma.invoice.create({
    data: {
      amount: amountInCents,
      customerId,
      id: randomUUID(),
      status,
    },
  });

  await to(sqlPromise);

  // TODO check if revalidatePath is needed, since /dashboard/invoices page is dynamic and not cached
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
};

export const updateInvoice = async (
  id: string,
  _prevState: State,
  formData: FormData,
) => {
  const validatedFields = UpdateInvoice.safeParse({
    amount: formData.get('amount'),
    customerId: formData.get('customerId'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  await to(
    prisma.invoice.update({
      data: {
        amount: amountInCents,
        customerId,
        status,
      },
      where: { id },
    }),
  );

  // TODO check if revalidatePath is needed, since /dashboard/invoices page is dynamic and not cached
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
};

/* eslint-disable */
export async function deleteInvoice(id: string) {
  try {
    await prisma.invoice.delete({ where: { id } });
    revalidatePath('/dashboard/invoices');
    return { message: 'Deleted Invoice.' };
  } catch (error) {
    return { message: 'Database Error: Failed to Delete Invoice.' };
  }
}

// biome-ignore lint/suspicious/useAwait: not implemented yet
export async function authenticate(
  //   prevState: string | undefined,
  //   formData: FormData,
) {
  // TODO implement authentication
  return redirect('/dashboard');

  // try {
  //     const result = await signIn('credentials', formData);
  // } catch (error) {
  //     if (error instanceof AuthError) {
  //         // eslint-disable-next-line smells/no-switch
  //         switch (error.type) {
  //             case 'CredentialsSignin':
  //                 return 'Invalid credentials.';
  //             default:
  //                 return 'Something went wrong.';
  //         }
  //     }
  //     throw error;
  // }
}
/* eslint-enable */

/* Helpers */
const InvoiceSchema = z.object({
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

const CreateInvoice = InvoiceSchema.omit({ createdAt: true, id: true });
const UpdateInvoice = InvoiceSchema.omit({ createdAt: true, id: true });

/* Types */
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};
