import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

/**
 * Mirrors Vercel's `cleanUrls` locally so `/ux-audit` resolves the same way
 * in `vite dev`, `vite preview` and production. Without it, MPA mode 404s on
 * the extensionless path and SPA mode silently serves the homepage instead —
 * both of which hide real routing problems until after deploy.
 */
function cleanUrls() {
  const root = new URL("./", import.meta.url);

  const rewrite = (req, _res, next) => {
    const [path, query] = (req.url || "").split("?");
    // Only rewrite when the path names a real page directory. A blanket
    // "no dot means add a slash" rule would also mangle Vite's own
    // internals (/@vite/client, /@id/..., /@fs/...).
    if (path && path !== "/" && !path.endsWith("/") && !path.startsWith("/@")) {
      const page = new URL(`.${path}/index.html`, root);
      if (existsSync(page)) req.url = `${path}/${query ? `?${query}` : ""}`;
    }
    next();
  };
  // block bodies matter: returning the connect app would make Vite treat it
  // as a post-hook and invoke it with no request
  return {
    name: "clean-urls",
    configureServer(server) { server.middlewares.use(rewrite); },
    configurePreviewServer(server) { server.middlewares.use(rewrite); },
  };
}

/**
 * Two static entries. `ux-audit/index.html` builds to `dist/ux-audit/index.html`,
 * which Vercel serves at `/ux-audit` — so a direct visit or a browser refresh
 * on that URL resolves to a real file, with no server involved.
 */
export default defineConfig({
  // two real pages, not an SPA — this stops the dev server falling back to
  // index.html and serving the homepage for an unmatched path
  appType: "mpa",
  plugins: [cleanUrls()],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        uxAudit: fileURLToPath(new URL("./ux-audit/index.html", import.meta.url)),
      },
    },
  },
});
