/* eslint camelcase: 0 */

/* Instruments */
import { formatCurrency } from './utils';
import { sqlClient, prisma } from './prisma';

import type { CustomersTableType, InvoicesTable } from './definitions';

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
        const invoiceList = await prisma.invoices.findMany();
        const customerList = await prisma.customers.findMany();

        const latestInvoices = invoiceList.map((invoice) => {
            const customer = customerList.find((customer) => customer.id === invoice.customer_id);

            return {
                ...invoice,
                amount:    formatCurrency(invoice.amount),
                name:      customer?.name,
                image_url: customer?.image_url,
                email:     customer?.email,
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
        const numberOfInvoices = await prisma.invoices.count();
        const numberOfCustomers = await prisma.customers.count();
        const invoiceList = await prisma.invoices.findMany();

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
        const invoices = await sqlClient.sql<InvoicesTable>`
        SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
        FROM invoices
        JOIN customers ON invoices.customer_id = customers.id
        WHERE
        customers.name ILIKE ${ `%${ query }%` } OR
        customers.email ILIKE ${ `%${ query }%` } OR
        invoices.amount::text ILIKE ${ `%${ query }%` } OR
        invoices.date::text ILIKE ${ `%${ query }%` } OR
        invoices.status ILIKE ${ `%${ query }%` }
        ORDER BY invoices.date DESC
        LIMIT ${ ITEMS_PER_PAGE } OFFSET ${ offset }
    `;

        return invoices.rows;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch invoices.');
    }
}

export async function fetchInvoicesPages (query: string) {
    try {
        const count = await sqlClient.sql`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
    customers.name ILIKE ${ `%${ query }%` } OR
    customers.email ILIKE ${ `%${ query }%` } OR
    invoices.amount::text ILIKE ${ `%${ query }%` } OR
    invoices.date::text ILIKE ${ `%${ query }%` } OR
    invoices.status ILIKE ${ `%${ query }%` }
    `;

        const totalPages = Math.ceil(Number(count.rows[ 0 ].count) / ITEMS_PER_PAGE);

        return totalPages;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch total number of invoices.');
    }
}

export async function fetchInvoiceById (id: string) {
    try {
        const invoice = await prisma.invoices.findUnique({ where: { id }});

        const nextInvoice = {
            ...invoice,
            amount: invoice?.amount ?? 0 / 100,
        };

        return nextInvoice;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch invoice.');
    }
}

export async function fetchCustomers () {
    try {
        const customerList = await prisma.customers.findMany();

        return customerList;
    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch all customers.');
    }
}

export async function fetchFilteredCustomers (query: string) {
    try {
        const data = await sqlClient.sql<CustomersTableType>`
            SELECT
            customers.id,
            customers.name,
            customers.email,
            customers.image_url,
            COUNT(invoices.id) AS total_invoices,
            SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
            SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
            FROM customers
            LEFT JOIN invoices ON customers.id = invoices.customer_id
            WHERE
            customers.name ILIKE ${ `%${ query }%` } OR
            customers.email ILIKE ${ `%${ query }%` }
            GROUP BY customers.id, customers.name, customers.email, customers.image_url
            ORDER BY customers.name ASC
        `;

        const customers = data.rows.map((customer) => ({
            ...customer,
            total_pending: formatCurrency(customer.total_pending),
            total_paid:    formatCurrency(customer.total_paid),
        }));

        return customers;
    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch customer table.');
    }
}
