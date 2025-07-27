
import cx from 'clsx';
import { CheckIcon, ClockIcon } from '@heroicons/react/24/outline';

export const InvoiceStatus = (props: { status: string }) => {
    const pendingInvoiceJSX = props.status === 'pending' && (
        <>
            Pending
            <ClockIcon className = 'ml-1 w-4 text-gray-500' />
        </>
    );

    const paidInvoiceJSX = props.status === 'paid' && (
        <>
            Paid
            <CheckIcon className = 'ml-1 w-4 text-white' />
        </>
    );

    return (
        <span
            className = { cx('inline-flex items-center rounded-full px-2 py-1 text-xs', {
                'bg-gray-100 text-gray-500': props.status === 'pending',
                'bg-green-500 text-white':   props.status === 'paid',
            }) }>
            {pendingInvoiceJSX}
            {paidInvoiceJSX}
        </span>
    );
};
