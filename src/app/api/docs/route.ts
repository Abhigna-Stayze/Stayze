import { ApiReference } from "@scalar/nextjs-api-reference";

/**
 * GET /api/docs
 *
 * Interactive API reference, rendered by Scalar over /api/openapi.json.
 *
 * There is nothing to keep in step by hand: the spec is generated from the Zod
 * schemas, and this page just renders it.
 */
export const GET = ApiReference({
  url: "/api/openapi.json",
  pageTitle: "Stayze API",
  theme: "default",
});
