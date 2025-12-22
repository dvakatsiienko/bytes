import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

import { friendList } from './seed-data';
import { PrismaClient } from '.prisma/client';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
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
