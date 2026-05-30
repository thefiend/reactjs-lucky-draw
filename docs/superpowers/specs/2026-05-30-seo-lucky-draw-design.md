# SEO Optimization: Rank #1 for "lucky draw online generator"

**Date:** 2026-05-30
**Target keyword:** `lucky draw online generator`
**Goal:** Outrank all competitors on Google Search for this keyword
**Approach:** B — Full SEO overhaul (keyword + schema + copywriting)

---

## Problem Statement

The word "generator" — the critical differentiator in the target keyword — appears **nowhere** in the current title, H1, meta description, or OG tags. Additionally, 8 schema issues undermine rich result eligibility. The page cannot rank #1 for a keyword it never mentions.

---

## Files Changed

| File | Changes |
|------|---------|
| `public/index.html` | Title, meta description, OG/Twitter tags, keywords meta |
| `src/pages/home/Home.js` | Helmet title/desc, H1, hero copy, section headings, about copy |
| `src/pages/Json-ld.js` | Fix all schemas, add HowTo + WebSite, remove REVIEW + SOFTWARE_APP |
| `src/components/FaqSection/index.jsx` | H1→H2, expand all answers, add 2 new FAQs |
| `public/sitemap.xml` | Update all lastmod to 2026-05-30 |

---

## Section 1 — Title, Meta & OG Tags

### `public/index.html`

| Element | Old | New |
|---------|-----|-----|
| `<title>` | Lucky Draw Online \| Free Random Picker & Name Selector Tool | **Lucky Draw Online Generator \| Free Random Winner Picker** |
| `meta[name=description]` | "Free lucky draw online tool & random picker..." | "Use our free lucky draw online generator to pick random winners instantly. Best random name picker, raffle generator & contest draw tool. Fair, fast & transparent — no registration needed." |
| `meta[name=keywords]` | starts with "lucky draw,random picker..." | prepend `lucky draw online generator,lucky draw generator,` |
| `og:title` | Lucky Draw Online \| Free Random Picker & Name Selector Tool | **Lucky Draw Online Generator — Free Random Winner Picker** |
| `og:description` | "Free online lucky draw tool & random picker..." | "Use our free lucky draw online generator to instantly select random winners for raffles, giveaways, contests & events. Trusted by thousands worldwide. Fair, transparent & easy to use!" |
| `twitter:title` | same as og:title old | **Lucky Draw Online Generator — Free Random Winner Picker** |
| `twitter:description` | "Free online lucky draw tool & random picker..." | "Use our free lucky draw online generator to instantly select random winners. Fair, fast & transparent — no registration needed!" |

### `src/pages/home/Home.js` (Helmet)

- `<title>` → `"Lucky Draw Online Generator | Free Random Winner Picker Tool"`
- `meta[name=description]` → `"Use our free lucky draw online generator to pick random winners instantly. Best random name picker, raffle generator & contest draw tool. Fast, fair & transparent for events, giveaways & competitions."`

---

## Section 2 — H1, Hero Copy & Body Sections (`Home.js`)

### H1 (hero, shown when `items.length === 0`)
```
Lucky Draw Online Generator — Free Random Winner Picker
```

### H2 (hero subtitle)
```
The Best Raffle Generator, Random Name Picker & Contest Draw Tool
```

### Hero paragraph
```
LuckyDraw.me is the world's most trusted lucky draw online generator for selecting
winners instantly. Whether you need a random winner picker for raffles, giveaways,
social media contests, or corporate events — our free lucky draw generator delivers
fast, fair, and transparent results. Trusted by 689,840+ users worldwide.
No registration. No downloads. 100% free.
```

### "Why Choose" sidebar — add one line
- Add: `**Lucky Draw Generator** — purpose-built for online draws` (or similar)

### How-to section H2
```
How to Use Our Lucky Draw Online Generator
```

### About article H2
```
About LuckyDraw.me — Your Free Lucky Draw Generator
```

### About article body — add "lucky draw online generator" naturally in:
- First paragraph (once, near start)
- Advanced Features paragraph (once)

---

## Section 3 — Schema Changes (`src/pages/Json-ld.js`)

### Removed schemas
- `REVIEW` (`CreativeWorkSeries` + `AggregateRating`) — wrong parent type, remove
- `SOFTWARE_APP` (`SoftwareApplication`) — redundant with `WEB_APPLICATION`, remove

### Modified: `WEB_APPLICATION` → rename export to `SOFTWARE_APPLICATION`
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Lucky Draw Online Generator",
  "alternateName": ["Random Winner Picker", "Raffle Generator", "Random Name Picker", "Lucky Draw Generator", "LuckyDraw.me"],
  "url": "https://luckydraw.me",
  "description": "Free lucky draw online generator for instant winner selection. Best random name picker, raffle generator, and contest draw tool for events, giveaways, and competitions worldwide.",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "Any",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5",
    "bestRating": "5",
    "ratingCount": "689840"
  },
  "author": { "@type": "Person", "name": "Jason Kam" },
  "datePublished": "2018-01-01",
  "dateModified": "2026-05-30",
  "inLanguage": "en",
  "browserRequirements": "Requires JavaScript. Requires HTML5.",
  "softwareVersion": "2.0",
  "screenshot": "https://luckydraw.me/images/luckydraw-share.png",
  "featureList": "Lucky draw online generator, Random winner selection, Random name picker, Raffle generator, Multiple winner support, Fair and transparent drawing, No registration required, Free to use",
  "sameAs": ["https://www.facebook.com/luckydraw.me/"]
}
```

### Modified: `FAQ`
- Strip all HTML from `text` fields (use plain text with URLs as plain text, not anchor tags)
- Add new Q: `"What is a lucky draw online generator?"` with full answer
- Add new Q: `"Can I use this lucky draw generator for Instagram giveaways?"` with full answer
- Total: 15 questions

### Modified: `ORGANIZATION`
- `description` → "Free lucky draw online generator and random picker tool trusted by thousands worldwide for fair and transparent winner selection."
- Add `foundingDate: "2018"`

### Unchanged: `BREADCRUMB_HOME`

### New: `HOW_TO`
```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Use the Lucky Draw Online Generator",
  "description": "Use our free lucky draw online generator to randomly select winners for raffles, giveaways, and contests in 4 simple steps.",
  "step": [
    { "@type": "HowToStep", "position": 1, "name": "Enter Names", "text": "Add participant names or items into the lucky draw generator, one per line." },
    { "@type": "HowToStep", "position": 2, "name": "Configure Settings", "text": "Choose your draw settings: enable or disable animation, and choose whether to remove drawn items." },
    { "@type": "HowToStep", "position": 3, "name": "Click Draw", "text": "Press the Draw button to activate the lucky draw online generator and begin random selection." },
    { "@type": "HowToStep", "position": 4, "name": "Get Results", "text": "See your randomly selected winner instantly with a confetti celebration." }
  ],
  "totalTime": "PT1M",
  "tool": { "@type": "HowToTool", "name": "LuckyDraw.me — Lucky Draw Online Generator" }
}
```

### New: `WEBSITE`
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "LuckyDraw.me",
  "url": "https://luckydraw.me",
  "description": "Free lucky draw online generator and random winner picker tool.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": { "@type": "EntryPoint", "urlTemplate": "https://luckydraw.me/?q={search_term_string}" },
    "query-input": "required name=search_term_string"
  }
}
```

### Export list after changes
```js
export { FAQ, SOFTWARE_APPLICATION, ORGANIZATION, BREADCRUMB_HOME, HOW_TO, WEBSITE }
```

Update `Home.js` imports accordingly.

---

## Section 4 — FAQ Section & Sitemap

### `src/components/FaqSection/index.jsx`

- `<h1>Frequently Asked Questions (FAQ)</h1>` → **`<h2>`**
- All 10 existing card answers expanded to 2-4 sentences matching JSON-LD FAQ text
- Add 2 new `<Card>` entries:
  1. "What is a lucky draw online generator?" (targets exact keyword)
  2. "Can I use the lucky draw generator for Instagram giveaways?"
- Total visible FAQ cards: 12

### `public/sitemap.xml`

- All 3 `<lastmod>` → `2026-05-30T00:00:00+00:00`

---

## SEO Impact Summary

| Signal | Before | After |
|--------|--------|-------|
| Target keyword in title | ❌ | ✅ |
| Target keyword in H1 | ❌ | ✅ |
| Target keyword in meta desc | ❌ | ✅ |
| Target keyword in OG/Twitter | ❌ | ✅ |
| Duplicate H1 | ❌ (2× H1) | ✅ (1× H1) |
| HowTo schema | ❌ | ✅ |
| WebSite schema | ❌ | ✅ |
| Schema count | 6 (2 redundant, 1 wrong type) | 6 (all valid, no redundancy) |
| FAQ schema HTML malformation | ❌ | ✅ |
| FAQ visible/schema alignment | ❌ (mismatch) | ✅ |
| Sitemap freshness | ❌ (2025-10-24) | ✅ (2026-05-30) |
