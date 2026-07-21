/**
 * Seed the first SUPER_ADMIN for the internal admin CMS.
 *
 * Run with:  npm run seed:admin
 *
 * NON-destructive and idempotent — unlike the main `seed.ts` (which wipes every
 * table), this only ever inserts the one admin account, and skips if that email
 * already exists. Safe to run against the live database.
 *
 * Credentials come from the environment (never hardcoded, never committed):
 *   ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME
 *
 * It builds its own Prisma client — the same pattern `seed.ts` uses — to avoid
 * the `server-only` modules (`@/lib/prisma`, `@/lib/auth`) that throw under tsx.
 * The account is created through BetterAuth's real sign-up path, so the password
 * is hashed exactly as a login will verify it. `createAuth` is only given
 * `enableSignUp: true` here; the running app never exposes sign-up.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { createAuth } from "../src/lib/auth-factory";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Stayze Admin";

  if (!email || !password) {
    throw new Error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before seeding the admin.",
    );
  }
  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
  }

  const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log(`✓ Admin already exists: ${email} (role ${existing.role}).`);
      return;
    }

    const auth = createAuth(prisma, { enableSignUp: true });
    await auth.api.signUpEmail({ body: { email, password, name } });
    // Guarantee the role regardless of adapter defaults.
    await prisma.user.update({
      where: { email },
      data: { role: "SUPER_ADMIN", emailVerified: true },
    });

    console.log(`✓ Created SUPER_ADMIN: ${email}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("Admin seed failed:", err);
  process.exit(1);
});
