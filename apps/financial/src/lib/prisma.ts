import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

import { PrismaClient } from '~/prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// @ts-expect-error - PrismaPg is not typed yet (after update to prisma 7.5.0)
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const globalForPrisma = global as unknown as { prisma: typeof prisma };

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export { prisma };
