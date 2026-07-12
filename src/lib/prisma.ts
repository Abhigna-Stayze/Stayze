import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/lib/env";

// The single Prisma client for the whole app. Import `prisma` from here and
// never construct a PrismaClient anywhere else — a second instance means a
// second connection pool.
//
// Prisma 7 has no zero-argument constructor: PrismaClientOptions requires
// either a driver adapter or an Accelerate URL. For Supabase Postgres that
// adapter is @prisma/adapter-pg.
//
// Runs on the pooled connection (PgBouncer, port 6543). DIRECT_URL is for
// migrations and the seed only.
const createPrismaClient = () =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
  });

// Next.js hot-reloads modules in development, which would otherwise open a
// fresh pool on every edit until Postgres refuses new connections.
const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
