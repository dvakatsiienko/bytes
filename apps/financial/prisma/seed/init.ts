/* Core */
import { PrismaClient } from '~/prisma/client/edge';

/* Instruments */
import { invoices, customers, revenue, users } from './seed-data';
import { hashPassword } from '@/lib/security';

const prisma = new PrismaClient();

async function seed() {
    try {
        await seedUsers();
        await prisma.customer.createMany({ data: customers });
        await prisma.invoice.createMany({ data: invoices });
        await prisma.revenue.createMany({ data: revenue });
        console.log('✅ Seed succseeded.');
    } catch (error) {
        console.log(error);
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
        users.map(async (user) => {
            return {
                ...user,
                password: hashPassword(user.password),
            };
        }),
    );
    await prisma.user.createMany({ data: userList });
}
