/* Core */
import { Suspense } from 'react';

/* Components */
import { RevenueChartSkeleton, LatestInvoicesSkeleton, CardsSkeleton } from '@/ui/Skeletons';
import { CardList } from '../ui/CardList';
import { RevenueChart } from '../ui/RevenueChart';
import { LatestInvoices } from '../ui/LatestInvocies';

/* Instruments */
import { lusitana } from '@/theme/fonts';

const DashboardPage = () => {
    return (
        <main>
            <h1 className = { `${ lusitana.className } mb-4 text-xl md:text-2xl` }>Dashboard</h1>
            <div className = 'grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                <Suspense fallback = { <CardsSkeleton /> }>
                    <CardList />
                </Suspense>
            </div>
            <div className = 'mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8'>
                <Suspense fallback = { <RevenueChartSkeleton /> }>
                    <RevenueChart />
                </Suspense>
                <Suspense fallback = { <LatestInvoicesSkeleton /> }>
                    <LatestInvoices />
                </Suspense>
            </div>
        </main>
    );
};

export default DashboardPage;
