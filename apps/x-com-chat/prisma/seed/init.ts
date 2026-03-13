import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

import { friendList } from './seed-data';
import { PrismaClient } from '~/prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// @ts-expect-error - PrismaPg is not typed yet (after update to prisma 7.5.0)
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
