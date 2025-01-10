/* Core */
import { BanknotesIcon, ClockIcon, UserGroupIcon, InboxIcon } from '@heroicons/react/24/outline';
import waait from 'waait';

/* Instruments */
import { fetchCardData } from '@/lib/sql';
import { lusitana } from '@/ui/fonts';

export const CardList = async () => {
    const card = await fetchCardData();
    await waait(1000);

    return (
        <>
            <Card title = 'Collected' type = 'collected' value = { card.totalPaidInvoices } />
            <Card title = 'Pending' type = 'pending' value = { card.totalPendingInvoices } />
            <Card title = 'Total Invoices' type = 'invoices' value = { card.numberOfInvoices } />
            <Card title = 'Total Customers' type = 'customers' value = { card.numberOfCustomers } />
        </>
    );
};

const Card = (props: CardProps) => {
    const Icon = iconMap[ props.type ];

    return (
        <div className = 'rounded-xl bg-gray-50 p-2 shadow-sm'>
            <div className = 'flex p-4'>
                {Icon ? <Icon className = 'h-5 w-5 text-gray-700' /> : null}
                <h3 className = 'ml-2 text-sm font-medium'>{props.title}</h3>
            </div>
            <p
                className = { `${ lusitana.className } truncate rounded-xl bg-white px-4 py-8 text-center text-2xl` }>
                {props.value}
            </p>
        </div>
    );
};

/* Helpers */
const iconMap = {
    collected: BanknotesIcon,
    customers: UserGroupIcon,
    pending:   ClockIcon,
    invoices:  InboxIcon,
};

/* Types */
interface CardProps {
    title: string,
    value: number | string,
    type:  'invoices' | 'customers' | 'pending' | 'collected',
}
