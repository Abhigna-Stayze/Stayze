import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

/**
 * BetterAuth's HTTP surface — sign-in, sign-out, session, etc. — mounted at
 * `/api/auth/*`. The client SDK (`src/lib/auth-client.ts`) and the server guard
 * both talk to this one handler. Sign-up is disabled in the auth config, so the
 * `/sign-up` sub-route rejects requests even though the handler is public.
 */
export const { GET, POST } = toNextJsHandler(auth);
