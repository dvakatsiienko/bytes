/* Core */
import { PrismaClient } from '.prisma/client/edge';

/* Instruments */
import { friendList } from './seed-data';

const prisma = new PrismaClient();

async function seed() {
    try {
        await prisma.friend.createMany({ data: friendList });

        console.log('✅ Seed succseeded.');
    } catch (error) {
        console.log('❌ Seed failed.');
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
