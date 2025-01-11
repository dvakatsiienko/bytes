'use server';

/* Core */
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

/* Instruments */
import { sqlClient } from './sqlClient';

export const createInvoice = async (formData: FormData) => {
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount:     formData.get('amount'),
        status:     formData.get('status'),
    });

    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[ 0 ];

    await sqlClient.sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${ customerId }, ${ amountInCents }, ${ status }, ${ date })
    `;

    // TODO check if revalidatePath is needed, since /dashboard/invoices page is dynamic and not cached
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
};

export const updateInvoice = async (id: string, formData: FormData) => {
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount:     formData.get('amount'),
        status:     formData.get('status'),
    });

    const amountInCents = amount * 100;

    await sqlClient.sql`
        UPDATE invoices
        SET customer_id = ${ customerId }, amount = ${ amountInCents }, status = ${ status }
        WHERE id = ${ id }
    `;

    // TODO check if revalidatePath is needed, since /dashboard/invoices page is dynamic and not cached
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
};

export async function deleteInvoice (id: string) {
    await sqlClient.sql`DELETE FROM invoices WHERE id = ${ id }`;

    revalidatePath('/dashboard/invoices');
}

/* Helpers */
const InvoiceSchema = z.object({
    id:         z.string(),
    customerId: z.string(),
    amount:     z.coerce.number(),
    status:     z.enum([ 'pending', 'paid' ]),
    date:       z.string(),
});

const CreateInvoice = InvoiceSchema.omit({ id: true, date: true });
const UpdateInvoice = InvoiceSchema.omit({ id: true, date: true });
