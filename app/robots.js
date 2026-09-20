import { url } from "../lib/site";

// robots.js compiles to a Route Handler, and `output: "export"` refuses to
// prerender one unless it is marked static.
export const dynamic = "force-static";

export default function robots() {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      // Assistants that cite sources are welcome to read the whole site; the
      // fairness method is the thing we want quoted.
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
    ],
    sitemap: url("/sitemap.xml"),
    host: url("/"),
  };
}
