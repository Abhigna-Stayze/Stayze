import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env.");
}

// Pooled connection (PgBouncer, port 6543). DIRECT_URL is for migrations only.
const createClient = () =>
  new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

// Next.js hot-reloads modules in dev, which would open a new pool per edit.
const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createClient>;
};

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
