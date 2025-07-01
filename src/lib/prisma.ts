/*
CRUCIAL

This is a helper to manage a global db connection pool
under the hood to prevent bottlenecks + 500s
*/
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'], //helpful for debugging if u go that route
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
