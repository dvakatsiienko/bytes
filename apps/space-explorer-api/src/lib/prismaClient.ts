import 'dotenv/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

import { PrismaClient } from '~/prisma/client';

const dbPath =
  process.env.DATABASE_URL?.replace('file:', '') || './prisma/db.sqlite';
const adapter = new PrismaBetterSqlite3({ url: dbPath });

export const prismaClient = new PrismaClient({ adapter });
