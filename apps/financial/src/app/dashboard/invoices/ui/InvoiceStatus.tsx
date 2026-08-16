import cx from 'clsx';
import { CheckIcon, ClockIcon } from '@heroicons/react/24/outline';

/**
 * A rubber stamp, not a pill. Paid sits slightly off-square because a stamp
 * pressed by hand never lands straight — it is the one place this interface
 * admits a person was involved.
 */
export const InvoiceStatus = (props: { status: string }) => {
  const isPaid = props.status === 'paid';

  return (
    <span
      className={cx(
        'caption inline-flex items-center gap-1 border-2 px-2 py-1 font-semibold',
        isPaid ? '-rotate-3 border-seal text-seal' : 'border-flag/70 text-flag',
      )}>
      {isPaid ? 'Paid' : 'Pending'}
      {isPaid ? (
        <CheckIcon className='w-3.5' />
      ) : (
        <ClockIcon className='w-3.5' />
      )}
    </span>
  );
};
