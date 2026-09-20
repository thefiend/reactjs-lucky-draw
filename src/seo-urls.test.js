const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CANONICAL_HOST = 'https://www.luckydraw.me';

// The live site serves www.luckydraw.me with 200 and 301-redirects the apex
// domain to it. Any self-referencing https://luckydraw.me URL therefore points
// at a redirect, which Google/Ahrefs flag as "canonical points to redirect".
const APEX_URL = /https:\/\/luckydraw\.me/;

const read = (relativePath) =>
  fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

const FILES_WITH_SITE_URLS = [
  'public/index.html',
  'public/robots.txt',
  'public/sitemap.xml',
  'src/constants.js',
  'src/pages/Json-ld.js',
  'src/pages/home/Home.js',
  'src/pages/faq/Faq.js',
  'src/pages/list/List.js',
  'src/components/FaqSection/index.jsx',
];

describe('site URLs use the canonical www host', () => {
  FILES_WITH_SITE_URLS.forEach((file) => {
    it(`${file} has no apex-domain URLs`, () => {
      expect(read(file)).not.toMatch(APEX_URL);
    });
  });

  it('public/index.html canonical is the www home page', () => {
    expect(read('public/index.html')).toMatch(
      new RegExp(`<link rel="canonical"[^>]*href="${CANONICAL_HOST}"`)
    );
  });

  it('public/index.html tags are claimable by react-helmet', () => {
    const html = read('public/index.html');
    const canonical = html.match(/<link rel="canonical"[^>]*>/)[0];
    expect(canonical).toMatch(/data-react-helmet="true"/);
    expect(html).toMatch(
      /<meta property="og:url" data-react-helmet="true" content="[^"]*" \/>/
    );
  });

  it('robots.txt points at the www sitemap', () => {
    expect(read('public/robots.txt')).toContain(
      `Sitemap: ${CANONICAL_HOST}/sitemap.xml`
    );
  });

  it('sitemap.xml lists only www locations', () => {
    const locs = [...read('public/sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (m) => m[1]
    );
    expect(locs.length).toBeGreaterThan(0);
    locs.forEach((loc) => expect(loc.startsWith(`${CANONICAL_HOST}/`)).toBe(true));
  });

  it('netlify.toml has no www-to-apex redirect fighting the canonical host', () => {
    expect(read('netlify.toml')).not.toMatch(APEX_URL);
  });

  it('prerender writes flat .html files, not directory indexes', () => {
    // `build/faq/index.html` makes Netlify 301 `/faq` -> `/faq/`, so the
    // canonical `/faq` would point at a redirect. `build/faq.html` answers 200.
    const routes = read('scripts/prerender.js').match(/const ROUTES = \{[^}]+\}/)[0];
    ['faq', 'list'].forEach((route) => {
      expect(routes).toContain(`"/${route}": "${route}.html"`);
    });
    expect(routes).not.toMatch(/path\.join/);
  });
});
