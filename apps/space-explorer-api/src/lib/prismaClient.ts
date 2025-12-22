import 'dotenv/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

// import Database from 'better-sqlite3';

import { PrismaClient } from './prisma-client/client';

const dbPath =
  // biome-ignore lint/nursery/noUndeclaredEnvVars: <explanation>
  process.env.DATABASE_URL?.replace('file:', '') || './prisma/db.sqlite';
// const db = new Database(dbPath);
const adapter = new PrismaBetterSqlite3({ url: dbPath });

export const prismaClient = new PrismaClient({ adapter });
