import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { Logo } from "@/components/layout/Logo";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

/**
 * The admin login page — outside the protected route group, so it has no
 * sidebar. A Server Component: if a valid session already exists it sends the
 * visitor straight to the dashboard; otherwise it renders the branded card and
 * the client `LoginForm`.
 */
export default async function AdminLoginPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/admin");

  return (
    <div className="bg-paper flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo priority />
        </div>

        <div className="card-surface mt-8 p-6 sm:p-8">
          <div className="text-center">
            <h1 className="heading-2 text-bark">Welcome back</h1>
            <p className="text-muted-ink mt-1.5 text-sm">
              Sign in to the Stayze admin console.
            </p>
          </div>

          <div className="mt-6">
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </div>
        </div>

        <p className="text-muted-ink mt-6 text-center text-xs">
          Staff only. This area is monitored.
        </p>
      </div>
    </div>
  );
}
