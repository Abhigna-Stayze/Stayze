import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, type SessionUser } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { Unauthorized } from "@/components/admin/Unauthorized";

/**
 * The protected admin layout — the server-side authority behind the whole CMS.
 *
 * Middleware already turned away anyone with no session cookie; this does the
 * real validation on every request: it asks BetterAuth for the live session
 * (`getSession` hits the DB), so an expired or forged cookie fails here even if
 * it slipped past the optimistic middleware check. No session → back to login.
 * A valid session without SUPER_ADMIN → the Unauthorized dead-end. Only a real
 * SUPER_ADMIN reaches the shell. Being a Server Component, this runs before any
 * child page renders, so protection can't be bypassed on the client.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/admin/login");
  if (session.user.role !== "SUPER_ADMIN") return <Unauthorized />;

  const user: SessionUser = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
  };

  return <AdminShell user={user}>{children}</AdminShell>;
}
