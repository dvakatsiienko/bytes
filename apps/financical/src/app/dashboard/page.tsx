/* Components */
import { Card } from './ui/Card';
import { RevenueChart } from './ui/RevenueChart';
import { LatestInvoices } from './ui/LatestInvocies';

/* Instruments */
import { fetchRevenueList, fetchLatestInvoicesList, fetchCardData } from '@/lib/data';
import { lusitana } from '@/ui/fonts';

const Dashboard = async () => {
    const revenueListPromise = fetchRevenueList();
    const latestInvoicesListPromise = fetchLatestInvoicesList();
    const cardDataPromise = fetchCardData();

    const [ revenueList, latestInvoicesList, cardData ] = await Promise.all([
        revenueListPromise,
        latestInvoicesListPromise,
        cardDataPromise,
    ]);

    return (
        <main>
            <h1 className = { `${ lusitana.className } mb-4 text-xl md:text-2xl` }>Dashboard</h1>
            <div className = 'grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                <Card title = 'Collected' type = 'collected' value = { cardData.totalPaidInvoices } />
                <Card title = 'Pending' type = 'pending' value = { cardData.totalPendingInvoices } />
                <Card title = 'Total Invoices' type = 'invoices' value = { cardData.numberOfInvoices } />
                <Card title = 'Total Customers' type = 'customers' value = { cardData.numberOfCustomers } />
            </div>
            <div className = 'mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8'>
                <RevenueChart revenueList = { revenueList } />
                <LatestInvoices latestInvoicesList = { latestInvoicesList } />
            </div>
        </main>
    );
};

export default Dashboard;
