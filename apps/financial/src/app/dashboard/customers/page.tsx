import { fetchCustomerListFiltered } from '@/lib/queries';

import { CustomerTable } from './ui/CustomerTable';
import type { NextPageProps } from '@/types';

const CustomersPage = async (props: NextPageProps) => {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';

  const customers = await fetchCustomerListFiltered(query);

  return (
    <section>
      <CustomerTable customerList={customers} />
    </section>
  );
};

export default CustomersPage;
