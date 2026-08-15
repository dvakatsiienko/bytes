import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  datasource: {
    // `env()` throws when the var is unset, which made `prisma generate` in
    // postinstall fail the whole workspace install on any machine or CI runner
    // without a database — generate never connects. Only migrate/push/studio
    // read this, and they fail loudly on their own when it is empty.
    url: process.env.DATABASE_URL ?? '',
  },
  migrations: {
    path: 'prisma/migrations',
  },
  schema: 'prisma/schema.prisma',
});
