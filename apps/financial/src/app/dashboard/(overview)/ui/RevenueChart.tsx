
import { CalendarIcon } from '@heroicons/react/24/outline';


import { fetchRevenueList } from '@/lib/queries';
import { generateYAxis } from '@/lib/utils';
import { lusitana } from '@/theme/fonts';

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
        return <p className = 'mt-4 text-gray-400'>No data available.</p>;
    }

    const revenueListJSX = revenueList.map((month) => (
        <div key = { month.month } className = 'flex flex-col items-center gap-2'>
            <div
                className = 'w-full rounded-md bg-blue-300'
                style = {{ height: `${ (chartHeight / topLabel) * month.revenue }px` }}
            />
            <p className = '-rotate-90 text-gray-400 text-sm sm:rotate-0'>{month.month}</p>
        </div>
    ));

    return (
        <div className = 'w-full md:col-span-4'>
            <h2 className = { `${ lusitana.className } mb-4 text-xl md:text-2xl` }>Recent Revenue</h2>

            <div className = 'rounded-xl bg-gray-50 p-4'>
                <div className = 'mt-0 grid grid-cols-12 items-end gap-2 rounded-md bg-white p-4 sm:grid-cols-13 md:gap-4'>
                    <div
                        className = 'mb-6 hidden flex-col justify-between text-gray-400 text-sm sm:flex'
                        style = {{ height: `${ chartHeight }px` }}>
                        {yAxisLabels.map((label) => (
                            <p key = { label }>{label}</p>
                        ))}
                    </div>

                    {revenueListJSX}
                </div>

                <div className = 'flex items-center pt-6 pb-2'>
                    <CalendarIcon className = 'h-5 w-5 text-gray-500' />
                    <h3 className = 'ml-2 text-gray-500 text-sm'>Last 12 months</h3>
                </div>
            </div>
        </div>
    );
};
