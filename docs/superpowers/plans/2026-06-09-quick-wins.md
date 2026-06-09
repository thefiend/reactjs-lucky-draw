# Quick Wins Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship $1,400–2,300/mo in additional revenue within 1 week on the existing CRA/Netlify site.

**Architecture:** Two independent changes to the current CRA codebase — (1) swap MediaNet for Ezoic and add a sticky mobile ad unit, (2) replace the Google Form on `/list` with self-serve Stripe Payment Links for sponsor tiers.

**Tech Stack:** React CRA (existing), Stripe Payment Links (no-code, dashboard only), Ezoic (account + script swap)

---

## File Map

| File | Change |
|------|--------|
| `public/index.html` | Remove MediaNet scripts, add Ezoic head script |
| `src/components/StickyAd.jsx` | **New** — sticky footer ad component (mobile only) |
| `src/components/StickyAd.test.jsx` | **New** — renders + hides correctly |
| `src/SiteWrapper.jsx` | Import and render `<StickyAd />` |
| `src/SiteWrapper.test.jsx` | Verify StickyAd present in output |
| `src/pages/list/List.js` | Replace Google Form iframe with 3 Stripe Payment Link buttons |
| `src/pages/list/List.test.js` | Verify tier buttons render, form gone |

---

## Task 1: Apply for Ezoic (no code)

- [ ] **Step 1: Sign up**
  Go to https://www.ezoic.com → sign up with luckydraw.me domain.

- [ ] **Step 2: Verify domain ownership**
  Ezoic offers 3 methods — choose **Ezoic Cloudflare Integration** (fastest) or **DNS nameserver** method. Follow their verification wizard.

- [ ] **Step 3: Apply to Mediavine in parallel**
  Go to https://www.mediavine.com/join-our-ad-network/ and apply with the same domain. Approval takes longer (50k sessions threshold), but apply now. Switch to Mediavine when approved for higher RPM.

- [ ] **Step 4: Wait for Ezoic approval**
  Typically 3–7 days. Ezoic emails you the integration script when approved. Continue to Task 2 only after receiving that script.

---

## Task 2: Swap MediaNet for Ezoic

**Files:**
- Modify: `public/index.html:103-111`

- [ ] **Step 1: Remove MediaNet scripts from `public/index.html`**

  Remove these lines (103–111):
  ```html
  <script type="text/javascript">
    window._mNHandle = window._mNHandle || {};
    window._mNHandle.queue = window._mNHandle.queue || [];
    medianet_versionId = "3121199";
  </script>
  <script
    src="https://contextual.media.net/dmedianet.js?cid=8CUR14JKF"
    async="async"
  ></script>
  ```

  Replace with your Ezoic head script (provided by Ezoic in their dashboard). It looks like:
  ```html
  <!-- Ezoic - head - head -->
  <script async src="//www.ezojs.com/ezoic/sa.min.js"></script>
  <script>
    window.ezstandalone = window.ezstandalone || {};
    ezstandalone.cmd = ezstandalone.cmd || [];
  </script>
  <!-- End Ezoic -->
  ```

- [ ] **Step 2: Verify build passes**
  ```bash
  npm run build
  ```
  Expected: no errors, `build/` directory created.

- [ ] **Step 3: Commit**
  ```bash
  git add public/index.html
  git commit -m "feat: replace MediaNet with Ezoic ad network"
  ```

---

## Task 3: Add sticky mobile ad unit

**Files:**
- Create: `src/components/StickyAd.jsx`
- Create: `src/components/StickyAd.test.jsx`
- Modify: `src/SiteWrapper.jsx`
- Modify: `src/SiteWrapper.test.jsx`

- [ ] **Step 1: Write failing test**

  Create `src/components/StickyAd.test.jsx`:
  ```jsx
  import React from 'react';
  import { render, screen } from '@testing-library/react';
  import StickyAd from './StickyAd';

  describe('StickyAd', () => {
    it('renders the ad container with correct id', () => {
      render(<StickyAd />);
      expect(document.getElementById('ezoic-pub-ad-placeholder-sticky-footer')).toBeInTheDocument();
    });

    it('applies sticky footer styles', () => {
      const { container } = render(<StickyAd />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveStyle({ position: 'fixed' });
      expect(wrapper).toHaveStyle({ bottom: '0' });
    });
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  ```bash
  npx react-scripts test --watchAll=false src/components/StickyAd.test.jsx
  ```
  Expected: FAIL — `Cannot find module './StickyAd'`

- [ ] **Step 3: Create `src/components/StickyAd.jsx`**
  ```jsx
  import React, { useEffect } from 'react';

  const styles = {
    wrapper: {
      position: 'fixed',
      bottom: '0',
      left: '0',
      width: '100%',
      zIndex: 9999,
      backgroundColor: '#fff',
      textAlign: 'center',
      // Hide on desktop (768px+) via inline media query not possible;
      // Ezoic controls display via its own responsive logic
    },
  };

  function StickyAd() {
    useEffect(() => {
      if (window.ezstandalone) {
        window.ezstandalone.cmd.push(function () {
          window.ezstandalone.displayMore(999); // placeholder ID 999 = sticky footer
        });
      }
    }, []);

    return (
      <div style={styles.wrapper}>
        <div id="ezoic-pub-ad-placeholder-sticky-footer"></div>
      </div>
    );
  }

  export default StickyAd;
  ```

- [ ] **Step 4: Run test to verify it passes**
  ```bash
  npx react-scripts test --watchAll=false src/components/StickyAd.test.jsx
  ```
  Expected: PASS

- [ ] **Step 5: Add StickyAd to SiteWrapper**

  In `src/SiteWrapper.jsx`, add import after existing imports:
  ```jsx
  import StickyAd from './components/StickyAd';
  ```

  In the `render()` return, wrap the existing `<Site.Wrapper>` output to append `<StickyAd />`:
  ```jsx
  render() {
    return (
      <>
        <Site.Wrapper
          headerProps={{
            href: '/',
            alt: APP_NAME,
            imageURL: '/images/luckydraw-app-tool-logo.svg',
            navItems: <NavItems />,
          }}
          navProps={{ itemsObjects: NAVBAR_ITEMS }}
          footerProps={{
            note: <FooterNote />,
            copyright: <Copyright />,
            nav: <NavBar />,
          }}
        >
          <div className="container main-section">{this.props.children}</div>
        </Site.Wrapper>
        <StickyAd />
      </>
    );
  }
  ```

- [ ] **Step 6: Run full tests**
  ```bash
  npm run test:ci
  ```
  Expected: all tests pass, coverage thresholds met.

- [ ] **Step 7: Commit**
  ```bash
  git add src/components/StickyAd.jsx src/components/StickyAd.test.jsx src/SiteWrapper.jsx
  git commit -m "feat: add sticky footer ad unit for Ezoic"
  ```

  > **Note:** In Ezoic dashboard, create an ad placeholder with ID matching `ezoic-pub-ad-placeholder-sticky-footer` and set it to "sticky footer" unit. Ezoic controls which sizes/devices show the ad.

---

## Task 4: Self-serve sponsor tiers on /list page

**Files:**
- Modify: `src/pages/list/List.js`
- Modify: `src/pages/list/List.test.js`

**Prerequisite — create 3 Stripe Payment Links (no code):**

1. Log in to https://dashboard.stripe.com
2. Go to **Payment Links** → **+ New**
3. Create product: "Gold Listing — LuckyDraw.me", price $99 one-time
4. After creation, copy the URL (looks like `https://buy.stripe.com/xxxxx`)
5. Repeat for "Platinum Listing — LuckyDraw.me" at $299
6. Repeat for "Featured Listing — LuckyDraw.me" at $599
7. Note all three URLs — needed in Step 3 below.

After payment, Stripe redirects to a success URL. Set the success redirect to `https://luckydraw.me/list?listed=true` in each payment link's settings.

- [ ] **Step 1: Write failing test**

  Replace `src/pages/list/List.test.js` with:
  ```jsx
  import React from 'react';
  import { render, screen } from '@testing-library/react';
  import { HelmetProvider } from 'react-helmet-async';
  import List from './List';

  // Wrap with HelmetProvider to avoid react-helmet warnings
  const renderList = () =>
    render(
      <HelmetProvider>
        <List />
      </HelmetProvider>
    );

  describe('List page', () => {
    it('shows Gold tier button', () => {
      renderList();
      expect(screen.getByText(/Gold/i)).toBeInTheDocument();
      expect(screen.getByText(/\$99/)).toBeInTheDocument();
    });

    it('shows Platinum tier button', () => {
      renderList();
      expect(screen.getByText(/Platinum/i)).toBeInTheDocument();
      expect(screen.getByText(/\$299/)).toBeInTheDocument();
    });

    it('shows Featured tier button', () => {
      renderList();
      expect(screen.getByText(/Featured/i)).toBeInTheDocument();
      expect(screen.getByText(/\$599/)).toBeInTheDocument();
    });

    it('does not render the old Google Form iframe', () => {
      const { container } = renderList();
      expect(container.querySelector('iframe')).not.toBeInTheDocument();
    });
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  ```bash
  npx react-scripts test --watchAll=false src/pages/list/List.test.js
  ```
  Expected: FAIL — iframe found, tier buttons not found.

- [ ] **Step 3: Replace List.js content**

  Replace entire `src/pages/list/List.js` with:
  ```jsx
  import React, { Component } from "react";
  import { Helmet } from "react-helmet";
  import { ORGANIZATION } from "../Json-ld";
  import SiteWrapper from "../../SiteWrapper";

  // Replace these with your actual Stripe Payment Link URLs from dashboard.stripe.com
  const STRIPE_GOLD_URL = "https://buy.stripe.com/REPLACE_WITH_GOLD_URL";
  const STRIPE_PLATINUM_URL = "https://buy.stripe.com/REPLACE_WITH_PLATINUM_URL";
  const STRIPE_FEATURED_URL = "https://buy.stripe.com/REPLACE_WITH_FEATURED_URL";

  const tiers = [
    {
      name: "Gold",
      price: "$99",
      description: "Listed entry with nofollow link to your site.",
      url: STRIPE_GOLD_URL,
      style: { background: "#fff", border: "2px solid #d4af37", color: "#d4af37" },
    },
    {
      name: "Platinum",
      price: "$299",
      description: "Do-follow link + logo + company description. Most popular.",
      url: STRIPE_PLATINUM_URL,
      style: { background: "#6366f1", border: "2px solid #6366f1", color: "#fff" },
      badge: "Most Popular",
    },
    {
      name: "Featured",
      price: "$599",
      description: "Above-the-fold placement + press mention on homepage.",
      url: STRIPE_FEATURED_URL,
      style: { background: "#0f172a", border: "2px solid #0f172a", color: "#fff" },
    },
  ];

  class List extends Component {
    render() {
      return (
        <SiteWrapper>
          <Helmet>
            <meta charSet="utf-8" />
            <title>List Your Business | Get High-Quality Backlinks | LuckyDraw.me</title>
            <meta name="description" content="Get your company listed on LuckyDraw.me for premium SEO backlinks. Join 689,840+ monthly visitors and boost your search rankings with high-quality do-follow links." />
            <link rel="canonical" href="https://luckydraw.me/list" />
            <meta property="og:title" content="List Your Business on LuckyDraw.me" />
            <meta property="og:description" content="Premium SEO backlinks from a high-traffic lucky draw website." />
            <meta property="og:url" content="https://luckydraw.me/list" />
            <script type="application/ld+json">{ORGANIZATION}</script>
          </Helmet>

          <div style={{ marginBottom: "30px" }}>
            <h1 style={{ fontSize: "2.5rem", color: "#198BCA", marginBottom: "15px" }}>
              Get Your Company Listed on LuckyDraw.me
            </h1>
            <h2 style={{ fontSize: "1.5rem", color: "#333", marginBottom: "20px", fontWeight: "normal" }}>
              Boost Your SEO with High-Quality Backlinks
            </h2>
          </div>

          <p style={{ fontSize: "1.1rem", lineHeight: "1.8", marginBottom: "30px" }}>
            LuckyDraw.me is one of the world's most visited <strong>lucky draw websites</strong> with over{" "}
            <strong>689,840 satisfied users</strong>. We help companies improve their{" "}
            <strong>Search Engine Optimization (SEO)</strong> through high-quality, do-follow backlinks.
            <br /><br />
            <strong>List your website today</strong> to benefit from our massive organic traffic and authority
            in the random picker and lucky draw niche.
          </p>

          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "40px" }}>
            {tiers.map((tier) => (
              <div
                key={tier.name}
                style={{
                  flex: "1 1 220px",
                  border: "2px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "24px",
                  position: "relative",
                  background: "#fff",
                }}
              >
                {tier.badge && (
                  <div style={{
                    position: "absolute",
                    top: "-12px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "#6366f1",
                    color: "#fff",
                    fontSize: "0.75rem",
                    padding: "2px 12px",
                    borderRadius: "12px",
                    whiteSpace: "nowrap",
                  }}>
                    {tier.badge}
                  </div>
                )}
                <div style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "6px" }}>{tier.name}</div>
                <div style={{ fontSize: "2rem", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>
                  {tier.price}
                  <span style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: "400" }}> one-time</span>
                </div>
                <p style={{ color: "#475569", fontSize: "0.9rem", marginBottom: "20px", lineHeight: "1.5" }}>
                  {tier.description}
                </p>
                <a
                  href={tier.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    textDecoration: "none",
                    ...tier.style,
                  }}
                >
                  Get {tier.name} Listing
                </a>
              </div>
            ))}
          </div>

          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
            After payment, email <strong>hello@luckydraw.me</strong> with your company details
            (name, URL, logo, description) and we'll add your listing within 48 hours.
          </p>
        </SiteWrapper>
      );
    }
  }

  export default List;
  ```

- [ ] **Step 4: Run test to verify it passes**
  ```bash
  npx react-scripts test --watchAll=false src/pages/list/List.test.js
  ```
  Expected: PASS — all 4 tests pass.

- [ ] **Step 5: Run full test suite**
  ```bash
  npm run test:ci
  ```
  Expected: all tests pass, coverage above 70% threshold.

- [ ] **Step 6: Replace placeholder Stripe URLs with real ones**

  Edit `src/pages/list/List.js` lines 7–9, replacing `REPLACE_WITH_*_URL` with the actual Stripe Payment Link URLs you created in the prerequisite step.

- [ ] **Step 7: Commit**
  ```bash
  git add src/pages/list/List.js src/pages/list/List.test.js
  git commit -m "feat: replace Google Form with self-serve Stripe sponsor tiers"
  ```

- [ ] **Step 8: Deploy to Netlify**
  ```bash
  git push origin master
  ```
  Netlify auto-deploys on push. Verify at https://www.luckydraw.me/list.
