import { NextResponse } from "next/server";

/**
 * GET /api
 *
 * `/api` is a folder, not an endpoint — Route Handlers only answer where a
 * route.ts exists. Without this, hitting /api in a browser is a bare 404, which
 * reads like the API is broken when it is simply not a URL.
 *
 * So: send a human to the docs, and hand a machine the spec.
 */
export async function GET(request: Request) {
  const accept = request.headers.get("accept") ?? "";

  // A browser asks for HTML. Anything else (curl, fetch, a client library) gets
  // JSON telling it where everything is.
  if (accept.includes("text/html")) {
    return NextResponse.redirect(new URL("/api/docs", request.url));
  }

  return NextResponse.json({
    success: true,
    data: {
      name: "Stayze API",
      version: "1.0.0",
      docs: "/api/docs",
      openapi: "/api/openapi.json",
    },
  });
}
