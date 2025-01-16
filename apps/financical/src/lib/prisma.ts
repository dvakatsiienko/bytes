/* Core */
import { PrismaClient } from '@prisma/client';
import { db, type VercelPoolClient } from '@vercel/postgres';

export const prisma = new PrismaClient();
