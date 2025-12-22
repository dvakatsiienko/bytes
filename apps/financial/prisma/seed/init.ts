import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

import { hashPassword } from '@/lib/security';

import { PrismaClient } from '../../.generated/prisma/client';
import { customers, invoices, revenue, users } from './seed-data';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
