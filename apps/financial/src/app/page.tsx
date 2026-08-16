import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

import { display } from '@/theme/fonts';
import { AcmeLogo } from '@/ui/AcmeLogo';
import { LedgerSheet } from '@/ui/LedgerSheet';

const RootPage = () => {
  return (
    <main className='flex min-h-screen flex-col p-6'>
      <div className='flex h-20 shrink-0 items-end border-rule border-b p-4 md:h-40'>
        <AcmeLogo />
      </div>

      <div className='mt-4 flex grow flex-col gap-4 md:flex-row'>
        <div className='flex flex-col justify-center gap-6 border border-rule bg-bar/40 px-6 py-10 md:w-2/5 md:px-16'>
          <p className='caption text-ink-soft'>Invoicing, kept straight</p>

          <h1
            className={`${display.className} text-3xl leading-tight tracking-tight md:text-5xl`}>
            Every invoice, on one sheet.
          </h1>

          <p className='max-w-sm text-ink-soft text-sm leading-relaxed'>
            Track what you have billed, what has been paid, and what is still
            owed — without opening a spreadsheet.
          </p>

          <Link
            className='flex items-center gap-4 self-start bg-seal px-6 py-3 font-medium text-paper text-sm transition-colors hover:bg-ink'
            href='/login'>
            <span>Log in</span> <ArrowRightIcon className='w-5' />
          </Link>
        </div>

        <div className='flex items-center justify-center p-6 md:w-3/5 md:py-12'>
          <LedgerSheet />
        </div>
      </div>
    </main>
  );
};

export default RootPage;
