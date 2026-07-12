import "server-only";
import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { BookingError } from "@/services/booking.service";
import { StorageConflictError, StorageError } from "@/lib/storage";
import { env } from "@/lib/env";

/**
 * The API contract, in one place.
 *
 * Every route returns the same envelope, so a client — the website, a mobile
 * app, an admin dashboard, WhatsApp automation — can branch on `success`
 * without knowing which endpoint it called.
 *
 *   { "success": true,  "data": … }
 *   { "success": false, "error": { "message": …, "issues"?: … } }
 *
 * Routes stay thin: validate, call a service, return. They never touch Prisma,
 * never catch their own errors, and never format a response by hand.
 */

export type ApiSuccess<T> = { success: true; data: T };
export type ApiFailure = {
  success: false;
  error: { message: string; issues?: FieldIssue[] };
};
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type FieldIssue = { field: string; message: string };

/** 200. */
export function ok<T>(data: T): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data }, { status: 200 });
}

/** 201. */
export function created<T>(data: T): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data }, { status: 201 });
}

/** Any failure. */
export function fail(
  message: string,
  status: number,
  issues?: FieldIssue[],
): NextResponse<ApiFailure> {
  return NextResponse.json(
    { success: false, error: issues ? { message, issues } : { message } },
    { status },
  );
}

/** 404 — the resource does not exist, or is not published. */
export function notFound(what = "Not found"): NextResponse<ApiFailure> {
  return fail(what, 404);
}

/**
 * Wrap a route handler so no error ever escapes unshaped.
 *
 * The important guarantee: a raw Prisma error is NEVER returned to a client.
 * Those messages carry table names, column names and constraint names — a free
 * schema dump for anyone probing the API. They are logged server-side and
 * replaced with a generic 500.
 */
export function route<T>(
  handler: () => Promise<NextResponse<ApiResponse<T>>>,
): Promise<NextResponse<ApiResponse<T>>> {
  return handler().catch((error: unknown) => toErrorResponse(error));
}

function toErrorResponse(error: unknown): NextResponse<ApiFailure> {
  // 401 — a write endpoint reached without the shared secret.
  if (error instanceof UnauthorizedError) {
    return fail(error.message, 401);
  }

  // 400 — the request never became data (bad JSON, unusable parameter).
  if (error instanceof BadRequestError) {
    return fail(error.message, 400);
  }

  // 422 — the request was well-formed JSON but the values are wrong.
  if (error instanceof ZodError) {
    return fail("Validation failed.", 422, toFieldIssues(error));
  }

  // 400 — a rule the service enforces: too many guests, checkout before checkin.
  // These messages are written for humans and are safe to surface.
  if (error instanceof BookingError) {
    return fail(error.message, 400);
  }

  // 409 — an object already sits at that path. Checked before StorageError,
  // which it extends. Actionable by the caller, so the message passes through.
  if (error instanceof StorageConflictError) {
    return fail(error.message, 409);
  }

  // 502 — Supabase Storage is a separate service; a failure there is not ours.
  if (error instanceof StorageError) {
    console.error("[api] storage:", error.message);
    return fail("Storage is unavailable. Please try again.", 502);
  }

  // 409 — unique constraint. Surfaced as a conflict, without saying which index.
  if (isPrismaError(error) && error.code === "P2002") {
    console.error("[api] unique constraint:", error.message);
    return fail("That already exists.", 409);
  }

  // 404 — Prisma's "record not found" from a *OrThrow query.
  if (isPrismaError(error) && error.code === "P2025") {
    return fail("Not found.", 404);
  }

  // Everything else: log it in full, tell the client nothing.
  console.error("[api] unhandled:", error);
  return fail("Something went wrong.", 500);
}

/** Flatten Zod's issue list into something a form can render field by field. */
function toFieldIssues(error: ZodError): FieldIssue[] {
  return error.issues.map((issue) => ({
    field: issue.path.join(".") || "(root)",
    message: issue.message,
  }));
}

/**
 * Prisma errors carry a `code` (P2002, P2025…). Detected structurally rather
 * than with `instanceof`, because importing Prisma's error classes here would
 * pull the client into a module that is meant to know nothing about it.
 */
function isPrismaError(
  error: unknown,
): error is { code: string; message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string" &&
    (error as { code: string }).code.startsWith("P")
  );
}

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

/**
 * Validate query parameters. Throws ZodError, which `route()` turns into a 422.
 *
 * Repeated keys collapse to the last value, except where the schema expects an
 * array — `?tag=pool&tag=luxury` is the natural way to send a multi-select.
 */
export function parseQuery<T>(schema: ZodType<T>, request: Request): T {
  const params = new URL(request.url).searchParams;
  const raw: Record<string, string | string[]> = {};

  for (const key of new Set(params.keys())) {
    const values = params.getAll(key);
    raw[key] = values.length > 1 ? values : (values[0] as string);
  }

  return schema.parse(raw);
}

/**
 * Validate a JSON body.
 *
 * Malformed JSON is a 400, not a 422: the request never became data, so there
 * are no fields to complain about.
 */
export async function parseBody<T>(
  schema: ZodType<T>,
  request: Request,
): Promise<T> {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    throw new BadRequestError("Request body must be valid JSON.");
  }
  return schema.parse(json);
}

export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}

// ---------------------------------------------------------------------------
// Authorisation
// ---------------------------------------------------------------------------

/**
 * Guard the write endpoints that are not the booking flow.
 *
 * There is no auth system yet, and an unauthenticated endpoint that writes to
 * Supabase Storage is an open door: anyone who finds it can fill the buckets or
 * overwrite a hero image. Until real auth exists, a shared secret in the
 * `x-admin-key` header is the floor.
 *
 * With ADMIN_API_KEY unset, uploads work in development and are REFUSED in
 * production. Failing closed is the only safe default — an unset secret must
 * never mean "allow everyone".
 *
 * Replace this the moment Supabase Auth lands. It is a stopgap, not a design.
 */
export function requireAdmin(request: Request): void {
  const expected = env.ADMIN_API_KEY;

  if (!expected) {
    if (env.NODE_ENV === "production") {
      throw new UnauthorizedError(
        "This endpoint is disabled: ADMIN_API_KEY is not configured.",
      );
    }
    return; // development convenience only
  }

  const provided = request.headers.get("x-admin-key");
  if (!provided || !timingSafeEqual(provided, expected)) {
    throw new UnauthorizedError("Invalid or missing x-admin-key header.");
  }
}

/** Constant-time compare, so the key cannot be recovered by timing the reply. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}
