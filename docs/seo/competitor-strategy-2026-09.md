# Competitive strategy — luckydraw.me vs the random-picker field

_Analysed 2026-09-20. Competitor data pulled from live pages on that date; re-verify before
publishing any of it in a public comparison page._

## 1. Where each competitor actually stands

| | luckydraw.me (us) | wheelofnames.com | luckydraw.fun | randompicker.com/lucky-draw | pinkylam.me/…/random-name-picker |
|---|---|---|---|---|---|
| Indexable pages | 3 | small core + heavy localisation | core + ~20 template tools + blog | blog/pages/categories/tags sitemaps | 1 |
| Words on the money page | ~1,430 | ~1,200 | ~1,300 | ~2,800 | ~26 |
| Languages | 1 | 65 | 14 | 1 | 1 |
| Draw modes | list draw | spin wheel | 6 (3D wheel, slot, cards, balls, name rain, sphere) | list draw | list draw |
| Save / share a draw | ❌ | ✅ link sharing, cloud + local | ❌ (local only) | ✅ account-based | ❌ |
| Verifiable proof of fairness | ❌ | ✅ public randomness audit page | ⚠️ CSPRNG claim only | ✅ permanent public certificate per draw | ❌ |
| Weighted odds | ❌ | ✅ | ❌ | ✅ (paid) | ❌ |
| Import (CSV / Sheets) | ❌ | ✅ Google Sheets | ❌ | ✅ Excel + entry forms | ❌ |
| Media (sound, images, logo) | ❌ | ✅ 150+ tracks, images, logo, background | ⚠️ animations only | ⚠️ branding (paid) | ⚠️ sound |
| Streaming / OBS support | ❌ | ✅ dedicated panel | ❌ | ✅ live display (paid) | ❌ |
| Signup required | ❌ none | optional | ❌ none | required beyond free tier | ❌ none |
| Price | free | free + ads | free | free ≤100 entries, then paid | free |
| Schema | 6 JSON-LD blocks | FAQ | FAQ | not exposed | none |
| Blog / content hub | ❌ | ⚠️ guides | ✅ guides incl. "alternatives" | ✅ full hub | ❌ |

### Read of each

- **wheelofnames.com** — the category king. Moat is brand + 65 locales + a public
  *randomness audit* page. Not beatable head-on on "spin the wheel"; beatable on every
  query that is not a wheel.
- **randompicker.com** — B2B/credibility play. Since 2009, permanent verification
  certificates, priced. Loses every "free, no signup" query. Their 2,800-word page is the
  content bar to clear.
- **luckydraw.fun** — our closest threat. Same name space ("lucky draw"), 6 animation modes,
  14 languages, template tools, and already publishes *alternatives* posts (i.e. they are
  hunting our brand). They out-ship us on features and locales today.
- **pinkylam.me** — 26 words, no schema, `<h1>Settings</h1>`, one page, and still in the
  results. Proof the SERP is won on links/age, not content depth, in some slots. Cheapest
  scalp available.

## 2. Our real gaps (ranked by cost-to-fix vs payoff)

1. **Trailing-slash canonical mismatch** (live, breaks indexing of /faq and /list). Free fix.
2. **Three pages against hubs of 20–100+.** No query surface. Biggest ranking ceiling.
3. **No shareable draw artefact.** Wheelofnames and RandomPicker both grow on links people
   create themselves. We generate zero user-made links.
4. **No proof of fairness.** Both leaders publish it; LLMs quote it. We claim CSPRNG nowhere.
5. **Self-issued 5/5 aggregateRating and a "689,840 users" figure with no source.** If those
   are not backed by real, visible reviews, they are a manual-action risk and an LLM trust
   penalty. Either source them publicly or drop the rating markup.
6. **Single language** while competitors run 14–65.
7. **Ad-heavy CRA SPA.** Ads + client rendering hurt CWV and make passage extraction for AI
   answers noisier.
8. **No comparison / alternatives pages** while luckydraw.fun writes them about the category.

## 3. Plan to take #1 on Google

### Phase 1 — technical floor (days)
- Kill the `/faq` → `/faq/` canonical mismatch; one URL form site-wide, sitemap matched.
- Prerender every route (done for 3; keep it as routes grow) and assert it in CI — extend
  `src/seo-urls.test.js` with a post-build check that each sitemap URL's built HTML contains
  its own canonical, title, and H1.
- CWV pass with ads in place: lazy-mount ad slots below the fold, reserve their boxes to stop
  CLS, defer Ezoic/media.net until after the draw UI is interactive.
- Ship `llms.txt`, keep `robots.txt` open to GPTBot/ClaudeBot/PerplexityBot (they are the
  citation crawlers).

### Phase 2 — the moat: verifiable free draws (weeks)
The one thing nobody offers free: **provable draws, no account.**
- Seed each draw from `crypto.getRandomValues`, record `{list hash, seed, timestamp, result}`.
- Emit a shareable certificate URL per draw (`/draw/<id>`), with a "verify this draw" page
  that recomputes the result from the seed in-browser.
- Publish `/fairness` — algorithm, seed handling, open-source link, and a re-runnable
  verifier. This is the page that earns links and gets quoted by AI answers.
- Keep certificates `noindex, follow` (thin/duplicate otherwise) — the value is the inbound
  links and shares, not the pages.

### Phase 3 — feature parity where it converts (weeks)
Order by query volume attached to the feature: multi-winner + positions → weighted odds →
CSV/Sheets paste-import → wheel mode and slot-machine mode → save/share a named list →
sound + winner reveal → OBS/browser-source overlay for streamers → PWA/offline.
Each shipped feature unlocks its own landing page (below).

### Phase 4 — content architecture (weeks, compounding)
Hub = home (`lucky draw online generator`). Spokes, one page each, all prerendered:
- Tool pages: `/random-name-picker`, `/raffle-generator`, `/wheel-spinner`,
  `/random-number-generator`, `/team-generator`, `/winner-picker`, `/prize-draw`.
- Use-case pages: classroom, Instagram/TikTok giveaway, company annual dinner, wedding,
  church raffle, livestream giveaway, conference booth.
- Comparison pages (own the competitive intent luckydraw.fun is already farming):
  `wheel of names alternatives`, `luckydraw.fun alternative`, `randompicker alternative`,
  `free lucky draw generator vs paid`. Use the matrix above; cite sources; date-stamp it.
- How-to guides that answer the long tail: "how to prove a giveaway was fair",
  "how to pick 3 winners without repeats", "raffle rules template".
Internal linking: hub ↔ spokes both directions, breadcrumbs, and every guide links the tool.

### Phase 5 — links and localisation (ongoing)
- **Embeddable widget** (`<iframe>` + attribution link) — this is how wheelofnames compounds.
- Teacher-resource lists, streamer tool directories, AlternativeTo, Product Hunt, GitHub
  (open-source the RNG + verifier — cheap, and it is the citation people trust).
- Localise after static rendering lands: start with the 8 locales where "lucky draw" volume
  is highest (id, ms, th, vi, zh-Hant, pt-BR, es, ja), `hreflang` + localised slugs.

## 4. Plan to get cited by LLMs (GEO)

LLMs quote pages that are (a) crawlable without JS, (b) answer in extractable chunks,
(c) carry a verifiable, citable fact nobody else has.
- Every page: one 40–60 word direct answer immediately under the H1, then detail. That block
  is what gets lifted into AI Overviews / ChatGPT answers.
- Keep FAQPage + HowTo + SoftwareApplication JSON-LD; drop unverifiable ratings.
- Publish **original data** — the thing LLMs cannot get elsewhere: an annual transparency
  report ("N draws run, mean list size, modes used"), plus the fairness methodology page.
  Original stats are the highest-yield citation bait for a tool site.
- `llms.txt` listing the canonical tool + fairness + comparison URLs.
- Earn third-party mentions in "best random picker" roundups and Reddit/YouTube threads —
  AI answers lean on those aggregators more than on your own copy.
- State the brand + capability in plain sentences ("LuckyDraw.me is a free lucky draw
  generator that requires no signup and publishes a verifiable certificate for every draw").
  Entity-style sentences get reused verbatim.

## 5. Sequencing

| Week | Ship |
|---|---|
| 1 | Trailing-slash/canonical fix, prerender assertions in CI, CWV ad fixes, llms.txt, drop or source the rating markup |
| 2–3 | Multi-winner + weighted odds + CSV import; `/fairness` page; certificate URLs |
| 4–6 | Wheel + slot modes; 6 tool spokes; 3 comparison pages |
| 7–10 | Embed widget; use-case pages; transparency report |
| 11+ | Localisation (8 locales), link outreach, quarterly comparison refresh |

## 6. Measurement

Track weekly: GSC impressions/position for `lucky draw online generator`,
`random name picker`, `raffle generator` (+ locale variants); indexed page count; referring
domains; CWV field data; and AI citation checks (ask ChatGPT/Perplexity/AI Overviews "free
lucky draw generator" and log whether we are named).

## 7. Open data gaps

Live SERP positions and keyword volumes were not pulled — the WebSearch tool is unavailable
in this environment (Bedrock rejects the server-side search tool). Run the `seo-dataforseo`
or `seo-ahrefs` skill with credentials to attach real volumes/positions to each spoke before
committing to the content order above.
