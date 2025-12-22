import { fetchCustomerList } from '@/lib/queries';

import { CustomerTable } from './ui/CustomerTable';

const CustomersPage = async () => {
  const customers = await fetchCustomerList();

  return (
    <section>
      <CustomerTable customerList={customers} />
    </section>
  );
};

export default CustomersPage;
