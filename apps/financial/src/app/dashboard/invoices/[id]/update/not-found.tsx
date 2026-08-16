import { FaceFrownIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const NotFoundPage = () => {
  return (
    <main className='flex h-full flex-col items-center justify-center gap-2'>
      <FaceFrownIcon className='w-10 text-ink-soft' />
      <h2 className='font-semibold text-xl'>404 Not Found</h2>
      <p>Could not find the requested invoice.</p>
      <Link
        className='mt-4 bg-seal px-4 py-2 text-paper text-sm transition-colors hover:bg-ink'
        href='/dashboard/invoices'>
        Go Back
      </Link>
    </main>
  );
};

export default NotFoundPage;
