/**
 * Post-build prerenderer.
 *
 * The app is a client-rendered SPA, so Netlify's `/* -> /index.html 200` rule
 * hands every URL the same empty shell. Crawlers that don't execute JS see ~28
 * words, one title, one meta description and one canonical (the homepage's) for
 * `/`, `/faq` and `/list` alike — which reads as thin, duplicated, non-indexable
 * content.
 *
 * This script visits each route in a headless browser and writes the fully
 * rendered DOM back to disk as a real static file per route. Netlify serves
 * those files before it consults the SPA fallback, so crawlers get the actual
 * content and react-helmet's per-route head.
 *
 * Every request is answered from the `build/` directory through request
 * interception — no local server, no network. Third-party requests are aborted
 * while rendering: analytics, Facebook, AddThis and Media.net all mutate the DOM
 * and anything they injected would be baked into the written HTML. Their
 * `<script src>` tags survive in the output, so real visitors still load them.
 */

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const BUILD_DIR = path.resolve(__dirname, "..", "build");

// Any http origin works; it is never resolved, only matched during interception.
// A real origin (rather than file://) keeps absolute asset paths and the History
// API behaving the way they do in production.
const ORIGIN = "http://prerender.luckydraw.local";

// Route -> path of the HTML file to write, relative to BUILD_DIR.
const ROUTES = {
  "/": "index.html",
  "/faq": path.join("faq", "index.html"),
  "/list": path.join("list", "index.html"),
};

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".map": "application/json; charset=utf-8",
};

/** Resolve a request path to a file in build/, mirroring Netlify's SPA fallback. */
function resolveFromBuild(urlPath) {
  const candidate = path.join(BUILD_DIR, decodeURIComponent(urlPath));

  if (
    candidate.startsWith(BUILD_DIR) &&
    fs.existsSync(candidate) &&
    fs.statSync(candidate).isFile()
  ) {
    return candidate;
  }
  return path.join(BUILD_DIR, "index.html");
}

async function renderRoute(browser, route) {
  const page = await browser.newPage();

  await page.setRequestInterception(true);
  page.on("request", (request) => {
    const url = request.url();
    if (!url.startsWith(ORIGIN)) {
      request.abort();
      return;
    }

    const file = resolveFromBuild(new URL(url).pathname);
    request.respond({
      status: 200,
      contentType: MIME_TYPES[path.extname(file)] || "application/octet-stream",
      body: fs.readFileSync(file),
    });
  });

  await page.goto(`${ORIGIN}${route}`, { waitUntil: "networkidle0", timeout: 60000 });

  // React has mounted once #root holds markup; helmet writes the head in the
  // same commit, so this is enough to capture both.
  await page.waitForFunction(
    () => document.getElementById("root").children.length > 0,
    { timeout: 30000 }
  );

  const html = await page.evaluate(() => {
    // Drop the fallback notice: with prerendered markup present it is the only
    // body text a no-JS crawler would otherwise weigh against real content.
    document.querySelector("noscript")?.remove();
    return `<!DOCTYPE html>\n${document.documentElement.outerHTML}`;
  });

  await page.close();
  return html;
}

/** Rough body-text word count, matching what an SEO crawler reports. */
function countWords(html) {
  return html
    .replace(/<head[\s\S]*?<\/head>/i, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

async function main() {
  if (!fs.existsSync(path.join(BUILD_DIR, "index.html"))) {
    throw new Error(`No build found at ${BUILD_DIR} — run \`react-scripts build\` first.`);
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    for (const [route, output] of Object.entries(ROUTES)) {
      const html = await renderRoute(browser, route);
      const target = path.join(BUILD_DIR, output);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, html);
      console.log(`prerendered ${route} -> build/${output} (${countWords(html)} words)`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
