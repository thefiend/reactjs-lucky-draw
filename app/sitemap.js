import { ROUTES, url } from "../lib/site";

// Static export writes this to out/sitemap.xml at build time. sitemap.js is a
// Route Handler underneath, and `output: "export"` requires the static marker.
export const dynamic = "force-static";

export default function sitemap() {
  const lastModified = new Date().toISOString().slice(0, 10);

  return ROUTES.map((route) => ({
    url: url(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
