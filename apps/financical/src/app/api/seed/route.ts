/* Core */
import bcrypt from 'bcrypt';

/* Instruments */
import { sqlClient } from '@/lib';
import { invoices, customers, revenue, users } from './placeholder-data';

async function seedUsers () {
    await sqlClient.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await sqlClient.sql`
    CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
    );
    `;

    const insertedUsers = await Promise.all(users.map(async (user) => {
            const hashedPassword = await bcrypt.hash(user.password, 10);

            return sqlClient.sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${ user.id }, ${ user.name }, ${ user.email }, ${ hashedPassword })
        ON CONFLICT (id) DO NOTHING;
    `;
        }));

    return insertedUsers;
}

async function seedInvoices () {
    await sqlClient.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    await sqlClient.sql`
        CREATE TABLE IF NOT EXISTS invoices (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        customerId UUID NOT NULL,
        amount INT NOT NULL,
        status VARCHAR(255) NOT NULL,
        date DATE NOT NULL
    );
  `;

    const insertedInvoices = await Promise.all(invoices.map((invoice) => sqlClient.sql`
        INSERT INTO invoices (customerId, amount, status, date)
        VALUES (${ invoice.customerId }, ${ invoice.amount }, ${ invoice.status }, ${ invoice.date })
        ON CONFLICT (id) DO NOTHING;
      `));

    return insertedInvoices;
}

async function seedCustomers () {
    await sqlClient.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    await sqlClient.sql`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      imageUrl VARCHAR(255) NOT NULL
    );
  `;

    const insertedCustomers = await Promise.all(customers.map((customer) => sqlClient.sql`
        INSERT INTO customers (id, name, email, imageUrl)
        VALUES (${ customer.id }, ${ customer.name }, ${ customer.email }, ${ customer.imageUrl })
        ON CONFLICT (id) DO NOTHING;
      `));

    return insertedCustomers;
}

async function seedRevenue () {
    await sqlClient.sql`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `;

    const insertedRevenue = await Promise.all(revenue.map((rev) => sqlClient.sql`
        INSERT INTO revenue (month, revenue)
        VALUES (${ rev.month }, ${ rev.revenue })
        ON CONFLICT (month) DO NOTHING;
      `));

    return insertedRevenue;
}

export async function GET () {
    try {
        await sqlClient.sql`BEGIN`;
        await seedUsers();
        await seedCustomers();
        await seedInvoices();
        await seedRevenue();
        await sqlClient.sql`COMMIT`;

        return Response.json({ message: 'Database seeded successfully' });
    } catch (error) {
        await sqlClient.sql`ROLLBACK`;

        return Response.json({ error }, { status: 500 });
    }
}
