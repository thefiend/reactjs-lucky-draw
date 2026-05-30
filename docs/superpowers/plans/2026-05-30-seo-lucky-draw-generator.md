# SEO — Rank #1 for "lucky draw online generator" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Optimize luckydraw.me homepage to rank #1 on Google for "lucky draw online generator" by injecting the target keyword into every ranking signal and fixing all schema issues.

**Architecture:** Pure content/markup changes across 6 files — no new components, no logic changes. Json-ld.js is a near-complete rewrite (remove 2 schemas, fix 4, add 2). FaqSection is expanded in place. All other files get targeted string replacements.

**Tech Stack:** React (class components), react-helmet (meta tags), JSON-LD structured data, @testing-library/react

---

## File Map

| File | Action | What changes |
|------|--------|-------------|
| `public/index.html` | Modify | title, meta description, keywords, og:title, og:description, twitter:title, twitter:description |
| `public/sitemap.xml` | Modify | all 3 `<lastmod>` dates |
| `src/pages/Json-ld.js` | Rewrite | remove REVIEW + SOFTWARE_APP; fix WEB_APPLICATION→SOFTWARE_APPLICATION; fix FAQ HTML; add HOW_TO + WEBSITE |
| `src/pages/Json-ld.test.js` | Create | validates all 6 schemas parse + have required fields |
| `src/pages/home/Home.js` | Modify | import line, Helmet scripts, H1, H2, hero paragraph, how-to H2, about H2, about body |
| `src/pages/home/Home.test.js` | Modify | update hero text assertion (line 35) |
| `src/pages/faq/Faq.js` | Modify | remove REVIEW from import (export no longer exists) |
| `src/components/FaqSection/index.jsx` | Rewrite | h1→h2, expand all 10 answers to 2-4 sentences, add 2 new FAQ cards |
| `src/components/FaqSection/FaqSection.test.jsx` | Create | verifies h2 heading + 12 card titles render |

---

## Task 1: Static file updates — `index.html` and `sitemap.xml`

**Files:**
- Modify: `public/index.html`
- Modify: `public/sitemap.xml`

No unit tests for static HTML/XML files. Verify with grep after editing.

- [ ] **Step 1: Update `public/index.html` title and meta description**

Replace:
```html
<title>Lucky Draw Online | Free Random Picker & Name Selector Tool</title>
```
With:
```html
<title>Lucky Draw Online Generator | Free Random Winner Picker</title>
```

Replace the `<meta name="description">` block (lines 5-8):
```html
<meta
  name="description"
  content="Free lucky draw online tool & random picker for instant winner selection. Best random name picker, raffle generator, and contest draw tool. Fast, fair & transparent lucky draw simulator for events, giveaways & competitions worldwide."
/>
```
With:
```html
<meta
  name="description"
  content="Use our free lucky draw online generator to pick random winners instantly. Best random name picker, raffle generator &amp; contest draw tool. Fair, fast &amp; transparent — no registration needed."
/>
```

- [ ] **Step 2: Update `public/index.html` keywords meta**

Replace the `meta[name=keywords]` content value — prepend the two new terms at the start:

Old content value starts with: `"lucky draw,random picker,..."`

New content value (full replacement):
```html
<meta name="keywords" content="lucky draw online generator,lucky draw generator,lucky draw,random picker,lucky draw online,random name picker,lucky draw simulator,random draw,raffle generator,random winner picker,lucky draw tool,online lucky draw,random selector,name picker wheel,winner picker,random raffle,contest picker,giveaway picker,free lucky draw,random chooser,lucky draw generator,online raffle,lucky draw app,random picker wheel,name randomizer,lucky draw website,free random picker" />
```

- [ ] **Step 3: Update `public/index.html` OG and Twitter tags**

Replace `og:title`:
```html
<meta property="og:title" content="Lucky Draw Online Generator — Free Random Winner Picker" />
```

Replace `og:description`:
```html
<meta
  property="og:description"
  content="Use our free lucky draw online generator to instantly select random winners for raffles, giveaways, contests &amp; events. Trusted by thousands worldwide. Fair, transparent &amp; easy to use!"
/>
```

Replace `twitter:title`:
```html
<meta name="twitter:title" content="Lucky Draw Online Generator — Free Random Winner Picker" />
```

Replace `twitter:description`:
```html
<meta name="twitter:description" content="Use our free lucky draw online generator to instantly select random winners. Fair, fast &amp; transparent — no registration needed!" />
```

- [ ] **Step 4: Update `public/sitemap.xml` lastmod dates**

Replace all three occurrences of `<lastmod>2025-10-24T07:09:33+00:00</lastmod>` with:
```xml
<lastmod>2026-05-30T00:00:00+00:00</lastmod>
```

(There are 3 URLs in the sitemap — all get the same date.)

- [ ] **Step 5: Verify changes with grep**

```bash
grep -n "generator\|lastmod" public/index.html public/sitemap.xml
```

Expected output includes:
- `index.html`: lines with "generator" in title, description, og:title, twitter:title
- `sitemap.xml`: three lines showing `2026-05-30`

- [ ] **Step 6: Commit**

```bash
git add public/index.html public/sitemap.xml
git commit -m "seo: update index.html title/meta and sitemap for lucky draw online generator"
```

---

## Task 2: Overhaul `src/pages/Json-ld.js` (TDD)

**Files:**
- Create: `src/pages/Json-ld.test.js`
- Modify: `src/pages/Json-ld.js`

- [ ] **Step 1: Create failing test file `src/pages/Json-ld.test.js`**

```js
import {
  FAQ,
  SOFTWARE_APPLICATION,
  ORGANIZATION,
  BREADCRUMB_HOME,
  HOW_TO,
  WEBSITE,
} from './Json-ld';

describe('Json-ld schemas', () => {
  describe('FAQ', () => {
    let schema;
    beforeEach(() => { schema = JSON.parse(FAQ); });

    it('is valid JSON', () => { expect(schema).toBeDefined(); });
    it('has @type FAQPage', () => { expect(schema['@type']).toBe('FAQPage'); });
    it('has 15 questions', () => { expect(schema.mainEntity).toHaveLength(15); });
    it('contains no HTML tags in answer text', () => {
      schema.mainEntity.forEach(q => {
        expect(q.acceptedAnswer.text).not.toMatch(/<[^>]+>/);
      });
    });
    it('first question targets lucky draw online generator keyword', () => {
      expect(schema.mainEntity[0].name).toMatch(/lucky draw online generator/i);
    });
  });

  describe('SOFTWARE_APPLICATION', () => {
    let schema;
    beforeEach(() => { schema = JSON.parse(SOFTWARE_APPLICATION); });

    it('is valid JSON', () => { expect(schema).toBeDefined(); });
    it('has @type SoftwareApplication', () => { expect(schema['@type']).toBe('SoftwareApplication'); });
    it('name is Lucky Draw Online Generator', () => {
      expect(schema.name).toBe('Lucky Draw Online Generator');
    });
    it('has dateModified 2026-05-30', () => { expect(schema.dateModified).toBe('2026-05-30'); });
    it('has no reviewCount field (avoid duplication)', () => {
      expect(schema.aggregateRating.reviewCount).toBeUndefined();
    });
    it('featureList contains generator keyword', () => {
      expect(schema.featureList).toMatch(/lucky draw online generator/i);
    });
  });

  describe('ORGANIZATION', () => {
    let schema;
    beforeEach(() => { schema = JSON.parse(ORGANIZATION); });

    it('is valid JSON', () => { expect(schema).toBeDefined(); });
    it('has @type Organization', () => { expect(schema['@type']).toBe('Organization'); });
    it('has url', () => { expect(schema.url).toBe('https://luckydraw.me'); });
  });

  describe('BREADCRUMB_HOME', () => {
    let schema;
    beforeEach(() => { schema = JSON.parse(BREADCRUMB_HOME); });

    it('is valid JSON', () => { expect(schema).toBeDefined(); });
    it('has @type BreadcrumbList', () => { expect(schema['@type']).toBe('BreadcrumbList'); });
    it('has one item', () => { expect(schema.itemListElement).toHaveLength(1); });
  });

  describe('HOW_TO', () => {
    let schema;
    beforeEach(() => { schema = JSON.parse(HOW_TO); });

    it('is valid JSON', () => { expect(schema).toBeDefined(); });
    it('has @type HowTo', () => { expect(schema['@type']).toBe('HowTo'); });
    it('has 4 steps', () => { expect(schema.step).toHaveLength(4); });
    it('steps have sequential positions', () => {
      schema.step.forEach((s, i) => { expect(s.position).toBe(i + 1); });
    });
    it('name contains lucky draw online generator', () => {
      expect(schema.name).toMatch(/lucky draw online generator/i);
    });
  });

  describe('WEBSITE', () => {
    let schema;
    beforeEach(() => { schema = JSON.parse(WEBSITE); });

    it('is valid JSON', () => { expect(schema).toBeDefined(); });
    it('has @type WebSite', () => { expect(schema['@type']).toBe('WebSite'); });
    it('has potentialAction SearchAction', () => {
      expect(schema.potentialAction['@type']).toBe('SearchAction');
    });
    it('url is luckydraw.me', () => { expect(schema.url).toBe('https://luckydraw.me'); });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
CI=true npm test -- --watchAll=false --testPathPattern="Json-ld.test"
```

Expected: Multiple FAILs — `SOFTWARE_APPLICATION is not exported`, `HOW_TO is not exported`, `WEBSITE is not exported`, FAQ has 13 not 15 items.

- [ ] **Step 3: Rewrite `src/pages/Json-ld.js` with complete new content**

Replace the entire file with:

```js
export const FAQ = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a lucky draw online generator?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A lucky draw online generator is a free web-based tool that randomly selects winners from a list of participants. It uses a random number generation algorithm to ensure every participant has an equal and fair chance of winning. LuckyDraw.me is one of the most trusted lucky draw online generators, used by over 689,840 users worldwide for raffles, giveaways, contests, and events.",
      },
    },
    {
      "@type": "Question",
      name: "What is a lucky draw tool and random picker?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A lucky draw tool, also known as a random picker or random name picker, is a digital software or online platform designed for randomly selecting winners in contests, raffles, giveaways, or events. It ensures fair and transparent winner selection using random number generation algorithms. LuckyDraw.me is the leading free lucky draw online generator trusted by thousands worldwide.",
      },
    },
    {
      "@type": "Question",
      name: "How does a lucky draw and random picker tool work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Users input participant names or items, one per line, into the lucky draw generator. They configure preferences such as animation speed and whether to remove drawn items. When the Draw button is clicked, the random picker algorithm instantly selects a winner. The result is displayed immediately with a visual celebration.",
      },
    },
    {
      "@type": "Question",
      name: "What tools can I use to do a lucky draw?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "LuckyDraw.me is the most trusted and widely used lucky draw online generator. It is free, requires no registration, and works on all devices. Simply visit luckydraw.me, enter your participant names one per line, and click Draw to instantly select a random winner.",
      },
    },
    {
      "@type": "Question",
      name: "How does a lucky draw work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A lucky draw is a competition where participants are given equal chances of winning a prize through random selection. In an online lucky draw generator, each participant name is entered into the tool, and the generator randomly picks a winner from the full list. Every entry has the same probability of being selected, ensuring a fair and unbiased outcome.",
      },
    },
    {
      "@type": "Question",
      name: "How can I ensure that the tool is fair and random?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "LuckyDraw.me uses JavaScript's Math.random() function seeded with system entropy, which provides statistically uniform random selection. Every participant has an equal probability of being drawn. The drawing process is displayed visually in real time, so all participants can witness the selection. No data is stored or manipulated on any server.",
      },
    },
    {
      "@type": "Question",
      name: "Does the tool support multiple winners?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, LuckyDraw.me supports selecting multiple winners per session. Enable the Remove Drawn Item option to ensure previously selected winners are excluded from future draws. You can continue clicking Draw until all required winners have been selected.",
      },
    },
    {
      "@type": "Question",
      name: "How do you hold a lucky draw?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "To hold a lucky draw online, collect your participants names or entries, then paste them into LuckyDraw.me one per line. Configure whether to show animation and whether to remove drawn names. Click Draw to randomly select winners instantly. The process is fully transparent and can be screen-recorded or livestreamed for added credibility.",
      },
    },
    {
      "@type": "Question",
      name: "What is a good lucky draw prize?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Popular lucky draw prizes include electronic devices such as smartphones, tablets, and earbuds, gift cards and vouchers, travel vouchers, gift baskets, seasonal products, and cash prizes. The best prizes are ones that appeal broadly to your audience and have clear monetary value, ensuring strong participation in your lucky draw.",
      },
    },
    {
      "@type": "Question",
      name: "How secure is LuckyDraw.me for storing data?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "LuckyDraw.me does not store any participant data entered into the tool. All processing happens locally in your browser. No names, entries, or draw results are transmitted to or saved on any server. Your data remains completely private and is cleared when you close or refresh the page.",
      },
    },
    {
      "@type": "Question",
      name: "What are popular lucky draw tools and random pickers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The most popular lucky draw online generator is LuckyDraw.me, trusted by over 689,840 users worldwide with a 5-star rating. Other options include RandomPicker and Comment Picker. LuckyDraw.me stands out for its completely free unlimited access, no registration requirement, multiple winner support, and transparent real-time drawing animation.",
      },
    },
    {
      "@type": "Question",
      name: "Is the lucky draw tool free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, LuckyDraw.me is 100% free to use with no registration required and no hidden fees. You can conduct unlimited lucky draws and winner selections without any cost. All core features including multiple winner support and animation controls are included at no charge.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use the random picker for social media giveaways?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, our lucky draw generator is perfect for social media giveaways. Collect comments or participant names from Instagram, Facebook, Twitter, or TikTok, paste them into LuckyDraw.me, and draw your winners instantly. The transparent, real-time selection makes it ideal for livestreaming your giveaway draw.",
      },
    },
    {
      "@type": "Question",
      name: "What makes LuckyDraw.me the best random picker?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "LuckyDraw.me is the number one lucky draw online generator because it offers 100% free unlimited access, true random selection algorithm, multiple winner support, no registration required, fast and transparent results, compatibility with all devices and browsers, and has been trusted by 689,840 users worldwide with a perfect 5-star rating.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use the lucky draw generator for Instagram giveaways?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely. Our lucky draw online generator is one of the most popular tools for Instagram giveaways. Copy all participant usernames or comments, paste them into the generator one per line, and click Draw to pick a winner instantly. Many creators screen-record the draw to share with followers as proof of a fair and transparent selection.",
      },
    },
  ],
});

export const SOFTWARE_APPLICATION = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Lucky Draw Online Generator",
  alternateName: [
    "Random Winner Picker",
    "Raffle Generator",
    "Random Name Picker",
    "Lucky Draw Generator",
    "LuckyDraw.me",
  ],
  url: "https://luckydraw.me",
  description:
    "Free lucky draw online generator for instant winner selection. Best random name picker, raffle generator, and contest draw tool for events, giveaways, and competitions worldwide.",
  applicationCategory: "UtilityApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5",
    bestRating: "5",
    ratingCount: "689840",
  },
  author: {
    "@type": "Person",
    name: "Jason Kam",
  },
  datePublished: "2018-01-01",
  dateModified: "2026-05-30",
  inLanguage: "en",
  browserRequirements: "Requires JavaScript. Requires HTML5.",
  softwareVersion: "2.0",
  screenshot: "https://luckydraw.me/images/luckydraw-share.png",
  featureList:
    "Lucky draw online generator, Random winner selection, Random name picker, Raffle generator, Multiple winner support, Fair and transparent drawing, No registration required, Free to use",
  sameAs: ["https://www.facebook.com/luckydraw.me/"],
});

export const ORGANIZATION = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "LuckyDraw.me",
  url: "https://luckydraw.me",
  logo: "https://luckydraw.me/images/luckydraw-app-tool-logo.svg",
  description:
    "Free lucky draw online generator and random picker tool trusted by thousands worldwide for fair and transparent winner selection.",
  foundingDate: "2018",
  sameAs: ["https://www.facebook.com/luckydraw.me/"],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Support",
    url: "https://luckydraw.me/faq",
  },
});

export const BREADCRUMB_HOME = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://luckydraw.me",
    },
  ],
});

export const HOW_TO = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Use the Lucky Draw Online Generator",
  description:
    "Use our free lucky draw online generator to randomly select winners for raffles, giveaways, and contests in 4 simple steps.",
  totalTime: "PT1M",
  tool: {
    "@type": "HowToTool",
    name: "LuckyDraw.me — Lucky Draw Online Generator",
  },
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Enter Names",
      text: "Add participant names or items into the lucky draw generator, one per line.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Configure Settings",
      text: "Choose your draw settings: enable or disable animation, and choose whether to remove drawn items from future draws.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Click Draw",
      text: "Press the Draw button to activate the lucky draw online generator and begin random winner selection.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Get Results",
      text: "See your randomly selected winner instantly with a confetti celebration. Repeat to select multiple winners.",
    },
  ],
});

export const WEBSITE = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "LuckyDraw.me",
  url: "https://luckydraw.me",
  description: "Free lucky draw online generator and random winner picker tool.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://luckydraw.me/?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
});
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
CI=true npm test -- --watchAll=false --testPathPattern="Json-ld.test"
```

Expected: All tests PASS. If any fail, check the export name matches exactly (`SOFTWARE_APPLICATION`, `HOW_TO`, `WEBSITE`).

- [ ] **Step 5: Run full test suite to check nothing is broken**

```bash
CI=true npm test -- --watchAll=false
```

Expected: Existing tests PASS except `Home.test.js` line 35 (which intentionally fails — fixed in Task 3). Note the specific failure message to confirm it is only that one assertion.

- [ ] **Step 6: Commit**

```bash
git add src/pages/Json-ld.js src/pages/Json-ld.test.js
git commit -m "seo: overhaul JSON-LD schemas — add HowTo+WebSite, fix FAQ HTML, rename to SOFTWARE_APPLICATION"
```

---

## Task 3: Update `Home.js`, `Home.test.js`, and `Faq.js`

**Files:**
- Modify: `src/pages/home/Home.js`
- Modify: `src/pages/home/Home.test.js`
- Modify: `src/pages/faq/Faq.js`

- [ ] **Step 1: Write the failing test in `Home.test.js`**

In `src/pages/home/Home.test.js`, replace line 35 (the hero section assertion):

Old:
```js
it('displays hero section when no items configured', () => {
  render(<Home />);
  expect(screen.getByText(/Free Lucky Draw Online Tool/i)).toBeInTheDocument();
});
```

New:
```js
it('displays hero section when no items configured', () => {
  render(<Home />);
  expect(screen.getByText(/Lucky Draw Online Generator/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
CI=true npm test -- --watchAll=false --testPathPattern="Home.test"
```

Expected: FAIL — `Unable to find an element with the text: /Lucky Draw Online Generator/i`

- [ ] **Step 3: Update import line in `src/pages/home/Home.js`**

Replace:
```js
import { FAQ, REVIEW, WEB_APPLICATION, ORGANIZATION, BREADCRUMB_HOME, SOFTWARE_APP } from "../Json-ld";
```

With:
```js
import { FAQ, SOFTWARE_APPLICATION, ORGANIZATION, BREADCRUMB_HOME, HOW_TO, WEBSITE } from "../Json-ld";
```

- [ ] **Step 4: Update Helmet scripts in `src/pages/home/Home.js`**

Replace the 6 `<script>` tags inside `<Helmet>`:

Old:
```jsx
<script type="application/ld+json">{FAQ}</script>
<script type="application/ld+json">{REVIEW}</script>
<script type="application/ld+json">{WEB_APPLICATION}</script>
<script type="application/ld+json">{ORGANIZATION}</script>
<script type="application/ld+json">{BREADCRUMB_HOME}</script>
<script type="application/ld+json">{SOFTWARE_APP}</script>
```

New:
```jsx
<script type="application/ld+json">{FAQ}</script>
<script type="application/ld+json">{SOFTWARE_APPLICATION}</script>
<script type="application/ld+json">{ORGANIZATION}</script>
<script type="application/ld+json">{BREADCRUMB_HOME}</script>
<script type="application/ld+json">{HOW_TO}</script>
<script type="application/ld+json">{WEBSITE}</script>
```

- [ ] **Step 5: Update Helmet title and meta description in `src/pages/home/Home.js`**

Replace:
```jsx
<title>Lucky Draw Online | Free Random Picker & Winner Selector Tool</title>
<meta name="description" content="Free lucky draw online tool & random picker for instant winner selection. Best random name picker, raffle generator, and contest draw tool. Fast, fair & transparent for events, giveaways & competitions." />
```

With:
```jsx
<title>Lucky Draw Online Generator | Free Random Winner Picker Tool</title>
<meta name="description" content="Use our free lucky draw online generator to pick random winners instantly. Best random name picker, raffle generator &amp; contest draw tool. Fast, fair &amp; transparent for events, giveaways &amp; competitions." />
```

- [ ] **Step 6: Update hero H1, H2, and paragraph in `src/pages/home/Home.js`**

Replace the entire hero `<div className="hero-section">` block:

Old:
```jsx
<div className="hero-section" style={{ textAlign: 'center', padding: '40px 20px', marginBottom: '30px' }}>
  <h1 style={{ fontSize: '2.5rem', color: '#198BCA', marginBottom: '20px', fontWeight: 'bold' }}>
    Free Lucky Draw Online Tool & Random Picker
  </h1>
  <h2 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '20px', fontWeight: 'normal' }}>
    Best Random Name Picker, Raffle Generator & Winner Selector
  </h2>
  <p style={{ fontSize: '1.1rem', color: '#666', maxWidth: '800px', margin: '0 auto 20px', lineHeight: '1.6' }}>
    The world's most trusted <strong>lucky draw tool</strong> and <strong>random picker</strong> for selecting winners instantly.
    Perfect for <strong>raffles</strong>, <strong>giveaways</strong>, <strong>contests</strong>, and <strong>events</strong>.
    Fast, fair, transparent, and completely <strong>free to use</strong>. Trusted by over 689,840 users worldwide!
  </p>
  <div style={{ marginTop: '25px' }}>
    <span style={{ fontSize: '1rem', color: '#888', fontStyle: 'italic' }}>
      ⭐⭐⭐⭐⭐ Rated 5/5 by 689,840+ users | No registration required | 100% Free
    </span>
  </div>
</div>
```

New:
```jsx
<div className="hero-section" style={{ textAlign: 'center', padding: '40px 20px', marginBottom: '30px' }}>
  <h1 style={{ fontSize: '2.5rem', color: '#198BCA', marginBottom: '20px', fontWeight: 'bold' }}>
    Lucky Draw Online Generator — Free Random Winner Picker
  </h1>
  <h2 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '20px', fontWeight: 'normal' }}>
    The Best Raffle Generator, Random Name Picker &amp; Contest Draw Tool
  </h2>
  <p style={{ fontSize: '1.1rem', color: '#666', maxWidth: '800px', margin: '0 auto 20px', lineHeight: '1.6' }}>
    LuckyDraw.me is the world's most trusted <strong>lucky draw online generator</strong> for selecting winners instantly.
    Whether you need a <strong>random winner picker</strong> for raffles, giveaways, social media contests, or corporate events — our free <strong>lucky draw generator</strong> delivers fast, fair, and transparent results.
    Trusted by over 689,840 users worldwide. No registration. No downloads. 100% free.
  </p>
  <div style={{ marginTop: '25px' }}>
    <span style={{ fontSize: '1rem', color: '#888', fontStyle: 'italic' }}>
      ⭐⭐⭐⭐⭐ Rated 5/5 by 689,840+ users | No registration required | 100% Free
    </span>
  </div>
</div>
```

- [ ] **Step 7: Update How-to section H2 in `src/pages/home/Home.js`**

Replace:
```jsx
<h2 style={{ color: '#198BCA', marginBottom: '20px' }}>How to Use Our Random Picker Tool</h2>
```

With:
```jsx
<h2 style={{ color: '#198BCA', marginBottom: '20px' }}>How to Use Our Lucky Draw Online Generator</h2>
```

- [ ] **Step 8: Update About section H2 and body in `src/pages/home/Home.js`**

Replace:
```jsx
<h2 style={{ color: '#198BCA', marginBottom: '20px' }}>About Our Lucky Draw & Random Picker Tool</h2>
```

With:
```jsx
<h2 style={{ color: '#198BCA', marginBottom: '20px' }}>About LuckyDraw.me — Your Free Lucky Draw Generator</h2>
```

Replace the first `<p>` in the About `<article>`:

Old:
```jsx
<p style={{ lineHeight: '1.8', marginBottom: '15px' }}>
  <strong>LuckyDraw.me</strong> is the world's leading <strong>online lucky draw tool</strong> and <strong>random picker</strong> designed to help you select winners fairly and transparently. Whether you're organizing a <strong>raffle</strong>, <strong>giveaway</strong>, <strong>contest</strong>, or any <strong>random selection event</strong>, our tool provides instant, unbiased results that everyone can trust.
</p>
```

New:
```jsx
<p style={{ lineHeight: '1.8', marginBottom: '15px' }}>
  <strong>LuckyDraw.me</strong> is the world's leading <strong>lucky draw online generator</strong> and <strong>random picker</strong>, designed to help you select winners fairly and transparently. Whether you're organizing a <strong>raffle</strong>, <strong>giveaway</strong>, <strong>contest</strong>, or any <strong>random selection event</strong>, our <strong>lucky draw generator</strong> provides instant, unbiased results that everyone can trust.
</p>
```

Replace the Advanced Features `<p>`:

Old:
```jsx
<p style={{ lineHeight: '1.8', marginBottom: '15px' }}>
  Unlike basic <strong>random picker wheels</strong> or simple name generators, LuckyDraw.me offers professional-grade features including multiple winner selection, animation controls, and the option to remove drawn items for truly unique results. Our <strong>random winner picker</strong> algorithm ensures complete fairness in every draw.
</p>
```

New:
```jsx
<p style={{ lineHeight: '1.8', marginBottom: '15px' }}>
  Unlike basic <strong>random picker wheels</strong> or simple name generators, our <strong>lucky draw online generator</strong> offers professional-grade features including multiple winner selection, animation controls, and the option to remove drawn items for truly unique results. LuckyDraw.me's <strong>random winner picker</strong> algorithm ensures complete fairness in every lucky draw.
</p>
```

- [ ] **Step 9: Fix `src/pages/faq/Faq.js` — remove REVIEW import**

Replace:
```js
import { FAQ, REVIEW, ORGANIZATION, BREADCRUMB_HOME } from "../Json-ld";
```

With:
```js
import { FAQ, ORGANIZATION, BREADCRUMB_HOME } from "../Json-ld";
```

Also remove the `<script type="application/ld+json">{REVIEW}</script>` line from its Helmet.

- [ ] **Step 10: Run `Home.test.js` to verify it passes**

```bash
CI=true npm test -- --watchAll=false --testPathPattern="Home.test"
```

Expected: All tests PASS.

- [ ] **Step 11: Run full test suite**

```bash
CI=true npm test -- --watchAll=false
```

Expected: All tests PASS.

- [ ] **Step 12: Commit**

```bash
git add src/pages/home/Home.js src/pages/home/Home.test.js src/pages/faq/Faq.js
git commit -m "seo: rewrite H1/hero copy and update imports for lucky draw online generator keyword"
```

---

## Task 4: Overhaul `src/components/FaqSection/index.jsx` (TDD)

**Files:**
- Create: `src/components/FaqSection/FaqSection.test.jsx`
- Modify: `src/components/FaqSection/index.jsx`

- [ ] **Step 1: Create failing test `src/components/FaqSection/FaqSection.test.jsx`**

```jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import FaqSection from './index';

describe('FaqSection', () => {
  it('renders FAQ heading as h2, not h1', () => {
    render(<FaqSection />);
    const heading = screen.getByText(/Frequently Asked Questions/i);
    expect(heading.tagName).toBe('H2');
  });

  it('renders 12 FAQ question titles', () => {
    render(<FaqSection />);
    const questionTitles = [
      'What tools can I use to do a lucky draw?',
      'What is a lucky draw tool?',
      'How does a lucky draw tool work?',
      'How does a lucky draw work?',
      'How can I ensure that the tool is fair and random?',
      'Does the tool support multiple winners?',
      'How do you hold a lucky draw?',
      'What is a good lucky draw prize?',
      'How secure is LuckyDraw.me for storing data?',
      'What are popular lucky draw tools?',
      'What is a lucky draw online generator?',
      'Can I use the lucky draw generator for Instagram giveaways?',
    ];
    questionTitles.forEach(title => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });

  it('expanded answer for first question mentions luckydraw.me', () => {
    render(<FaqSection />);
    expect(screen.getByText(/luckydraw\.me/i)).toBeInTheDocument();
  });

  it('new generator question targets keyword', () => {
    render(<FaqSection />);
    expect(screen.getByText('What is a lucky draw online generator?')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
CI=true npm test -- --watchAll=false --testPathPattern="FaqSection.test"
```

Expected: FAIL — heading is H1 not H2, only 10 questions (missing the 2 new ones).

- [ ] **Step 3: Rewrite `src/components/FaqSection/index.jsx`**

Replace the entire file with:

```jsx
import React from "react";
import { Card } from "tabler-react";
import "./style.css";

const FaqSection = () => {
  return (
    <>
      <h2>Frequently Asked Questions (FAQ)</h2>
      <Card>
        <Card.Body>
          <Card>
            <Card.Status color="blue" />
            <Card.Header>
              <Card.Title>What tools can I use to do a lucky draw?</Card.Title>
            </Card.Header>
            <Card.Body>
              <b>
                <a href="https://luckydraw.me/">LuckyDraw.me</a>
              </b>{" "}
              is the most trusted and widely used lucky draw online generator.
              It is free, requires no registration, and works on all devices.
              Simply visit luckydraw.me, enter your participant names one per
              line, and click Draw to instantly select a random winner.
            </Card.Body>
          </Card>
          <Card>
            <Card.Status color="blue" />
            <Card.Header>
              <Card.Title>What is a lucky draw tool?</Card.Title>
            </Card.Header>
            <Card.Body>
              A lucky draw tool, also known as a random picker or random name
              picker, is a digital software or online platform designed for
              randomly selecting winners in contests, raffles, giveaways, or
              events. It ensures fair and transparent winner selection using
              random number generation algorithms.{" "}
              <b>
                <a href="https://luckydraw.me/">LuckyDraw.me</a>
              </b>{" "}
              is the leading free lucky draw online generator trusted by
              thousands worldwide.
            </Card.Body>
          </Card>
          <Card>
            <Card.Status color="blue" />
            <Card.Header>
              <Card.Title>How does a lucky draw tool work?</Card.Title>
            </Card.Header>
            <Card.Body>
              Users input participant names or items, one per line, into the
              lucky draw generator. They configure preferences such as animation
              speed and whether to remove drawn items. When the Draw button is
              clicked, the random picker algorithm instantly selects a winner.
              The result is displayed immediately with a visual celebration.
            </Card.Body>
          </Card>
          <Card>
            <Card.Status color="blue" />
            <Card.Header>
              <Card.Title>How does a lucky draw work?</Card.Title>
            </Card.Header>
            <Card.Body>
              A lucky draw is a competition where participants are given equal
              chances of winning a prize through random selection. In an online
              lucky draw generator, each participant name is entered into the
              tool, and the generator randomly picks a winner from the full
              list. Every entry has the same probability of being selected,
              ensuring a fair and unbiased outcome.
            </Card.Body>
          </Card>
          <Card>
            <Card.Status color="blue" />
            <Card.Header>
              <Card.Title>
                How can I ensure that the tool is fair and random?
              </Card.Title>
            </Card.Header>
            <Card.Body>
              LuckyDraw.me uses JavaScript's Math.random() function seeded with
              system entropy, which provides statistically uniform random
              selection. Every participant has an equal probability of being
              drawn. The drawing process is displayed visually in real time, so
              all participants can witness the selection. No data is stored or
              manipulated on any server.
            </Card.Body>
          </Card>
          <Card>
            <Card.Status color="blue" />
            <Card.Header>
              <Card.Title>Does the tool support multiple winners?</Card.Title>
            </Card.Header>
            <Card.Body>
              Yes,{" "}
              <b>
                <a href="https://luckydraw.me/">LuckyDraw.me</a>
              </b>{" "}
              supports selecting multiple winners per session. Enable the Remove
              Drawn Item option to ensure previously selected winners are
              excluded from future draws. You can continue clicking Draw until
              all required winners have been selected.
            </Card.Body>
          </Card>
          <Card>
            <Card.Status color="blue" />
            <Card.Header>
              <Card.Title>How do you hold a lucky draw?</Card.Title>
            </Card.Header>
            <Card.Body>
              To hold a lucky draw online, collect your participants' names or
              entries, then paste them into{" "}
              <b>
                <a href="https://luckydraw.me/">LuckyDraw.me</a>
              </b>{" "}
              one per line. Configure whether to show animation and whether to
              remove drawn names. Click Draw to randomly select winners
              instantly. The process is fully transparent and can be
              screen-recorded or livestreamed for added credibility.
            </Card.Body>
          </Card>
          <Card>
            <Card.Status color="blue" />
            <Card.Header>
              <Card.Title>What is a good lucky draw prize?</Card.Title>
            </Card.Header>
            <Card.Body>
              Popular lucky draw prizes include electronic devices such as
              smartphones, tablets, and earbuds, gift cards and vouchers,
              travel vouchers, gift baskets, seasonal products, and cash
              prizes. The best prizes are ones that appeal broadly to your
              audience and have clear monetary value, ensuring strong
              participation in your lucky draw.
            </Card.Body>
          </Card>
          <Card>
            <Card.Status color="blue" />
            <Card.Header>
              <Card.Title>
                How secure is LuckyDraw.me for storing data?
              </Card.Title>
            </Card.Header>
            <Card.Body>
              LuckyDraw.me does not store any participant data entered into the
              tool. All processing happens locally in your browser. No names,
              entries, or draw results are transmitted to or saved on any
              server. Your data remains completely private and is cleared when
              you close or refresh the page.
            </Card.Body>
          </Card>
          <Card>
            <Card.Status color="blue" />
            <Card.Header>
              <Card.Title>What are popular lucky draw tools?</Card.Title>
            </Card.Header>
            <Card.Body>
              The most popular lucky draw online generator is{" "}
              <b>
                <a href="https://luckydraw.me/">LuckyDraw.me</a>
              </b>
              , trusted by over 689,840 users worldwide with a 5-star rating.
              Other options include RandomPicker and Comment Picker.
              LuckyDraw.me stands out for its completely free unlimited access,
              no registration requirement, multiple winner support, and
              transparent real-time drawing animation.
            </Card.Body>
          </Card>
          <Card>
            <Card.Status color="blue" />
            <Card.Header>
              <Card.Title>What is a lucky draw online generator?</Card.Title>
            </Card.Header>
            <Card.Body>
              A lucky draw online generator is a free web-based tool that
              randomly selects winners from a list of participants. It uses a
              random number generation algorithm to ensure every participant has
              an equal and fair chance of winning.{" "}
              <b>
                <a href="https://luckydraw.me/">LuckyDraw.me</a>
              </b>{" "}
              is one of the most trusted lucky draw online generators, used by
              over 689,840 users worldwide for raffles, giveaways, contests,
              and events.
            </Card.Body>
          </Card>
          <Card>
            <Card.Status color="blue" />
            <Card.Header>
              <Card.Title>
                Can I use the lucky draw generator for Instagram giveaways?
              </Card.Title>
            </Card.Header>
            <Card.Body>
              Absolutely. Our lucky draw online generator is one of the most
              popular tools for Instagram giveaways. Copy all participant
              usernames or comments, paste them into the generator one per
              line, and click Draw to pick a winner instantly. Many creators
              screen-record the draw to share with followers as proof of a fair
              and transparent selection.
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>
    </>
  );
};

export default FaqSection;
```

- [ ] **Step 4: Run FaqSection tests**

```bash
CI=true npm test -- --watchAll=false --testPathPattern="FaqSection.test"
```

Expected: All tests PASS.

- [ ] **Step 5: Run full test suite**

```bash
CI=true npm test -- --watchAll=false
```

Expected: All tests PASS with 0 failures.

- [ ] **Step 6: Commit**

```bash
git add src/components/FaqSection/index.jsx src/components/FaqSection/FaqSection.test.jsx
git commit -m "seo: expand FAQ answers, fix h1->h2, add lucky draw online generator question"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** All 5 spec sections mapped to tasks. title ✅ meta ✅ H1 ✅ OG/Twitter ✅ schemas (fix/add/remove) ✅ FAQ expand ✅ FAQ h2 ✅ sitemap ✅
- [x] **Placeholder scan:** No TBD/TODO. All steps have complete code.
- [x] **Type consistency:** `SOFTWARE_APPLICATION` (not `WEB_APPLICATION`, not `SOFTWARE_APP`) used consistently in Json-ld.js, Json-ld.test.js, and Home.js imports. `HOW_TO`, `WEBSITE` consistent across all files.
- [x] **Break check:** `Faq.js` imports `REVIEW` which is removed — fixed in Task 3 Step 9.
- [x] **Home.test.js line 35** checks old hero text — fixed in Task 3 Step 1 before the implementation change.
