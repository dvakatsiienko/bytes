/* Core */
import { PrismaClient } from '@prisma/client';
import { db, type VercelPoolClient } from '@vercel/postgres';

let sqlClient = null as unknown as VercelPoolClient;

// ? bug: db.connect() instance causes a crash when leaks to
// ? the React Client Component due to the absence of process.env.POSTGRES_URL
// TODO replace with prisma
if (process.env.POSTGRES_URL) sqlClient = await db.connect();

sqlClient as VercelPoolClient;

export { sqlClient };

export const prisma = new PrismaClient();
