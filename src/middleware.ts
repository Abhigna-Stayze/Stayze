import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Edge middleware — two jobs, both cheap.
 *
 * 1. **Admin gate (optimistic).** Any `/admin/*` route except the login page
 *    needs a session cookie; if it's missing, redirect straight to
 *    `/admin/login` before the request ever reaches a Server Component. This is
 *    only a fast cookie *presence* check — `getSessionCookie` does no database
 *    work, which is what keeps it Edge-safe. The real validation (is the cookie
 *    a live session, is the role SUPER_ADMIN) happens server-side in the admin
 *    layout; middleware just spares unauthenticated visitors a wasted render.
 *
 * 2. **Pathname header.** Sets `x-pathname` so the root layout can tell whether
 *    it's rendering an admin route (bare chrome) or a public one (Header +
 *    Footer), without a client component.
 *
 * Public pages are never blocked — the gate only fires under `/admin`.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  const isAdmin = pathname.startsWith("/admin");
  const isLogin = pathname === "/admin/login";

  if (isAdmin && !isLogin) {
    const sessionCookie = getSessionCookie(request);
    if (!sessionCookie) {
      const loginUrl = new URL("/admin/login", request.url);
      // Remember where they were headed, to return them after login.
      if (pathname !== "/admin") loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Run on every route except Next internals, static assets and the auth API
  // (which manages its own cookies). Files with an extension are skipped.
  matcher: ["/((?!_next/static|_next/image|api/auth|favicon.ico|.*\\.).*)"],
};
