/* Core */
import type { Invoice } from '@prisma/client';

/* Instruments */
import { prisma } from './prisma';
import { formatCurrency } from './utils';

export async function fetchRevenueList () {
    try {
        const revenueList = await prisma.revenue.findMany();

        return revenueList;
    } catch (error) {
        console.error('Database Error:', error);

        throw new Error('Failed to fetch revenue data.');
    }
}

export async function fetchLatestInvoicesList () {
    try {
        const invoiceList = await prisma.invoice.findMany();
        const customerList = await prisma.customer.findMany();

        const latestInvoices = invoiceList.map((invoice) => {
            const customer = customerList.find((customer) => customer.id === invoice.customerId);

            return {
                ...invoice,
                amount:   formatCurrency(invoice.amount),
                name:     customer?.name,
                imageUrl: customer?.imageUrl,
                email:    customer?.email,
            };
        });

        return latestInvoices;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch the latest invoices.');
    }
}

export async function fetchCardData () {
    try {
        const numberOfInvoices = await prisma.invoice.count();
        const numberOfCustomers = await prisma.customer.count();
        const invoiceList = await prisma.invoice.findMany();

        const invoiceStatusMap = {
            paid: invoiceList.reduce((acc, curr) => {
                // eslint-disable-next-line no-param-reassign
                if (curr.status === 'paid') acc += curr.amount;

                return acc;
            }, 0),
            pending: invoiceList.reduce((acc, curr) => {
                // eslint-disable-next-line no-param-reassign
                if (curr.status === 'pending') acc += curr.amount;

                return acc;
            }, 0),
        };

        const totalPaidInvoices = formatCurrency(invoiceStatusMap.paid);
        const totalPendingInvoices = formatCurrency(invoiceStatusMap.pending);

        return {
            numberOfCustomers,
            numberOfInvoices,
            totalPaidInvoices,
            totalPendingInvoices,
        };
    } catch (error) {
        console.error('Database Error:', error);

        throw new Error('Failed to fetch card data.');
    }
}

const ITEMS_PER_PAGE = 6;

export async function fetchFilteredInvoices (query: string, currentPage: number) {
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    try {
        const invoiceList = await prisma.invoice.findMany();
        const customerList = await prisma.customer.findMany();

        // TODO filter by:
        // - customer name
        // - customer email
        // - invoice amount
        // - invoice date
        // - invoice status
        const inv = invoiceList
            .map((invoice) => {
                const customer = customerList.find((customer) => customer.id === invoice.customerId);

                return {
                    ...invoice,
                    name:     customer?.name,
                    imageUrl: customer?.imageUrl,
                    email:    customer?.email,
                };
            })
            .filter((invoice) => invoice.name?.toLowerCase().includes(query.toLowerCase()))
            .slice(offset, offset + ITEMS_PER_PAGE);

        return inv;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch invoices.');
    }
}

export async function fetchInvoicesPages (query: string) {
    try {
        const invoiceList = await prisma.invoice.findMany();
        const customerList = await prisma.customer.findMany();

        // TODO filter by:
        // - customer name
        // - customer email
        // - invoice amount
        // - invoice date
        // - invoice status
        const inv = invoiceList
            .map((invoice) => {
                const customer = customerList.find((customer) => customer.id === invoice.customerId);

                return {
                    ...invoice,
                    name:     customer?.name,
                    imageUrl: customer?.imageUrl,
                    email:    customer?.email,
                };
            })
            .filter((invoice) => {
                if (query.length === 0) return true;

                return invoice.name?.toLowerCase().includes(query.toLowerCase());
            });

        const totalPages = Math.ceil((inv.length + 1) / ITEMS_PER_PAGE);

        return totalPages;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch total number of invoices.');
    }
}

export async function fetchInvoiceById (id: string) {
    try {
        const invoice = await prisma.invoice.findUnique({ where: { id }});

        const nextInvoice = {
            ...invoice,
            amount: (invoice?.amount ?? 0) / 100,
        } as Invoice;

        return nextInvoice;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch invoice.');
    }
}

export async function fetchCustomers () {
    try {
        const customerList = await prisma.customer.findMany();

        return customerList;
    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch all customers.');
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function fetchFilteredCustomers (query: string) {
    // TODO implement
}
