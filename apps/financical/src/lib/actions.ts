'use server';

/* Core */
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
// import { signIn } from '@/auth';
// import { AuthError } from 'next-auth';
import { z } from 'zod';
import to from 'await-to-js';
import { randomUUID } from 'crypto';

/* Instruments */
import { prisma } from './prisma';

export const createInvoice = async (_: State, formData: FormData) => {
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount:     formData.get('amount'),
        status:     formData.get('status'),
    });

    if (!validatedFields.success) {
        return {
            errors:  validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
        };
    }

    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;

    const sqlPromise = prisma.invoice.create({
        data: {
            id:     randomUUID(),
            amount: amountInCents,
            customerId,
            date:   new Date(),
            status,
        },
    });

    await to(sqlPromise);

    // TODO check if revalidatePath is needed, since /dashboard/invoices page is dynamic and not cached
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
};

export const updateInvoice = async (id: string, prevState: State, formData: FormData) => {
    const validatedFields = UpdateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount:     formData.get('amount'),
        status:     formData.get('status'),
    });

    if (!validatedFields.success) {
        return {
            errors:  validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Update Invoice.',
        };
    }

    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;

    await to(prisma.invoice.update({
            where: { id },
            data:  {
                customerId,
                amount: amountInCents,
                status,
            },
        }));

    // TODO check if revalidatePath is needed, since /dashboard/invoices page is dynamic and not cached
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
};

export async function deleteInvoice (id: string) {
    try {
        await prisma.invoice.delete({ where: { id }});
        revalidatePath('/dashboard/invoices');

        // return { message: 'Deleted Invoice.' };
    } catch (error) {
        // return { message: 'Database Error: Failed to Delete Invoice.' };
    }
}

// export async function authenticate (prevState: string | undefined, formData: FormData) {
//     try {
//         await signIn('credentials', formData);
//     } catch (error) {
//         if (error instanceof AuthError) {
//             // eslint-disable-next-line smells/no-switch
//             switch (error.type) {
//                 case 'CredentialsSignin':
//                     return 'Invalid credentials.';

//                 default:
//                     return 'Something went wrong.';
//             }
//         }

//         throw error;
//     }
// }

/* Helpers */
const InvoiceSchema = z.object({
    /* eslint-disable camelcase */
    id:         z.string(),
    customerId: z.string({ invalid_type_error: 'Please select a customer.' }),
    amount:     z.coerce.number().gt(0, { message: 'Please enter an amount greater than $0.' }),
    status:     z.enum([ 'pending', 'paid' ], { invalid_type_error: 'Please select an invoice status.' }),
    date:       z.string(),
    /* eslint-enable camelcase */
});

const CreateInvoice = InvoiceSchema.omit({ id: true, date: true });
const UpdateInvoice = InvoiceSchema.omit({ id: true, date: true });

/* Types */
export type State = {
    errors?: {
        customerId?: string[],
        amount?:     string[],
        status?:     string[],
    },
    message?: string | null,
};
