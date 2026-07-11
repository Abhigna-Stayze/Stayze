import { z } from "zod";

// Validated once, at import. A missing or malformed connection string fails
// here with a readable message rather than deep inside a query.
const schema = z.object({
  // Pooled connection (PgBouncer, port 6543). Used at runtime.
  DATABASE_URL: z.url().startsWith("postgres"),
  // Direct, unpooled connection (port 5432). Migrations only.
  DIRECT_URL: z.url().startsWith("postgres"),
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
    `Invalid environment variables:\n${issues}\n\nCopy .env.example to .env and fill it in.`,
  );
}

export const env = parsed.data;
