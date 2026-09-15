import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { existsSync, readFileSync, readdirSync } from "node:fs";

const root = fileURLToPath(new URL("./", import.meta.url));
const at = (path) => fileURLToPath(new URL(path, import.meta.url));

/**
 * Mirrors Vercel's `cleanUrls` locally so `/ux-audit` and `/work/meetaira`
 * resolve the same way in `vite dev`, `vite preview` and production. Without
 * it, MPA mode 404s the extensionless path and SPA mode silently serves the
 * homepage instead — both of which hide real routing problems until deploy.
 */
function cleanUrls() {
  const rewrite = (req, _res, next) => {
    const [path, query] = (req.url || "").split("?");
    // Only rewrite when the path names a real page directory. A blanket
    // "no dot means add a slash" rule would also mangle Vite's own
    // internals (/@vite/client, /@id/..., /@fs/...).
    if (path && path !== "/" && !path.endsWith("/") && !path.startsWith("/@")) {
      if (existsSync(`${root}${path.slice(1)}/index.html`)) {
        req.url = `${path}/${query ? `?${query}` : ""}`;
      }
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
 * `<!-- @include /partials/site-header.html -->` inlines a shared fragment.
 * The eight case study pages share one header and one footer this way rather
 * than carrying eight copies of the nav. Runs `pre`, so included markup goes
 * through Vite's normal HTML processing in dev and build alike.
 */
function htmlIncludes() {
  const INCLUDE = /<!--\s*@include\s+([\w./-]+)\s*-->/g;
  return {
    name: "html-includes",
    transformIndexHtml: {
      order: "pre",
      handler: (html) =>
        html.replace(INCLUDE, (_, file) => readFileSync(`${root}${file.replace(/^\//, "")}`, "utf8")),
    },
    configureServer(server) {
      // partials aren't in the module graph, so reload the page when one changes
      server.watcher.add(`${root}partials`);
      server.watcher.on("change", (file) => {
        if (file.includes("/partials/")) server.ws.send({ type: "full-reload" });
      });
    },
  };
}

/** Every case study is a real page at /work/<slug>/index.html. */
const casePages = Object.fromEntries(
  readdirSync(at("./work"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && existsSync(at(`./work/${entry.name}/index.html`)))
    .map((entry) => [`work-${entry.name}`, at(`./work/${entry.name}/index.html`)])
);

export default defineConfig({
  // real pages, not an SPA — this stops the dev server falling back to
  // index.html and serving the homepage for an unmatched path
  appType: "mpa",
  plugins: [cleanUrls(), htmlIncludes()],
  build: {
    rollupOptions: {
      input: {
        main: at("./index.html"),
        uxAudit: at("./ux-audit/index.html"),
        ...casePages,
      },
    },
  },
});


