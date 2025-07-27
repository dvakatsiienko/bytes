import { withAccelerate } from '@prisma/extension-accelerate';

import { PrismaClient } from '~/prisma/client/edge';

const prisma = new PrismaClient({
  datasourceUrl:
    'prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiMDFKWThWWFFSNE1DUjhDRUMxUVI1NVBCREMiLCJ0ZW5hbnRfaWQiOiI5ZGUxNzY0Njg3YzViZDdkN2I3MjRmNzg1MjhjOWE2MGEwYWJmN2Q1YjBkMDM3MDE0NDYwN2ZkYmIwMTg3NDRmIiwiaW50ZXJuYWxfc2VjcmV0IjoiZGYwMDMyYTAtM2Q0MS00ZTViLTg1MjItMDBhMzExZjExNjM0In0.es5rR-NJoyZ8YtGQhWkIFKooFYTffeUgEXUYn6i5Q7k',
}).$extends(withAccelerate());

const globalForPrisma = global as unknown as { prisma: typeof prisma };

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export { prisma };
