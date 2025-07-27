import { friendList } from './seed-data';
import { PrismaClient } from '.prisma/client/edge';

const prisma = new PrismaClient();

async function seed() {
    try {
        await prisma.friend.createMany({ data: friendList });

        console.info('✅ Seed succseeded.');
    } catch (error) {
        console.error('❌ Seed failed.', error);
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
