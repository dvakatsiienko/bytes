import {
  BanknotesIcon,
  ClockIcon,
  InboxIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

import { fetchCardData } from '@/lib/queries';

import { figures } from '@/theme/fonts';

export const CardList = async () => {
  const card = await fetchCardData();

  return (
    <>
      <Card title='Collected' type='collected' value={card.totalPaidInvoices} />
      <Card title='Pending' type='pending' value={card.totalPendingInvoices} />
      <Card
        title='Total Invoices'
        type='invoices'
        value={card.numberOfInvoices}
      />
      <Card
        title='Total Customers'
        type='customers'
        value={card.numberOfCustomers}
      />
    </>
  );
};

const Card = (props: CardProps) => {
  const Icon = iconMap[props.type];

  return (
    <div className='border border-rule bg-white'>
      <div className='flex items-center gap-2 border-rule border-b bg-bar/50 px-4 py-2.5'>
        {Icon ? <Icon className='h-4 w-4 text-ink-soft' /> : null}
        <h3 className='caption text-ink-soft'>{props.title}</h3>
      </div>
      <p
        className={`${figures.className} truncate px-4 py-7 text-right text-3xl tabular-nums ${TONE[props.type]}`}>
        {props.value}
      </p>
    </div>
  );
};

/* Helpers */
// Money in reads green, money owed reads stamped-red; counts stay neutral.
const TONE = {
  collected: 'text-seal',
  customers: 'text-ink',
  invoices: 'text-ink',
  pending: 'text-flag',
};

const iconMap = {
  collected: BanknotesIcon,
  customers: UserGroupIcon,
  invoices: InboxIcon,
  pending: ClockIcon,
};

/* Types */
interface CardProps {
  title: string;
  type: 'invoices' | 'customers' | 'pending' | 'collected';
  value: number | string;
}
