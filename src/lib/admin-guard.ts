import "server-only";
import { headers } from "next/headers";
import { auth, type SessionUser } from "@/lib/auth";
import { UnauthorizedError, ForbiddenError } from "@/lib/api";

/**
 * The API-side authority for admin routes.
 *
 * Middleware turns away requests with no session cookie, and the admin *layout*
 * guards the pages — but every `/api/admin/*` handler must guard itself too, so
 * a request straight to the JSON API (curl, a script) can't skip the UI's
 * check. This validates the live session against the database and confirms the
 * SUPER_ADMIN role.
 *
 *   no session  → 401 (UnauthorizedError)
 *   wrong role  → 403 (ForbiddenError)
 *
 * Both are shaped into the standard envelope by `route()`.
 */
export async function requireSuperAdmin(): Promise<SessionUser> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    throw new UnauthorizedError("Sign in to the admin console.");
  }
  if (session.user.role !== "SUPER_ADMIN") {
    throw new ForbiddenError("You don’t have permission to do that.");
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
  };
}
