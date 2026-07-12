/**
 * GET /api/docs
 *
 * Swagger UI, rendered over /api/openapi.json.
 *
 * The assets are served from this origin (public/swagger/, populated by
 * scripts/copy-swagger.mjs at postinstall), not from a CDN — so the reference
 * renders offline and does not depend on a third party staying up.
 *
 * There is nothing to maintain here. The spec is generated from the Zod schemas
 * in src/lib/openapi.ts; this page only renders it.
 */
const HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Stayze API</title>
    <link rel="stylesheet" href="/swagger/swagger-ui.css" />
    <link rel="icon" href="/brand/stayze-favicon-32.svg" />
    <style>
      body { margin: 0; background: #fafafa; }
      /* Swagger's own banner is noise when the page IS the reference. */
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin: 32px 0; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="/swagger/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: "/api/openapi.json",
        dom_id: "#swagger-ui",
        deepLinking: true,
        // Group by the tags in the spec, collapsed, so the whole API is
        // visible at a glance rather than a wall of expanded operations.
        docExpansion: "list",
        defaultModelsExpandDepth: 1,
        tryItOutEnabled: true,
        persistAuthorization: true,
        presets: [SwaggerUIBundle.presets.apis],
      });
    </script>
  </body>
</html>
`;

export async function GET() {
  return new Response(HTML, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}
