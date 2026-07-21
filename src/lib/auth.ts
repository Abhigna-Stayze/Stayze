import "server-only";
import { prisma } from "@/lib/prisma";
import { createAuth } from "@/lib/auth-factory";

/**
 * The app's BetterAuth server instance — the single source of truth for
 * sessions, mounted by the `/api/auth/[...all]` route and read by the admin
 * layout's server-side guard (`auth.api.getSession`).
 *
 * `server-only`: it holds the auth secret and the privileged Prisma client and
 * must never reach the browser. Public sign-up is off (see `auth-factory.ts`).
 */
export const auth = createAuth(prisma);

/** The authenticated admin, as the session exposes it. */
export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};
