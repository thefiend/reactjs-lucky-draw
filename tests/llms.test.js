import fs from "node:fs";
import path from "node:path";

import robots from "../app/robots";
import sitemap from "../app/sitemap";
import { ROUTES, SITE_URL } from "../lib/site";

const ROOT = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(ROOT, relative), "utf8");
const llms = () => read("public/llms.txt");
const links = () => [...llms().matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map((m) => m[1]);

// Not files in public/: Next generates these from app/sitemap.js and
// app/robots.js into the export.
const GENERATED = ["/sitemap.xml", "/robots.txt"];

describe("llms.txt follows the llmstxt.org structure", () => {
  it("opens with a single H1 naming the site", () => {
    const lines = llms().split("\n");
    expect(lines[0]).toBe("# LuckyDraw.me");
    expect(lines.filter((line) => /^# /.test(line))).toHaveLength(1);
  });

  it("follows the H1 with a blockquote summary", () => {
    const lines = llms().split("\n");
    expect(lines[1]).toBe("");
    expect(lines[2]).toMatch(/^> \S/);
  });

  it("uses H2 for every section", () => {
    const headings = llms().match(/^#{2,}\s.*/gm) || [];
    expect(headings.length).toBeGreaterThan(0);
    headings.forEach((heading) => expect(heading).toMatch(/^## /));
  });
});

describe("llms.txt links resolve", () => {
  it("uses absolute URLs only, so a crawler needs no base", () => {
    expect(links().length).toBeGreaterThan(0);
    links().forEach((link) => expect(link).toMatch(/^https:\/\//));
  });

  // The apex host 301s to www, so an apex link here hands assistants a URL that
  // redirects — the same defect as an apex canonical.
  it("stays on the canonical host for its own pages", () => {
    links()
      .filter((link) => new URL(link).hostname.endsWith("luckydraw.me"))
      .forEach((link) => expect(link.startsWith(SITE_URL)).toBe(true));
  });

  it("points every on-site link at a real route or published file", () => {
    const paths = ROUTES.map((route) => route.path);
    const onSite = links().filter((link) => link.startsWith(SITE_URL));
    expect(onSite.length).toBeGreaterThan(0);

    onSite.forEach((link) => {
      const { pathname } = new URL(link);
      if (paths.includes(pathname) || GENERATED.includes(pathname)) return;
      expect(fs.existsSync(path.join(ROOT, "public", pathname))).toBe(true);
    });
  });

  it("covers every route the sitemap advertises", () => {
    const linked = links()
      .filter((link) => link.startsWith(SITE_URL))
      .map((link) => new URL(link).pathname);

    sitemap().forEach((entry) => expect(linked).toContain(new URL(entry.url).pathname));
  });

  // Every deep link in the FAQ section has to land on an element that exists,
  // or an assistant quotes a URL that scrolls nowhere.
  it("only deep-links to anchors the pages actually render", () => {
    const pages = {
      "/": read("app/page.jsx"),
      "/faq": read("app/faq/page.jsx") + read("components/FaqList.jsx") + read("lib/faq.js"),
      "/list": read("app/list/page.jsx"),
    };

    links()
      .filter((link) => link.startsWith(SITE_URL) && link.includes("#"))
      .forEach((link) => {
        const { pathname, hash } = new URL(link);
        const id = hash.slice(1);
        expect(pages[pathname]).toContain(id);
      });
  });
});

describe("llms.txt is reachable", () => {
  it("is not blocked by robots", () => {
    robots().rules.forEach((rule) => {
      expect(rule.allow).toBe("/");
      expect(rule.disallow).toBeUndefined();
    });
  });

  // public/ is copied into the export verbatim; only meaningful after a build.
  const afterBuild = fs.existsSync(path.join(ROOT, "out")) ? it : it.skip;
  afterBuild("is published to out/", () => {
    expect(read("out/llms.txt")).toBe(llms());
  });
});

describe("llms.txt claims match the implementation", () => {
  const draw = read("lib/draw.js");

  // llms.txt feeds AI answers directly, so a claim here that the code does not
  // back is a wrong answer repeated at scale. The old copy described
  // Math.random() long after the engine moved to a seeded SHA-256 keystream.
  it("names the randomness source the draw really uses", () => {
    expect(draw).toMatch(/crypto\.getRandomValues/);
    expect(draw).not.toMatch(/Math\.random\(\)/);

    expect(llms()).toMatch(/crypto\.getRandomValues/);
    expect(llms()).not.toMatch(/Math\.random\(\)/);
  });

  it("describes the shuffle the draw really runs", () => {
    expect(draw).toMatch(/SHA-256/);
    expect(llms()).toMatch(/SHA-256/);
    expect(llms()).toMatch(/rejection sampling/);
    expect(llms()).toMatch(/Fisher-Yates/);
  });

  it("does not claim entries are stored server-side", () => {
    expect(llms()).toMatch(/never sent to a server/);
  });

  it("says what the tool is not, so it is not cited as a lottery system", () => {
    expect(llms()).toMatch(/[Nn]ot a regulated lottery tool/);
  });
});
