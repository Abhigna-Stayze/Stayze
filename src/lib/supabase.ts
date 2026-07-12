import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase clients.
 *
 * Two of them, and the distinction matters:
 *
 *   supabaseAdmin   — service-role key. Bypasses Row Level Security entirely.
 *                     SERVER ONLY. Never import into a client component.
 *   supabaseBrowser — publishable (anon) key. Safe in the browser; RLS is what
 *                     protects the data.
 *
 * Today the app reads the database through Prisma (as the `postgres` role, so
 * RLS is bypassed anyway) and only uses Supabase for Storage. These clients
 * exist so that Storage — and later Auth — have one place to come from.
 */

// NEXT_PUBLIC_* is inlined by Next.js at build time, so these must be
// referenced as full literal property accesses, not via a computed key.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be set. See CONTEXT.md.",
  );
}

// Narrowed to string by the guard above, so the lazy admin client below can
// close over them without TypeScript re-widening them to `string | undefined`.
const SUPABASE_URL: string = url;
const SUPABASE_PUBLISHABLE_KEY: string = publishableKey;

/** Public client. Safe to use in the browser. */
export const supabaseBrowser: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
);

/**
 * Privileged client — writes and deletes in Storage.
 *
 * Lazily constructed and server-guarded: the service-role key is only read
 * when this is first called, and only ever on the server. Calling it in the
 * browser throws rather than silently reaching for a key that is not there.
 */
let adminClient: SupabaseClient | undefined;

export function getSupabaseAdmin(): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error(
      "getSupabaseAdmin() was called in the browser. The service-role key bypasses RLS and must stay on the server.",
    );
  }

  if (!adminClient) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set. See CONTEXT.md.");
    }
    adminClient = createClient(SUPABASE_URL, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return adminClient;
}

/** The project URL, for building public object URLs without a client. */
export const supabaseUrl = SUPABASE_URL;
