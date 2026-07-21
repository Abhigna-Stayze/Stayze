"use client";

import { createAuthClient } from "better-auth/react";

/**
 * The browser-side BetterAuth client, used by the admin login form and the
 * logout button. Same-origin by default, so it talks to `/api/auth/*` on this
 * host — no base URL to configure. Exposes `signIn`, `signOut`, `useSession`.
 */
export const authClient = createAuthClient();

export const { signIn, signOut, useSession } = authClient;
