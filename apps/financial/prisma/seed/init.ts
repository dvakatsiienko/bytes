import { hashPassword } from '@/lib/security';

import { customers, invoices, revenue, users } from './seed-data';
import { PrismaClient } from '~/prisma/client/edge';

const prisma = new PrismaClient();

async function seed() {
    try {
        await seedUsers();
        await prisma.customer.createMany({ data: customers });
        await prisma.invoice.createMany({ data: invoices });
        await prisma.revenue.createMany({ data: revenue });
        console.info('✅ Seed succseeded.');
    } catch (error) {
        console.info(error);
    }
}

seed()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (error) => {
        console.error(error);
        await prisma.$disconnect();
        console.info('🏁 Prisma disconnected.');

        process.exit(1);
    });

/* Helpers */
async function seedUsers() {
    const userList = await Promise.all(
        users.map((user) => {
            return {
                ...user,
                password: hashPassword(user.password),
            };
        }),
    );
    await prisma.user.createMany({ data: userList });
}
