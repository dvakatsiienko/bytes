/* Core */
// import { faker } from '@faker-js/faker';

/* Instruments */
import { prisma } from './client';
import { createUsers } from './createUsers';

async function main() {
    console.log('🌠 Seeding started.');
    await createUsers();

    await prisma.example.createMany({ data: [{}, {}] });

    console.log('✅ DB seeded.');
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        console.log('🏁 Prisma disconnected.');
    });
