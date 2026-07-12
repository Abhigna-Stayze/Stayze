import "server-only";
import { z } from "zod";

// Server-side environment. Validated once, at import: a missing or malformed
// value fails here with a readable message rather than deep inside a query or
// an upload.
//
// This module is server-only on purpose. It reads SUPABASE_SERVICE_ROLE_KEY,
// which bypasses Row Level Security and must never reach the browser. The
// "server-only" import turns an accidental client import into a build error
// rather than a leaked credential.
//
// Values the browser legitimately needs (the project URL, the publishable key)
// carry the NEXT_PUBLIC_ prefix and are also read directly from process.env in
// supabase.ts, because Next.js inlines those at build time.
const schema = z.object({
  // Pooled connection (PgBouncer, port 6543). Used at runtime.
  DATABASE_URL: z.url().startsWith("postgres"),
  // Direct, unpooled connection (port 5432). Migrations and the seed only.
  DIRECT_URL: z.url().startsWith("postgres"),

  // Supabase project URL. Public by design.
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  // Anon/publishable key. Public by design — RLS is what protects the data.
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  // SECRET. Bypasses RLS entirely. Server-side writes and uploads only.
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Shared secret for the write endpoints (POST /api/upload). Optional, and
  // deliberately so: unset, uploads work in development and are REFUSED in
  // production, rather than silently exposing an open door to the buckets.
  // Set it before deploying. This is a stopgap until real auth exists.
  ADMIN_API_KEY: z.string().min(16).optional(),

  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  throw new Error(
    `Invalid environment variables:\n${issues}\n\nSee the Environment section of CONTEXT.md.`,
  );
}

export const env = parsed.data;
