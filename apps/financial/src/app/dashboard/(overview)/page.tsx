import { Suspense } from 'react';

import { CardList, LatestInvoices, RevenueChart } from './ui';
import { display } from '@/theme/fonts';
import {
  CardsSkeleton,
  LatestInvoicesSkeleton,
  RevenueChartSkeleton,
} from '@/ui/Skeletons';

const DashboardPage = () => {
  return (
    <main>
      <header className='mb-8 border-rule border-b pb-4'>
        <p className='caption text-ink-soft'>Statement</p>
        <h1
          className={`${display.className} mt-2 text-3xl tracking-tight md:text-4xl`}>
          Dashboard
        </h1>
      </header>

      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
        <Suspense fallback={<CardsSkeleton />}>
          <CardList />
        </Suspense>
      </div>

      <div className='mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8'>
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense>

        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <LatestInvoices />
        </Suspense>
      </div>
    </main>
  );
};

export default DashboardPage;
