/* Components */
import { CustomersTable } from '@/app/dashboard/customers/ui/CustomersTable';

/* Instruments */
import { fetchCustomers } from '@/lib';

const CustomersPage = async () => {
    const customers = await fetchCustomers();

    return (
        <section>
            <CustomersTable customers = { customers } />
        </section>
    );
};

export default CustomersPage;
