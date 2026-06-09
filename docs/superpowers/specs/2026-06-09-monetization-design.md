# Monetization Design — luckydraw.me

**Date:** 2026-06-09
**Goal:** Reach $10,000/month revenue
**Approach:** Freemium SaaS + quick wins in parallel

---

## Context

- Current stack: React CRA on Netlify, zero backend
- Traffic: 689,840+ monthly users
- Existing revenue: MediaNet display ads + manual sponsor listings ($300 flat)
- Target: $10k/mo via freemium SaaS + optimized ads + self-serve sponsor tiers

---

## Revenue Model

| Stream | Target | Unit | Monthly |
|--------|--------|------|---------|
| Pro subscriptions ($9/mo or $79/yr) | 600 users | $9 | $5,400 |
| Business subscriptions ($49/mo or $399/yr) | 60 orgs | $49 | $2,940 |
| Improved ad revenue (Ezoic) | current traffic | ~$2 RPM | $1,400 |
| Self-serve sponsor listings | 3–4/mo | $99–$599 | $900 |
| **Total** | | | **~$10,640** |

---

## Architecture

```
luckydraw.me (Next.js 14 App Router on Vercel)
│
├── /app
│   ├── page.tsx                  ← main draw tool (Server Component)
│   ├── /pricing                  ← pricing page (3-column Free/Pro/Business)
│   ├── /dashboard                ← saved draws, history (auth-gated)
│   ├── /api/webhooks/ls          ← Lemon Squeezy webhook handler
│   ├── /api/webhooks/clerk       ← Clerk user.created → insert users row
│   └── /api/export               ← PDF/CSV export endpoint (Pro+)
│
├── Clerk                         ← auth (sign up, sign in, session)
├── Supabase (Postgres)           ← users, draws, exports tables
├── Lemon Squeezy                 ← subscriptions + checkout
└── Vercel                        ← hosting + edge functions
```

**Quick wins (parallel, Week 1):**
- Ezoic ad network replaces MediaNet
- Self-serve Stripe Payment Links on `/list` page (sponsor tiers)

---

## Data Model

```sql
-- Users (synced from Clerk via webhook)
create table users (
  id                   text primary key,  -- Clerk user ID
  email                text not null,
  plan                 text not null default 'free',  -- 'free' | 'pro' | 'business'
  trial_ends           timestamptz,
  ls_customer_id       text,
  ls_subscription_id   text,
  created_at           timestamptz default now()
);

-- Draw history (Pro+ only, retained 30 days for Pro, 1 year for Business)
create table draws (
  id          uuid primary key default gen_random_uuid(),
  user_id     text references users(id) on delete cascade,
  title       text,
  entries     text[],
  winners     text[],
  drawn_at    timestamptz default now()
);

-- Row-level security
-- Requires Clerk JWT template configured in Supabase dashboard:
-- Supabase → Authentication → JWT Templates → Add Clerk template
-- This lets Supabase verify Clerk JWTs so auth.uid() returns the Clerk user ID
alter table draws enable row level security;
create policy "own draws" on draws using (user_id = auth.uid());
```

---

## Feature Gating

| Feature | Free | Pro | Business |
|---------|------|-----|----------|
| Max entries | 50 | Unlimited | Unlimited |
| Winners per draw | 1 | Unlimited | Unlimited |
| Export PDF/CSV | No | Yes | Yes |
| Draw history | No | 30 days | 1 year |
| Ad-free | No | Yes | Yes |
| White-label branding | No | No | Yes |
| Shareable private URL | No | No | Yes |
| API access | No | No | Yes |
| Team seats | 1 | 1 | 5 |

**Gate logic:**
```ts
// lib/plan.ts
export function canUse(
  feature: 'export' | 'history' | 'unlimited' | 'noad' | 'whitelabel' | 'api',
  plan: string
): boolean {
  if (plan === 'business') return true;
  if (plan === 'pro') return ['export', 'history', 'unlimited', 'noad'].includes(feature);
  return false;
}
```

Free tier cap enforced in draw component: if `entries.length > 50 && plan === 'free'`, show upgrade prompt before draw fires.

---

## Auth Flow (Clerk)

- `<ClerkProvider>` wraps app root in `layout.tsx`
- `middleware.ts` protects `/dashboard` — unauthenticated → redirect to sign-in
- Clerk webhook `user.created` → POST `/api/webhooks/clerk` → insert row in `users`
- Clerk-provided `<SignInButton>`, `<UserButton>` components in navbar

---

## Payments Flow (Lemon Squeezy)

```
User clicks "Start Free Trial" on /pricing
  → redirect to Lemon Squeezy checkout
    (clerk_user_id passed as custom_data param)
  → user enters card details
  → 7-day trial begins (card required, not charged yet)
  → LS fires webhook: subscription_created
    → /api/webhooks/ls updates users.plan = 'pro' | 'business'
  → user redirected to /dashboard

After 7 days:
  → LS charges card automatically — no action needed

On cancellation:
  → LS fires webhook: subscription_cancelled
    → users.plan set back to 'free'
```

**Webhook handler:**
```ts
// app/api/webhooks/ls/route.ts
export async function POST(req: Request) {
  const payload = await req.json();
  const { event_name, data } = payload;

  if (['subscription_created', 'subscription_updated'].includes(event_name)) {
    const userId = data.attributes.custom_data.clerk_user_id;
    const plan = data.attributes.product_name.toLowerCase().includes('business')
      ? 'business' : 'pro';
    const trialEndsAt = data.attributes.trial_ends_at
      ? new Date(data.attributes.trial_ends_at).toISOString()
      : null;
    await supabase.from('users')
      .update({ plan, ls_subscription_id: data.id, trial_ends: trialEndsAt })
      .eq('id', userId);
  }

  if (event_name === 'subscription_cancelled') {
    const userId = data.attributes.custom_data.clerk_user_id;
    await supabase.from('users').update({ plan: 'free' }).eq('id', userId);
  }

  return Response.json({ ok: true });
}
```

Verify Lemon Squeezy webhook signature before processing in production.

---

## Pricing Page (/pricing)

- Layout: 3-column cards — Free / Pro / Business
- Monthly/annual toggle at top (annual shows savings)
- Pro card highlighted with indigo border + "Popular" badge
- CTAs: "Current plan" (Free), "Start free trial" (Pro), "Start free trial" (Business)

**Annual pricing:**
- Pro: $79/yr (saves $29 vs monthly)
- Business: $399/yr (saves $189 vs monthly)

---

## Quick Wins (Parallel Track)

### Ad Network Upgrade
1. Apply to Ezoic (ezoic.com) — accepts 10k+ sessions/mo
2. Replace MediaNet script tag with Ezoic integration
3. Add sticky footer ad unit on mobile
4. Apply to Mediavine in parallel (50k sessions threshold) — switch when approved
- Timeline: 3–7 days for Ezoic approval + 1 day integration

### Self-Serve Sponsor Listings (/list page)
Replace Google Form with 3 Stripe Payment Links:

| Tier | Price | Deliverable |
|------|-------|-------------|
| Gold | $99 one-time | Listed entry, nofollow link |
| Platinum | $299 one-time | Do-follow link, logo, description |
| Featured | $599 one-time | Above-fold placement, press mention |

Create payment links in Stripe dashboard → embed as buttons on `/list`. No backend needed.

---

## Migration Plan (CRA → Next.js)

1. `npx create-next-app@latest` in new directory, App Router enabled
2. Port React components one-by-one (draw tool, FAQ, list page)
3. Replace React Helmet with Next.js `<Metadata>` API
4. Replace React Router with Next.js file-based routing
5. Migrate `public/` assets, `robots.txt`, `sitemap.xml`
6. Add `next-sitemap` for automatic sitemap generation
7. Deploy preview to Vercel, validate SEO parity before DNS cutover
8. DNS cutover from Netlify → Vercel only after SEO parity confirmed

**SEO risk mitigation:** Keep Netlify live until Vercel preview passes full SEO audit. No DNS switch until confirmed.

---

## Implementation Phases

### Week 1 (Quick wins — parallel)
- [ ] Apply for Ezoic, swap ad script
- [ ] Add sticky mobile ad unit
- [ ] Create Stripe Payment Links for sponsor tiers
- [ ] Update `/list` page with new tier buttons

### Weeks 1–3 (Next.js migration)
- [ ] Scaffold Next.js 14 app
- [ ] Port all existing pages + components
- [ ] Integrate Clerk auth
- [ ] Set up Supabase schema + RLS
- [ ] Integrate Lemon Squeezy checkout
- [ ] Build `/pricing` page
- [ ] Build `/dashboard` (draw history)
- [ ] Implement feature gates in draw component
- [ ] Implement export endpoint (PDF + CSV)
- [ ] Webhook handlers (Clerk + Lemon Squeezy)
- [ ] SEO parity check vs current site
- [ ] DNS cutover Netlify → Vercel

### Week 4 (Polish + launch)
- [ ] Business tier: white-label config, shareable URL, API endpoint
- [ ] Upgrade prompts at each gate point in draw UI
- [ ] Email sequence via Lemon Squeezy (trial reminder day 5, cancel win-back)
- [ ] Announce to existing users via site banner
