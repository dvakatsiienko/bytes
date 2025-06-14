/* Core */
import { PrismaClient } from '.prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import dotenv from 'dotenv';

dotenv.config({
    path: '../../.env',
});

const prisma = new PrismaClient().$extends(withAccelerate());

const globalForPrisma = global as unknown as { prisma: typeof prisma };

console.log(process.env.DATABASE_URL);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export { prisma };
