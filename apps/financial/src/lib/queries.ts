import { prisma } from './prisma';
import { formatCurrency } from './utils';
import type { Invoice } from '~/prisma/client/edge';

export async function fetchRevenueList() {
  try {
    const revenueList = await prisma.revenue.findMany();

    return revenueList;
  } catch (error) {
    console.error('Database Error:', error);

    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoiceList() {
  try {
    const invoiceList = await prisma.invoice.findMany({
      include: {
        customer: {
          select: {
            email: true,
            imageUrl: true,
            name: true,
          },
        },
      },
    });

    // TODO sort by date
    const latestInvoiceList = invoiceList.map((invoice) => {
      return {
        ...invoice,
        amount: formatCurrency(invoice.amount),
      };
    });

    return latestInvoiceList;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  try {
    const numberOfInvoices = await prisma.invoice.count();
    const numberOfCustomers = await prisma.customer.count();
    const invoiceList = await prisma.invoice.findMany();

    const invoiceStatusMap = {
      paid: invoiceList.reduce((acc, curr) => {
        // biome-ignore lint/style/noParameterAssign: fix later
        if (curr.status === 'paid') acc += curr.amount;

        return acc;
      }, 0),
      pending: invoiceList.reduce((acc, curr) => {
        // biome-ignore lint/style/noParameterAssign: fix later
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

export async function fetchInvoiceListFiltered(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoiceList = await prisma.invoice.findMany({
      include: {
        customer: {
          select: {
            email: true,
            imageUrl: true,
            name: true,
          },
        },
      },
    });

    // TODO filter by:
    // - customer name
    // - customer email
    // - invoice amount
    // - invoice date
    // - invoice status
    const invoiceListFiltered = invoiceList
      .filter((invoice) =>
        invoice.customer.name?.toLowerCase().includes(query.toLowerCase()),
      )
      .slice(offset, offset + ITEMS_PER_PAGE);

    return invoiceListFiltered;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const invoiceList = await prisma.invoice.findMany({
      include: {
        customer: {
          select: {
            email: true,
            imageUrl: true,
            name: true,
          },
        },
      },
    });

    // TODO filter by:
    // - customer name
    // - customer email
    // - invoice amount
    // - invoice date
    // - invoice status
    const invoiceListFiltered = invoiceList.filter((invoice) => {
      if (query.length === 0) return true;

      return invoice.customer.name?.toLowerCase().includes(query.toLowerCase());
    });

    const totalPages = Math.ceil(
      (invoiceListFiltered.length + 1) / ITEMS_PER_PAGE,
    );

    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const invoice = await prisma.invoice.findUnique({ where: { id } });

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

export async function fetchCustomerList() {
  try {
    const customerList = await prisma.customer.findMany();

    return customerList;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchCustomerListFiltered(/* query: string */) {
  // TODO implement
}
