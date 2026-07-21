import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import type { PrismaClient } from "@/generated/prisma/client";

/**
 * BetterAuth instance factory.
 *
 * Kept as a factory (rather than a ready singleton) and deliberately free of
 * any `server-only` import so it can be built two ways from the same config:
 *
 *  - the app's server singleton (`src/lib/auth.ts`) passes the shared
 *    `@/lib/prisma` client, and
 *  - the admin seed script constructs its own client (mirroring
 *    `prisma/seed.ts`, which avoids the `server-only` chain that would throw
 *    under tsx).
 *
 * **Public sign-up is disabled.** This is an internal admin tool with a single
 * seeded SUPER_ADMIN — an open `/sign-up` endpoint would let anyone mint an
 * admin account. Only the seed passes `enableSignUp: true`, so it can create
 * that first account through the real hashing path; the running app never
 * exposes sign-up.
 *
 * `role` is a BetterAuth additional field, `input: false` so it can never be
 * set from a request — the seed/DB default (SUPER_ADMIN) is the only source.
 */
export function createAuth(
  prisma: PrismaClient,
  opts: { enableSignUp?: boolean } = {},
) {
  return betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    emailAndPassword: {
      enabled: true,
      // No open registration — see the module comment.
      disableSignUp: !opts.enableSignUp,
      requireEmailVerification: false,
      autoSignIn: false,
      minPasswordLength: 8,
    },
    session: {
      // A week, refreshed a day at a time as the admin keeps working.
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "SUPER_ADMIN",
          input: false,
        },
      },
    },
    // The Prisma model is `AuthVerification` (a business enum already owns the
    // name `Verification`); point BetterAuth at it.
    verification: { modelName: "authVerification" },
  });
}

export type Auth = ReturnType<typeof createAuth>;
