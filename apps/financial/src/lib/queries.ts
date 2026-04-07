import { prisma } from './prisma';
import { formatCurrency } from './utils';

export async function fetchRevenueList() {
  const revenueList = await prisma.revenue.findMany();

  return revenueList;
}

export async function fetchLatestInvoiceList() {
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
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return invoiceList.map((invoice) => ({
    ...invoice,
    amount: formatCurrency(invoice.amount),
  }));
}

export async function fetchCardData() {
  const [numberOfInvoices, numberOfCustomers, amountsByStatus] =
    await Promise.all([
      prisma.invoice.count(),
      prisma.customer.count(),
      prisma.invoice.groupBy({
        _sum: { amount: true },
        by: ['status'],
      }),
    ]);

  const paid =
    amountsByStatus.find((g) => g.status === 'paid')?._sum.amount ?? 0;
  const pending =
    amountsByStatus.find((g) => g.status === 'pending')?._sum.amount ?? 0;

  return {
    numberOfCustomers,
    numberOfInvoices,
    totalPaidInvoices: formatCurrency(paid),
    totalPendingInvoices: formatCurrency(pending),
  };
}

const ITEMS_PER_PAGE = 6;

export async function fetchInvoiceListFiltered(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const where = query
    ? { customer: { name: { contains: query, mode: 'insensitive' as const } } }
    : undefined;

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
    skip: offset,
    take: ITEMS_PER_PAGE,
    where,
  });

  return invoiceList;
}

export async function fetchInvoicesPages(query: string) {
  const where = query
    ? { customer: { name: { contains: query, mode: 'insensitive' as const } } }
    : undefined;

  const count = await prisma.invoice.count({ where });
  const totalPages = Math.ceil(count / ITEMS_PER_PAGE);

  return totalPages;
}

export async function fetchInvoiceById(id: string) {
  const invoice = await prisma.invoice.findUnique({ where: { id } });

  if (!invoice) return null;

  return {
    ...invoice,
    amount: invoice.amount / 100,
  };
}

export function fetchCustomerList() {
  return prisma.customer.findMany();
}

export function fetchCustomerListFiltered(query: string) {
  const where = query
    ? { name: { contains: query, mode: 'insensitive' as const } }
    : undefined;

  return prisma.customer.findMany({ where });
}
