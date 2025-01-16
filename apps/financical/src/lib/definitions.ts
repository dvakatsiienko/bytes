export interface NextPageProps {
    searchParams?: Promise<{
        query?: string,
        page?:  string,
    }>,
    params: Promise<{ id: string }>,
}

export type LatestInvoice = {
    id:       string,
    name:     string,
    imageUrl: string,
    email:    string,
    amount:   string,
};

// The database returns a number for amount, but we later format it to a string with the formatCurrency function
export type LatestInvoiceRaw = Omit<LatestInvoice, 'amount'> & {
    amount: number,
};

export type InvoicesTable = {
    id:         string,
    customerId: string,
    name:       string,
    email:      string,
    imageUrl:   string,
    date:       string,
    amount:     number,
    status:     'pending' | 'paid',
};

export type CustomersTableType = {
    id:             string,
    name:           string,
    email:          string,
    imageUrl:       string,
    total_invoices: number,
    total_pending:  number,
    total_paid:     number,
};

export type FormattedCustomersTable = {
    id:             string,
    name:           string,
    email:          string,
    imageUrl:       string,
    total_invoices: number,
    total_pending:  string,
    total_paid:     string,
};

export type CustomerField = {
    id:   string,
    name: string,
};

export type InvoiceForm = {
    id:         string,
    customerId: string,
    amount:     number,
    status:     'pending' | 'paid',
};
