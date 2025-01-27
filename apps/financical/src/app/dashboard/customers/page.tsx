/* Components */
import { CustomerTable } from './ui/CustomerTable';

/* Instruments */
import { fetchCustomers } from '@/lib';

const CustomersPage = async () => {
    const customers = await fetchCustomers();

    return (
        <section>
            <CustomerTable customerList = { customers } />
        </section>
    );
};

export default CustomersPage;
