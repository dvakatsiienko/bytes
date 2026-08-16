import { CalendarIcon } from '@heroicons/react/24/outline';

import { fetchRevenueList } from '@/lib/queries';
import { generateYAxis } from '@/lib/utils';

import { display, figures } from '@/theme/fonts';

// This component is representational only.
// For data visualization UI, check out:
// https://www.tremor.so/
// https://www.chartjs.org/
// https://airbnb.io/visx/
export const RevenueChart = async () => {
  const revenueList = await fetchRevenueList();

  const chartHeight = 350;

  const { yAxisLabels, topLabel } = generateYAxis(revenueList);

  if (!revenueList || revenueList.length === 0) {
    return <p className='mt-4 text-ink-soft'>No revenue recorded yet.</p>;
  }

  const revenueListJSX = revenueList.map((month) => (
    <div className='flex flex-col items-center gap-2' key={month.month}>
      <div
        className='w-full bg-seal transition-colors hover:bg-flag'
        style={{ height: `${(chartHeight / topLabel) * month.revenue}px` }}
      />
      <p
        className={`${figures.className} -rotate-90 text-ink-soft text-xs sm:rotate-0`}>
        {month.month}
      </p>
    </div>
  ));

  return (
    <div className='w-full md:col-span-4'>
      <h2 className={`${display.className} mb-3 text-xl tracking-tight`}>
        Recent revenue
      </h2>

      <div className='border border-rule bg-white'>
        <div
          className='grid grid-cols-12 items-end gap-2 p-4 sm:grid-cols-13 md:gap-4'
          // Ledger rules behind the bars, so a column can be read off the page.
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, transparent 0 34px, var(--color-rule) 34px 35px)',
          }}>
          <div
            className={`${figures.className} mb-6 hidden flex-col justify-between text-ink-soft text-xs sm:flex`}
            style={{ height: `${chartHeight}px` }}>
            {yAxisLabels.map((label) => (
              <p key={label}>{label}</p>
            ))}
          </div>

          {revenueListJSX}
        </div>

        <div className='flex items-center gap-2 border-rule border-t bg-bar/50 px-4 py-2.5'>
          <CalendarIcon className='h-4 w-4 text-ink-soft' />
          <h3 className='caption text-ink-soft'>Last 12 months</h3>
        </div>
      </div>
    </div>
  );
};
