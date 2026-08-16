import { display, figures } from '@/theme/fonts';

/**
 * A record of what came in, not a bill going out. Someone shopping for an
 * invoicing tool wants to picture getting paid — an unpaid statement in the
 * hero sells the wrong half of the job.
 *
 * Real type, real figures, no placeholder bars: a wireframe of a document
 * reads as a document that failed to load. Oversized on purpose, so the hero
 * crops it and the sheet runs past the edge instead of floating in the middle.
 */
export const LedgerSheet = () => (
  <div
    aria-hidden
    className='w-[720px] max-w-none rotate-[-1.5deg] border border-rule bg-white shadow-[0_24px_60px_-30px_rgba(23,28,24,0.35)]'>
    <header className='flex items-end justify-between border-rule border-b px-8 py-6'>
      <div>
        <p className='caption text-ink-soft'>Payments received</p>
        <p className={`${display.className} mt-2 text-2xl tracking-tight`}>
          March 2026
        </p>
      </div>

      <span className='caption border-2 border-seal px-3 py-1.5 font-semibold text-seal'>
        All settled
      </span>
    </header>

    <div className='greenbar'>
      {PAYMENTS.map((payment) => (
        <div
          className='flex items-baseline gap-6 px-8 py-2.5'
          key={payment.client}>
          <span
            className={`${figures.className} shrink-0 text-ink-soft text-xs`}>
            {payment.date}
          </span>
          <span className='min-w-0 flex-1 truncate text-sm'>
            {payment.client}
          </span>
          <span
            className={`${figures.className} shrink-0 text-seal text-sm tabular-nums`}>
            +{payment.amount}
          </span>
        </div>
      ))}
    </div>

    <footer className='flex items-end justify-between gap-6 border-ink border-t-2 px-8 py-6'>
      <div>
        <p className='caption text-ink-soft'>Nothing overdue</p>
        <p className='mt-1 text-ink-soft text-sm'>7 of 7 invoices paid</p>
      </div>

      <div className='text-right'>
        <p className='caption text-ink-soft'>Collected</p>
        <p
          className={`${figures.className} mt-1 text-4xl text-seal tabular-nums`}>
          $12,480.00
        </p>
      </div>
    </footer>
  </div>
);

const PAYMENTS = [
  { amount: '$4,200.00', client: 'Northwind Studio', date: '03.02' },
  { amount: '$2,800.00', client: 'Kestrel & Fen', date: '03.06' },
  { amount: '$1,150.00', client: 'Marlow Coffee Co.', date: '03.11' },
  { amount: '$980.00', client: 'Aster Type Foundry', date: '03.14' },
  { amount: '$1,600.00', client: 'Halden Architects', date: '03.19' },
  { amount: '$620.00', client: 'Pinegrove Books', date: '03.23' },
  { amount: '$1,130.00', client: 'Vantage Cycles', date: '03.28' },
];
