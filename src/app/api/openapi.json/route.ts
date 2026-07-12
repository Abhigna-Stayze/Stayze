import { NextResponse } from "next/server";
import { buildOpenApiDocument } from "@/lib/openapi";

/**
 * GET /api/openapi.json
 *
 * The machine-readable contract. Generated from the same Zod schemas the API
 * validates with, so it cannot drift from the implementation.
 *
 * Point anything at this: Swagger UI (at /api/docs), Postman, an SDK generator,
 * or a mobile client's codegen step.
 */
export async function GET() {
  return NextResponse.json(buildOpenApiDocument(), {
    headers: {
      // The spec only changes when the code does.
      "cache-control": "public, max-age=300",
    },
  });
}
