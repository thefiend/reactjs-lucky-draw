const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BUILD = path.join(ROOT, 'build');

const read = (relativePath) =>
  fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

const PAGES = [
  { route: '/', source: 'src/pages/home/Home.js', output: 'index.html' },
  { route: '/faq', source: 'src/pages/faq/Faq.js', output: 'faq/index.html' },
  { route: '/list', source: 'src/pages/list/List.js', output: 'list/index.html' },
];

// react-helmet removes every tag carrying data-react-helmet that the mounted
// page does not declare. So a tag marked in the shell MUST be declared by all
// three pages, or that page silently loses it.
const HELMET_MANAGED = [
  { label: 'meta description', shell: /<meta\s+name="description"[\s\S]*?\/>/, source: /name="description"/ },
  { label: 'og:title', shell: /<meta property="og:title"[^>]*>/, source: /property="og:title"/ },
  { label: 'og:description', shell: /<meta\s+property="og:description"[\s\S]*?\/>/, source: /property="og:description"/ },
  { label: 'og:url', shell: /<meta property="og:url"[^>]*>/, source: /property="og:url"/ },
  { label: 'canonical', shell: /<link rel="canonical"[^>]*>/, source: /rel="canonical"/ },
];

describe('prerender wiring', () => {
  it('the build script prerenders after react-scripts', () => {
    const pkg = JSON.parse(read('package.json'));
    expect(pkg.scripts.build).toContain('npm run prerender');
    expect(pkg.scripts.prerender).toBe('node scripts/prerender.js');
  });

  it('index.js hydrates prerendered markup instead of discarding it', () => {
    const entry = read('src/index.js');
    expect(entry).toMatch(/hasChildNodes\(\)/);
    expect(entry).toMatch(/ReactDOM\.hydrate/);
  });

  it('the shell leaves #root empty so hydration matches', () => {
    expect(read('public/index.html')).toMatch(/<div id="root"><\/div>/);
  });

  HELMET_MANAGED.forEach(({ label, shell, source }) => {
    it(`every page declares ${label}, which the shell marks helmet-managed`, () => {
      const shellTag = read('public/index.html').match(shell);
      expect(shellTag).not.toBeNull();
      expect(shellTag[0]).toMatch(/data-react-helmet="true"/);

      PAGES.forEach(({ source: file }) => expect(read(file)).toMatch(source));
    });
  });

  it('no page re-declares charset in Helmet, where it lands too late to count', () => {
    PAGES.forEach(({ source }) => expect(read(source)).not.toMatch(/charSet=/));
  });
});

// Only meaningful after `npm run build`; skipped in a bare checkout and in the
// unit-test-only CI job.
const describeBuild = fs.existsSync(BUILD) ? describe : describe.skip;

describeBuild('prerendered output', () => {
  const outputs = {};

  beforeAll(() => {
    PAGES.forEach(({ output }) => {
      const file = path.join(BUILD, output);
      outputs[output] = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
    });
  });

  const bodyWords = (html) =>
    html
      .replace(/<head[\s\S]*?<\/head>/i, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .split(/\s+/)
      .filter(Boolean).length;

  const occurrences = (html, pattern) => (html.match(pattern) || []).length;

  PAGES.forEach(({ route, output }) => {
    describe(route, () => {
      it('has a static HTML file of its own', () => {
        expect(outputs[output]).not.toBeNull();
      });

      // The whole point: a JS-less crawler saw 28 words of shell before this.
      it('carries real body copy, not the empty shell', () => {
        expect(bodyWords(outputs[output])).toBeGreaterThan(300);
      });

      it('has exactly one of each head tag that identifies the page', () => {
        const html = outputs[output];
        expect(occurrences(html, /<title[^>]*>/g)).toBe(1);
        expect(occurrences(html, /<meta name="description"/g)).toBe(1);
        expect(occurrences(html, /<meta property="og:title"/g)).toBe(1);
        expect(occurrences(html, /<meta property="og:description"/g)).toBe(1);
        expect(occurrences(html, /<meta property="og:url"/g)).toBe(1);
        expect(occurrences(html, /rel="canonical"/g)).toBe(1);
        expect(occurrences(html, /<meta charset/gi)).toBe(1);
        expect(occurrences(html, /<h1[\s>]/g)).toBe(1);
      });

      it('canonicalises to its own URL', () => {
        const canonical = outputs[output].match(/<link rel="canonical"[^>]*>/)[0];
        const expected = route === '/' ? 'https://www.luckydraw.me' : `https://www.luckydraw.me${route}`;
        expect(canonical).toContain(`href="${expected}"`);
      });
    });
  });

  it('gives each route a distinct title, description and H1', () => {
    const fields = (html) => ({
      title: html.match(/<title[^>]*>([\s\S]*?)<\/title>/)[1],
      description: html.match(/<meta name="description"[^>]*content="([^"]*)"/)[1],
      h1: html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1],
    });

    ['title', 'description', 'h1'].forEach((field) => {
      const values = PAGES.map(({ output }) => fields(outputs[output])[field]);
      expect(new Set(values).size).toBe(PAGES.length);
    });
  });
});
