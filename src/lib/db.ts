import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/lib/env";

// Pooled connection (PgBouncer, port 6543). DIRECT_URL is for migrations only.
const createClient = () =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
  });

// Next.js hot-reloads modules in dev, which would open a new pool per edit.
const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createClient>;
};

export const prisma = globalForPrisma.prisma ?? createClient();

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
