import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Netlify serves the `out` folder as plain files. No server, no ISR.
  output: "export",

  // Without this, Turbopack walks up to a stray lockfile in the home directory
  // and infers the workspace root from there.
  turbopack: { root: path.dirname(new URL(import.meta.url).pathname) },

  // `trailingSlash: false` emits `out/faq.html` rather than `out/faq/index.html`.
  // That matters for SEO here: a directory index makes the host 301 `/faq` to
  // `/faq/`, so the page's own canonical (`/faq`) would point at a redirect.
  trailingSlash: false,

  // The default image loader needs a server, which a static export has not got.
  images: { unoptimized: true },
};

export default nextConfig;
