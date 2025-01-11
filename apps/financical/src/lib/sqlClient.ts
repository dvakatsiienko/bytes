/* Core */
import { db } from '@vercel/postgres';

export const sqlClient = await db.connect();
