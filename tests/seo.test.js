import fs from "node:fs";
import path from "node:path";

import robots from "../app/robots";
import sitemap from "../app/sitemap";
import { metadata as faqMeta } from "../app/faq/page";
import { metadata as homeMeta } from "../app/page";
import { metadata as listMeta } from "../app/list/page";
import { metadata as verifyMeta } from "../app/verify/page";
import { FAQS } from "../lib/faq";
import { faqSchema, softwareApplicationSchema, verifyHowToSchema } from "../lib/schema";
import { ROUTES, SITE_URL } from "../lib/site";

const ROOT = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), "utf8");

// Comments explain why a value is absent and so mention the very strings these
// guards forbid. Only what ships to the page is in scope.
const readCode = (relative) =>
  read(relative)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|\s)\/\/.*$/gm, "$1");

// The live site answers www with 200 and 301s the apex domain to it, so any
// self-referencing https://luckydraw.me URL is a canonical pointing at a
// redirect — the exact defect Ahrefs flagged.
const APEX_URL = /https:\/\/luckydraw\.me/;

const FILES_WITH_SITE_URLS = [
  "lib/site.js",
  "lib/schema.js",
  "lib/faq.js",
  "app/layout.jsx",
  "app/page.jsx",
  "app/faq/page.jsx",
  "app/list/page.jsx",
  "app/verify/page.jsx",
  "components/DrawMachine.jsx",
  "components/Verifier.jsx",
  "lib/certificate.js",
  "netlify.toml",
  "public/llms.txt",
];

describe("canonical host", () => {
  it("is the www host", () => {
    expect(SITE_URL).toBe("https://www.luckydraw.me");
  });

  FILES_WITH_SITE_URLS.forEach((file) => {
    it(`${file} has no apex-domain URLs`, () => {
      expect(read(file)).not.toMatch(APEX_URL);
    });
  });
});

describe("canonicals", () => {
  const pages = [
    ["/", homeMeta],
    ["/verify", verifyMeta],
    ["/faq", faqMeta],
    ["/list", listMeta],
  ];

  pages.forEach(([route, meta]) => {
    it(`${route} declares itself canonical`, () => {
      expect(meta.alternates.canonical).toBe(route);
    });

    it(`${route} has a title and a description`, () => {
      expect(typeof meta.title).toBe("string");
      expect(meta.description.length).toBeGreaterThan(70);
      expect(meta.description.length).toBeLessThanOrEqual(165);
    });
  });

  it("every sitemap route has a page that claims it", () => {
    const declared = pages.map(([route]) => route);
    ROUTES.forEach((route) => expect(declared).toContain(route.path));
  });
});

describe("static export shape", () => {
  const config = read("next.config.mjs");

  it("exports static files", () => {
    expect(config).toMatch(/output:\s*"export"/);
  });

  // `trailingSlash: true` would emit out/faq/index.html, and a directory index
  // makes the host 301 /faq to /faq/ — so /faq's own canonical would point at a
  // redirect. Flat faq.html answers /faq with 200.
  it("emits flat route files rather than directory indexes", () => {
    expect(config).toMatch(/trailingSlash:\s*false/);
  });

  // Only meaningful once a build has run; the config assertions above are the
  // ones that hold on a clean checkout.
  const afterBuild = fs.existsSync(path.join(ROOT, "out")) ? describe : describe.skip;

  afterBuild("the built export", () => {
    it("writes one flat file per route, plus the metadata files", () => {
      [
        "index.html",
        "verify.html",
        "faq.html",
        "list.html",
        "404.html",
        "sitemap.xml",
        "robots.txt",
      ].forEach((file) => expect(fs.existsSync(path.join(ROOT, "out", file))).toBe(true));
    });

    // A directory index next to faq.html is what makes a host 301 /faq to /faq/.
    it("leaves no directory index that would redirect a canonical URL", () => {
      ["verify", "faq", "list"].forEach((route) =>
        expect(fs.existsSync(path.join(ROOT, "out", route, "index.html"))).toBe(false)
      );
    });

    it("declares each page its own canonical in the shipped HTML", () => {
      [
        ["index.html", SITE_URL],
        ["verify.html", `${SITE_URL}/verify`],
        ["faq.html", `${SITE_URL}/faq`],
        ["list.html", `${SITE_URL}/list`],
      ].forEach(([file, canonical]) => {
        expect(read(path.join("out", file))).toContain(
          `<link rel="canonical" href="${canonical}"`
        );
      });
    });
  });

  it("is deployed from the export directory with no SPA catch-all", () => {
    const netlify = read("netlify.toml");
    expect(netlify).toMatch(/publish\s*=\s*"out"/);
    expect(netlify).toMatch(/command\s*=\s*"npm ci && npm run build"/);
    // A /* -> /index.html 200 rule turns every unknown URL into a soft 404.
    expect(netlify).not.toMatch(/to\s*=\s*"\/index\.html"/);
  });
});

describe("sitemap", () => {
  const entries = sitemap();

  it("lists every route on the canonical host", () => {
    expect(entries).toHaveLength(ROUTES.length);
    entries.forEach((entry) => expect(entry.url.startsWith(SITE_URL)).toBe(true));
  });

  it("uses no trailing slashes, matching the emitted files", () => {
    entries.forEach((entry) => expect(entry.url).not.toMatch(/.\/$/));
  });

  it("puts the tool first", () => {
    expect(entries[0].url).toBe(SITE_URL);
    expect(entries[0].priority).toBe(1);
  });
});

describe("robots", () => {
  const rules = robots();

  it("points at the canonical sitemap", () => {
    expect(rules.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
  });

  it("lets the assistants that cite sources crawl", () => {
    const agents = rules.rules.map((rule) => rule.userAgent);
    ["GPTBot", "PerplexityBot", "ClaudeBot"].forEach((agent) =>
      expect(agents).toContain(agent)
    );
  });
});

describe("structured data", () => {
  it("marks up exactly the questions the page shows", () => {
    const marked = faqSchema().mainEntity.map((entity) => ({
      question: entity.name,
      answer: entity.acceptedAnswer.text,
    }));
    expect(marked).toEqual(FAQS.map(({ question, answer }) => ({ question, answer })));
  });

  it("describes verification as numbered steps on the canonical host", () => {
    const howTo = verifyHowToSchema();

    expect(howTo["@type"]).toBe("HowTo");
    expect(howTo.step.map((step) => step.position)).toEqual([1, 2, 3, 4]);
    howTo.step.forEach((step) => {
      expect(step["@type"]).toBe("HowToStep");
      expect(step.url.startsWith(SITE_URL)).toBe(true);
      expect(step.text.length).toBeGreaterThan(40);
    });
  });

  // The old markup claimed 5/5 from 689,840 ratings with no review system behind
  // it. Ratings we cannot evidence are a manual-action risk, so they stay out.
  it("claims no rating it cannot evidence", () => {
    expect(softwareApplicationSchema()).not.toHaveProperty("aggregateRating");
    ["lib/schema.js", "lib/faq.js", "app/page.jsx", "app/list/page.jsx"].forEach(
      (file) => {
        expect(readCode(file)).not.toMatch(/aggregateRating|689,?840/);
      }
    );
  });
});
