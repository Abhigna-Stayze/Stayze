/**
 * Copies the Swagger UI assets out of node_modules and into public/swagger/,
 * so /api/docs serves them from this origin rather than a CDN.
 *
 * Why not just link to a CDN? Because then the docs page does not render
 * offline, and it makes the API reference depend on a third party staying up.
 *
 * Why not commit the files? They are 1.7 MB of vendored, generated output that
 * changes whenever swagger-ui-dist is upgraded. Same argument as the Prisma
 * client: generate it, do not track it.
 *
 * Runs from `postinstall`, so the assets exist after every `npm install` —
 * including on Vercel, where the build runs install first.
 */
import { copyFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const source = dirname(require.resolve("swagger-ui-dist/swagger-ui.css"));
const target = join(process.cwd(), "public", "swagger");

// Only what the page actually loads. The .map files are another 2.4 MB and
// nobody is debugging Swagger UI itself.
const ASSETS = ["swagger-ui.css", "swagger-ui-bundle.js"];

await mkdir(target, { recursive: true });

for (const asset of ASSETS) {
  await copyFile(join(source, asset), join(target, asset));
}

console.log(`swagger-ui: copied ${ASSETS.length} assets to public/swagger/`);
