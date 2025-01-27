/* Components */
import { CustomerTable } from './ui/CustomerTable';

/* Instruments */
import { fetchCustomerList } from '@/lib';

const CustomersPage = async () => {
    const customers = await fetchCustomerList();

    return (
        <section>
            <CustomerTable customerList = { customers } />
        </section>
    );
};

export default CustomersPage;
