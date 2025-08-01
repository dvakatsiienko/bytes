export const CardSkeleton = () => {
  return (
    <div
      className={`${shimmer} relative overflow-hidden rounded-xl bg-gray-100 p-2 shadow-sm`}>
      <div className='flex p-4'>
        <div className='h-5 w-5 rounded-md bg-gray-200' />
        <div className='ml-2 h-6 w-16 rounded-md bg-gray-200 font-medium text-sm' />
      </div>
      <div className='flex items-center justify-center truncate rounded-xl bg-white px-4 py-8'>
        <div className='h-7 w-20 rounded-md bg-gray-200' />
      </div>
    </div>
  );
};

export const CardsSkeleton = () => {
  return (
    <>
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </>
  );
};

export const RevenueChartSkeleton = () => {
  return (
    <div className={`${shimmer} relative w-full overflow-hidden md:col-span-4`}>
      <div className='mb-4 h-8 w-36 rounded-md bg-gray-100' />
      <div className='rounded-xl bg-gray-100 p-4'>
        <div className='mt-0 grid h-[410px] grid-cols-12 items-end gap-2 rounded-md bg-white p-4 sm:grid-cols-13 md:gap-4' />
        <div className='flex items-center pt-6 pb-2'>
          <div className='h-5 w-5 rounded-full bg-gray-200' />
          <div className='ml-2 h-4 w-20 rounded-md bg-gray-200' />
        </div>
      </div>
    </div>
  );
};

export const InvoiceSkeleton = () => {
  return (
    <div className='flex flex-row items-center justify-between border-gray-100 border-b py-4'>
      <div className='flex items-center'>
        <div className='mr-2 h-8 w-8 rounded-full bg-gray-200' />
        <div className='min-w-0'>
          <div className='h-5 w-40 rounded-md bg-gray-200' />
          <div className='mt-2 h-4 w-12 rounded-md bg-gray-200' />
        </div>
      </div>
      <div className='mt-2 h-4 w-12 rounded-md bg-gray-200' />
    </div>
  );
};

export const LatestInvoicesSkeleton = () => {
  return (
    <div
      className={`${shimmer} relative flex w-full flex-col overflow-hidden md:col-span-4`}>
      <div className='mb-4 h-8 w-36 rounded-md bg-gray-100' />
      <div className='flex grow flex-col justify-between rounded-xl bg-gray-100 p-4'>
        <div className='bg-white px-6'>
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
          <InvoiceSkeleton />
        </div>
        <div className='flex items-center pt-6 pb-2'>
          <div className='h-5 w-5 rounded-full bg-gray-200' />
          <div className='ml-2 h-4 w-20 rounded-md bg-gray-200' />
        </div>
      </div>
    </div>
  );
};

export const DashboardSkeleton = () => {
  return (
    <>
      <div
        className={`${shimmer} relative mb-4 h-8 w-36 overflow-hidden rounded-md bg-gray-100`}
      />
      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <div className='mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8'>
        <RevenueChartSkeleton />
        <LatestInvoicesSkeleton />
      </div>
    </>
  );
};

export const TableRowSkeleton = () => {
  return (
    <tr className='w-full border-gray-100 border-b last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg'>
      {/* Customer Name and Image */}
      <td className='relative overflow-hidden whitespace-nowrap py-3 pr-3 pl-6'>
        <div className='flex items-center gap-3'>
          <div className='h-8 w-8 rounded-full bg-gray-100' />
          <div className='h-6 w-24 rounded bg-gray-100' />
        </div>
      </td>
      {/* Email */}
      <td className='whitespace-nowrap px-3 py-3'>
        <div className='h-6 w-32 rounded bg-gray-100' />
      </td>
      {/* Amount */}
      <td className='whitespace-nowrap px-3 py-3'>
        <div className='h-6 w-16 rounded bg-gray-100' />
      </td>
      {/* Date */}
      <td className='whitespace-nowrap px-3 py-3'>
        <div className='h-6 w-16 rounded bg-gray-100' />
      </td>
      {/* Status */}
      <td className='whitespace-nowrap px-3 py-3'>
        <div className='h-6 w-16 rounded bg-gray-100' />
      </td>
      {/* Actions */}
      <td className='whitespace-nowrap py-3 pr-3 pl-6'>
        <div className='flex justify-end gap-3'>
          <div className='h-[38px] w-[38px] rounded bg-gray-100' />
          <div className='h-[38px] w-[38px] rounded bg-gray-100' />
        </div>
      </td>
    </tr>
  );
};

export const InvoicesMobileSkeleton = () => {
  return (
    <div className='mb-2 w-full rounded-md bg-white p-4'>
      <div className='flex items-center justify-between border-gray-100 border-b pb-8'>
        <div className='flex items-center'>
          <div className='mr-2 h-8 w-8 rounded-full bg-gray-100' />
          <div className='h-6 w-16 rounded bg-gray-100' />
        </div>
        <div className='h-6 w-16 rounded bg-gray-100' />
      </div>
      <div className='flex w-full items-center justify-between pt-4'>
        <div>
          <div className='h-6 w-16 rounded bg-gray-100' />
          <div className='mt-2 h-6 w-24 rounded bg-gray-100' />
        </div>
        <div className='flex justify-end gap-2'>
          <div className='h-10 w-10 rounded bg-gray-100' />
          <div className='h-10 w-10 rounded bg-gray-100' />
        </div>
      </div>
    </div>
  );
};

export const InvoicesTableSkeleton = () => {
  return (
    <div className='mt-6 flow-root'>
      <div className='inline-block min-w-full align-middle'>
        <div className='rounded-lg bg-gray-50 p-2 md:pt-0'>
          <div className='md:hidden'>
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
            <InvoicesMobileSkeleton />
          </div>
          <table className='hidden min-w-full text-gray-900 md:table'>
            <thead className='rounded-lg text-left font-normal text-sm'>
              <tr>
                <th className='px-4 py-5 font-medium sm:pl-6' scope='col'>
                  Customer
                </th>
                <th className='px-3 py-5 font-medium' scope='col'>
                  Email
                </th>
                <th className='px-3 py-5 font-medium' scope='col'>
                  Amount
                </th>
                <th className='px-3 py-5 font-medium' scope='col'>
                  Date
                </th>
                <th className='px-3 py-5 font-medium' scope='col'>
                  Status
                </th>
                <th
                  className='relative pt-2 pr-6 pb-4 pl-3 sm:pr-6'
                  scope='col'>
                  <span className='sr-only'>Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className='bg-white'>
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* Helpers */
const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';
