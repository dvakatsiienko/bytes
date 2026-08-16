import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

import { display } from '@/theme/fonts';
import { AcmeLogo } from '@/ui/AcmeLogo';
import { LedgerSheet } from '@/ui/LedgerSheet';

const RootPage = () => {
  return (
    <main className='relative flex min-h-screen flex-col'>
      {/* The same pad the dashboard is bound in — perforated edge down the
          left, so the marketing page and the app are one sheet of paper. */}
      <div className='perforation absolute inset-y-0 left-0 w-8 border-rule border-r bg-bar/40' />

      <header className='flex h-20 shrink-0 items-center border-rule border-b pl-14 md:pl-20'>
        <AcmeLogo />
      </header>

      <div className='grid grow md:grid-cols-[minmax(0,44%)_1fr]'>
        <section className='flex flex-col justify-center gap-7 py-16 pr-6 pl-14 md:border-rule md:border-r md:pl-20'>
          <p className='caption text-ink-soft'>Invoicing, kept straight</p>

          <h1
            className={`${display.className} text-4xl leading-[1.05] tracking-tight md:text-5xl lg:text-6xl`}>
            Every invoice,
            <br />
            on one sheet.
          </h1>

          <p className='max-w-sm text-ink-soft leading-relaxed'>
            Track what you have billed, what has been paid, and what is still
            owed — without opening a spreadsheet.
          </p>

          <Link
            className='flex items-center gap-4 self-start bg-seal px-6 py-3.5 font-medium text-paper text-sm transition-colors hover:bg-ink'
            href='/login'>
            <span>Log in</span> <ArrowRightIcon className='w-5' />
          </Link>
        </section>

        {/* The sheet runs off the right edge rather than sitting boxed in the
            middle — it is the page's material, not a picture hung on it. */}
        <div className='relative hidden min-h-[560px] items-center overflow-hidden bg-bar/25 pl-12 md:flex lg:pl-20'>
          <LedgerSheet />
        </div>
      </div>
    </main>
  );
};

export default RootPage;
