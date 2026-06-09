# SaaS Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate luckydraw.me from CRA/Netlify to Next.js 14/Vercel with Clerk auth, Supabase, and Lemon Squeezy subscriptions (Pro $9/mo, Business $49/mo) to reach $10k/mo.

**Architecture:** New Next.js 14 App Router app in a feature branch, deployed to Vercel preview. Existing Netlify site stays live until SEO parity is confirmed, then DNS is cut over. Clerk handles auth, Supabase stores users and draw history, Lemon Squeezy handles subscriptions with webhook-driven plan updates.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Clerk, Supabase (Postgres + RLS), Lemon Squeezy, Tailwind CSS, Jest + React Testing Library, Vercel

---

## File Map

### New files to create

| File | Responsibility |
|------|---------------|
| `app/layout.tsx` | Root layout — ClerkProvider, global styles |
| `app/page.tsx` | Home page — draws draw tool, JSON-LD, metadata |
| `app/faq/page.tsx` | FAQ page — ported from CRA |
| `app/list/page.tsx` | Sponsor listings page — ported from CRA with Stripe tiers |
| `app/pricing/page.tsx` | Pricing page — 3-column Free/Pro/Business |
| `app/dashboard/page.tsx` | Auth-gated draw history for Pro+ users |
| `app/api/webhooks/clerk/route.ts` | Clerk `user.created` webhook → upsert users row |
| `app/api/webhooks/ls/route.ts` | Lemon Squeezy subscription webhooks → update plan |
| `app/api/export/route.ts` | PDF + CSV export for Pro+ users |
| `components/DrawTool.tsx` | Client component — full draw tool UI (ported from CRA) |
| `components/UpgradePrompt.tsx` | Modal shown when free user hits a gate |
| `components/PricingCards.tsx` | 3-column pricing UI with monthly/annual toggle |
| `components/NavBar.tsx` | Nav with Clerk UserButton + Sign In |
| `lib/plan.ts` | `canUse()` feature gate logic |
| `lib/supabase.ts` | Supabase browser client (anon key) |
| `lib/supabase-admin.ts` | Supabase server client (service role, webhooks only) |
| `middleware.ts` | Clerk auth — protects `/dashboard` |
| `next.config.ts` | Next.js config |
| `tailwind.config.ts` | Tailwind config |
| `jest.config.ts` | Jest config for Next.js |
| `jest.setup.ts` | RTL setup |

### Tests

| Test file | Tests |
|-----------|-------|
| `lib/__tests__/plan.test.ts` | All canUse() combinations |
| `app/api/webhooks/ls/__tests__/route.test.ts` | subscription_created, subscription_cancelled |
| `app/api/webhooks/clerk/__tests__/route.test.ts` | user.created → upsert |
| `app/api/export/__tests__/route.test.ts` | CSV output, auth gate |
| `components/__tests__/DrawTool.test.tsx` | Entry cap gate, draw fires |
| `components/__tests__/UpgradePrompt.test.tsx` | Renders, close button works |
| `components/__tests__/PricingCards.test.tsx` | All tiers visible, toggle works |

---

## Task 1: Scaffold Next.js app on feature branch

**Files:**
- Creates all files via `create-next-app`
- Create: `jest.config.ts`
- Create: `jest.setup.ts`

- [ ] **Step 1: Create feature branch**
  ```bash
  git checkout -b feat/nextjs-saas
  ```

- [ ] **Step 2: Scaffold Next.js 14 app**

  Run from the repo root (this replaces CRA — the old src/ stays in git history):
  ```bash
  # Remove CRA files first
  rm -rf src public node_modules package.json package-lock.json netlify.toml
  # Scaffold Next.js (answer prompts as shown)
  npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
  ```
  When prompted:
  - TypeScript: Yes
  - ESLint: Yes
  - Tailwind CSS: Yes
  - `src/` directory: No (use root `app/`)
  - App Router: Yes
  - Import alias: `@/*`

- [ ] **Step 3: Install dependencies**
  ```bash
  npm install @clerk/nextjs @supabase/supabase-js lemonsqueezy.js jspdf jspdf-autotable
  npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event ts-jest @types/jest
  ```

- [ ] **Step 4: Create `jest.config.ts`**
  ```ts
  import type { Config } from 'jest';
  import nextJest from 'next/jest.js';

  const createJestConfig = nextJest({ dir: './' });

  const config: Config = {
    coverageProvider: 'v8',
    testEnvironment: 'jsdom',
    setupFilesAfterEach: ['<rootDir>/jest.setup.ts'],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/$1',
    },
  };

  export default createJestConfig(config);
  ```

- [ ] **Step 5: Create `jest.setup.ts`**
  ```ts
  import '@testing-library/jest-dom';
  ```

- [ ] **Step 6: Add test script to `package.json`**

  In `package.json` scripts section, add:
  ```json
  "test": "jest",
  "test:ci": "jest --ci --coverage"
  ```

- [ ] **Step 7: Verify app builds**
  ```bash
  npm run build
  ```
  Expected: build succeeds with no errors.

- [ ] **Step 8: Commit**
  ```bash
  git add .
  git commit -m "chore: scaffold Next.js 14 app with TypeScript + Tailwind"
  ```

---

## Task 2: Configure environment variables

**Files:**
- Create: `.env.local` (gitignored)
- Create: `.env.example`

- [ ] **Step 1: Create accounts and collect keys**

  Collect these values (all free tiers):
  - **Clerk:** https://dashboard.clerk.com → create app → copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
  - **Supabase:** https://supabase.com → new project → Settings → API → copy URL, anon key, service_role key
  - **Lemon Squeezy:** https://app.lemonsqueezy.com → Settings → API → create API key; also create your webhook signing secret

- [ ] **Step 2: Create `.env.local`**
  ```
  # Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_replace_me
  CLERK_SECRET_KEY=sk_test_replace_me
  CLERK_WEBHOOK_SECRET=whsec_replace_me

  # Supabase
  NEXT_PUBLIC_SUPABASE_URL=https://replace_me.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=replace_me
  SUPABASE_SERVICE_ROLE_KEY=replace_me

  # Lemon Squeezy
  LEMONSQUEEZY_API_KEY=replace_me
  LEMONSQUEEZY_WEBHOOK_SECRET=replace_me
  NEXT_PUBLIC_LS_PRO_MONTHLY_URL=https://replace_me.lemonsqueezy.com/checkout/buy/replace_me
  NEXT_PUBLIC_LS_PRO_ANNUAL_URL=https://replace_me.lemonsqueezy.com/checkout/buy/replace_me
  NEXT_PUBLIC_LS_BUSINESS_MONTHLY_URL=https://replace_me.lemonsqueezy.com/checkout/buy/replace_me
  NEXT_PUBLIC_LS_BUSINESS_ANNUAL_URL=https://replace_me.lemonsqueezy.com/checkout/buy/replace_me
  NEXT_PUBLIC_STRIPE_GOLD_URL=https://buy.stripe.com/replace_me
  NEXT_PUBLIC_STRIPE_PLATINUM_URL=https://buy.stripe.com/replace_me
  NEXT_PUBLIC_STRIPE_FEATURED_URL=https://buy.stripe.com/replace_me
  ```

- [ ] **Step 3: Create `.env.example`** (committed to git — no real values)
  ```
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
  CLERK_SECRET_KEY=
  CLERK_WEBHOOK_SECRET=
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  LEMONSQUEEZY_API_KEY=
  LEMONSQUEEZY_WEBHOOK_SECRET=
  NEXT_PUBLIC_LS_PRO_MONTHLY_URL=
  NEXT_PUBLIC_LS_PRO_ANNUAL_URL=
  NEXT_PUBLIC_LS_BUSINESS_MONTHLY_URL=
  NEXT_PUBLIC_LS_BUSINESS_ANNUAL_URL=
  NEXT_PUBLIC_STRIPE_GOLD_URL=
  NEXT_PUBLIC_STRIPE_PLATINUM_URL=
  NEXT_PUBLIC_STRIPE_FEATURED_URL=
  ```

- [ ] **Step 4: Confirm `.env.local` is gitignored**

  `.gitignore` (auto-created by `create-next-app`) already includes `.env.local`. Verify:
  ```bash
  grep ".env.local" .gitignore
  ```
  Expected: `.env.local` is listed.

- [ ] **Step 5: Commit**
  ```bash
  git add .env.example .gitignore
  git commit -m "chore: add env var template"
  ```

---

## Task 3: Set up Supabase schema

**Files:**
- No app code — run SQL in Supabase dashboard

- [ ] **Step 1: Create Clerk JWT template in Supabase**

  In Supabase dashboard → Authentication → JWT Templates → Add new template → Choose "Clerk". This lets Supabase verify Clerk JWTs so `auth.uid()` returns the Clerk user ID in RLS policies.

  Copy the JWKS endpoint URL shown — you'll need it in Clerk dashboard next.

- [ ] **Step 2: Add Supabase JWT URL to Clerk**

  In Clerk dashboard → JWT Templates → Add template → Supabase. Paste the JWKS endpoint from Step 1. Name it `supabase`.

- [ ] **Step 3: Run schema SQL in Supabase SQL editor**

  Go to Supabase → SQL Editor → New query. Paste and run:
  ```sql
  -- Users table (synced from Clerk)
  create table if not exists public.users (
    id                   text primary key,
    email                text not null,
    plan                 text not null default 'free'
                         check (plan in ('free', 'pro', 'business')),
    trial_ends           timestamptz,
    ls_customer_id       text,
    ls_subscription_id   text,
    created_at           timestamptz default now()
  );

  -- Draw history (Pro+ only)
  create table if not exists public.draws (
    id          uuid primary key default gen_random_uuid(),
    user_id     text not null references public.users(id) on delete cascade,
    title       text not null default 'Untitled Draw',
    entries     text[] not null,
    winners     text[] not null,
    drawn_at    timestamptz default now()
  );

  -- RLS: users see only their own draws
  alter table public.draws enable row level security;

  create policy "users_own_draws" on public.draws
    for all
    using (user_id = (auth.jwt() ->> 'sub'));
  ```

  > Note: We use `auth.jwt() ->> 'sub'` rather than `auth.uid()` because Clerk JWTs store the user ID in the `sub` claim.

- [ ] **Step 4: Verify tables exist**

  In Supabase → Table Editor, confirm `users` and `draws` tables are visible.

- [ ] **Step 5: Commit**
  ```bash
  git add .
  git commit -m "chore: document Supabase schema setup"
  ```

---

## Task 4: Supabase client + feature gate

**Files:**
- Create: `lib/supabase.ts`
- Create: `lib/supabase-admin.ts`
- Create: `lib/plan.ts`
- Create: `lib/__tests__/plan.test.ts`

- [ ] **Step 1: Write failing test for `canUse()`**

  Create `lib/__tests__/plan.test.ts`:
  ```ts
  import { canUse } from '@/lib/plan';

  describe('canUse', () => {
    it('free plan cannot use any pro feature', () => {
      expect(canUse('export', 'free')).toBe(false);
      expect(canUse('history', 'free')).toBe(false);
      expect(canUse('unlimited', 'free')).toBe(false);
      expect(canUse('noad', 'free')).toBe(false);
      expect(canUse('whitelabel', 'free')).toBe(false);
      expect(canUse('api', 'free')).toBe(false);
    });

    it('pro plan can use pro features', () => {
      expect(canUse('export', 'pro')).toBe(true);
      expect(canUse('history', 'pro')).toBe(true);
      expect(canUse('unlimited', 'pro')).toBe(true);
      expect(canUse('noad', 'pro')).toBe(true);
    });

    it('pro plan cannot use business-only features', () => {
      expect(canUse('whitelabel', 'pro')).toBe(false);
      expect(canUse('api', 'pro')).toBe(false);
    });

    it('business plan can use all features', () => {
      expect(canUse('export', 'business')).toBe(true);
      expect(canUse('history', 'business')).toBe(true);
      expect(canUse('unlimited', 'business')).toBe(true);
      expect(canUse('noad', 'business')).toBe(true);
      expect(canUse('whitelabel', 'business')).toBe(true);
      expect(canUse('api', 'business')).toBe(true);
    });
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  ```bash
  npx jest lib/__tests__/plan.test.ts
  ```
  Expected: FAIL — `Cannot find module '@/lib/plan'`

- [ ] **Step 3: Create `lib/plan.ts`**
  ```ts
  type Feature = 'export' | 'history' | 'unlimited' | 'noad' | 'whitelabel' | 'api';
  type Plan = 'free' | 'pro' | 'business';

  const PRO_FEATURES: Feature[] = ['export', 'history', 'unlimited', 'noad'];

  export function canUse(feature: Feature, plan: Plan): boolean {
    if (plan === 'business') return true;
    if (plan === 'pro') return PRO_FEATURES.includes(feature);
    return false;
  }
  ```

- [ ] **Step 4: Run test to verify it passes**
  ```bash
  npx jest lib/__tests__/plan.test.ts
  ```
  Expected: PASS — 4 test groups all pass.

- [ ] **Step 5: Create `lib/supabase.ts`** (browser client)
  ```ts
  import { createClient } from '@supabase/supabase-js';

  export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  ```

- [ ] **Step 6: Create `lib/supabase-admin.ts`** (server-only, service role)
  ```ts
  import { createClient } from '@supabase/supabase-js';

  // Only use this in server-side code (API routes, Server Components)
  // Never import this in client components
  export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  ```

- [ ] **Step 7: Commit**
  ```bash
  git add lib/plan.ts lib/supabase.ts lib/supabase-admin.ts lib/__tests__/plan.test.ts
  git commit -m "feat: add feature gate canUse() and Supabase clients"
  ```

---

## Task 5: Clerk auth — middleware + layout

**Files:**
- Create: `middleware.ts`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create `middleware.ts`**
  ```ts
  import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

  const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

  export default clerkMiddleware((auth, req) => {
    if (isProtectedRoute(req)) {
      auth().protect();
    }
  });

  export const config = {
    matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
  };
  ```

- [ ] **Step 2: Update `app/layout.tsx`**
  ```tsx
  import type { Metadata } from 'next';
  import { ClerkProvider } from '@clerk/nextjs';
  import './globals.css';

  export const metadata: Metadata = {
    title: 'Lucky Draw Online Generator | Free Random Winner Picker Tool',
    description: 'Use our free lucky draw online generator to pick random winners instantly. Best random name picker, raffle generator & contest draw tool.',
  };

  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <ClerkProvider>
        <html lang="en">
          <body>{children}</body>
        </html>
      </ClerkProvider>
    );
  }
  ```

- [ ] **Step 3: Verify build**
  ```bash
  npm run build
  ```
  Expected: build passes. If Clerk keys are missing from `.env.local`, add them now.

- [ ] **Step 4: Commit**
  ```bash
  git add middleware.ts app/layout.tsx
  git commit -m "feat: add Clerk auth middleware and ClerkProvider layout"
  ```

---

## Task 6: Clerk webhook — sync users to Supabase

**Files:**
- Create: `app/api/webhooks/clerk/route.ts`
- Create: `app/api/webhooks/clerk/__tests__/route.test.ts`

- [ ] **Step 1: Write failing test**

  Create `app/api/webhooks/clerk/__tests__/route.test.ts`:
  ```ts
  jest.mock('@/lib/supabase-admin', () => ({
    supabaseAdmin: {
      from: jest.fn().mockReturnValue({
        upsert: jest.fn().mockResolvedValue({ error: null }),
      }),
    },
  }));

  // Mock svix header verification
  jest.mock('svix', () => ({
    Webhook: jest.fn().mockImplementation(() => ({
      verify: jest.fn().mockReturnValue({
        type: 'user.created',
        data: {
          id: 'user_abc123',
          email_addresses: [{ email_address: 'test@example.com' }],
        },
      }),
    })),
  }));

  import { POST } from '@/app/api/webhooks/clerk/route';

  describe('POST /api/webhooks/clerk', () => {
    it('returns 400 when svix headers missing', async () => {
      const req = new Request('http://localhost/api/webhooks/clerk', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  ```bash
  npx jest app/api/webhooks/clerk/__tests__/route.test.ts
  ```
  Expected: FAIL — `Cannot find module '@/app/api/webhooks/clerk/route'`

- [ ] **Step 3: Create `app/api/webhooks/clerk/route.ts`**
  ```ts
  import { Webhook } from 'svix';
  import { headers } from 'next/headers';
  import { supabaseAdmin } from '@/lib/supabase-admin';

  export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) return new Response('Missing webhook secret', { status: 500 });

    const headerPayload = headers();
    const svixId = headerPayload.get('svix-id');
    const svixTimestamp = headerPayload.get('svix-timestamp');
    const svixSignature = headerPayload.get('svix-signature');

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response('Missing svix headers', { status: 400 });
    }

    const payload = await req.text();
    const wh = new Webhook(WEBHOOK_SECRET);

    let event: { type: string; data: { id: string; email_addresses: { email_address: string }[] } };
    try {
      event = wh.verify(payload, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as typeof event;
    } catch {
      return new Response('Invalid signature', { status: 400 });
    }

    if (event.type === 'user.created') {
      const { id, email_addresses } = event.data;
      const email = email_addresses[0]?.email_address ?? '';
      await supabaseAdmin.from('users').upsert({ id, email, plan: 'free' });
    }

    return Response.json({ ok: true });
  }
  ```

- [ ] **Step 4: Install svix**
  ```bash
  npm install svix
  ```

- [ ] **Step 5: Run test to verify it passes**
  ```bash
  npx jest app/api/webhooks/clerk/__tests__/route.test.ts
  ```
  Expected: PASS

- [ ] **Step 6: Register webhook in Clerk dashboard**

  Clerk Dashboard → Webhooks → Add endpoint:
  - URL: `https://your-vercel-preview.vercel.app/api/webhooks/clerk`
  - Events: `user.created`
  - Copy the signing secret → paste into `.env.local` as `CLERK_WEBHOOK_SECRET`

- [ ] **Step 7: Commit**
  ```bash
  git add app/api/webhooks/clerk/
  git commit -m "feat: Clerk user.created webhook syncs user to Supabase"
  ```

---

## Task 7: Lemon Squeezy — create products + webhook handler

**Files:**
- Create: `app/api/webhooks/ls/route.ts`
- Create: `app/api/webhooks/ls/__tests__/route.test.ts`

**Prerequisite — create products in Lemon Squeezy:**
1. Log in at https://app.lemonsqueezy.com
2. Products → Add product → "Pro Plan" → $9/mo recurring, $79/yr recurring
   - Enable trial: 7 days, card required
   - In checkout settings, add custom field: `clerk_user_id` (pass via checkout URL param)
   - Copy the checkout URLs → paste into `.env.local` as `NEXT_PUBLIC_LS_PRO_MONTHLY_URL` and `NEXT_PUBLIC_LS_PRO_ANNUAL_URL`
3. Repeat for "Business Plan" → $49/mo, $399/yr
4. Webhooks → Add webhook → URL: `https://your-vercel-preview.vercel.app/api/webhooks/ls`
   - Events: `subscription_created`, `subscription_updated`, `subscription_cancelled`
   - Copy signing secret → paste into `.env.local` as `LEMONSQUEEZY_WEBHOOK_SECRET`

- [ ] **Step 1: Write failing tests**

  Create `app/api/webhooks/ls/__tests__/route.test.ts`:
  ```ts
  const mockUpdate = jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) });
  jest.mock('@/lib/supabase-admin', () => ({
    supabaseAdmin: { from: jest.fn().mockReturnValue({ update: mockUpdate }) },
  }));

  // Bypass signature verification in tests
  jest.mock('crypto', () => ({
    ...jest.requireActual('crypto'),
    createHmac: jest.fn().mockReturnValue({
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('valid-sig'),
    }),
  }));

  import { POST } from '@/app/api/webhooks/ls/route';

  const makeRequest = (body: object, sig = 'valid-sig') =>
    new Request('http://localhost/api/webhooks/ls', {
      method: 'POST',
      headers: { 'x-signature': sig },
      body: JSON.stringify(body),
    });

  describe('POST /api/webhooks/ls', () => {
    beforeEach(() => jest.clearAllMocks());

    it('sets plan to pro on subscription_created for Pro product', async () => {
      const req = makeRequest({
        meta: { event_name: 'subscription_created' },
        data: {
          id: 'sub_123',
          attributes: {
            product_name: 'Pro Plan',
            trial_ends_at: '2026-06-16T00:00:00Z',
            custom_data: { clerk_user_id: 'user_abc' },
          },
        },
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ plan: 'pro' })
      );
    });

    it('sets plan to business on subscription_created for Business product', async () => {
      const req = makeRequest({
        meta: { event_name: 'subscription_created' },
        data: {
          id: 'sub_456',
          attributes: {
            product_name: 'Business Plan',
            trial_ends_at: null,
            custom_data: { clerk_user_id: 'user_xyz' },
          },
        },
      });
      const res = await POST(req);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ plan: 'business' })
      );
    });

    it('resets plan to free on subscription_cancelled', async () => {
      const req = makeRequest({
        meta: { event_name: 'subscription_cancelled' },
        data: {
          attributes: {
            custom_data: { clerk_user_id: 'user_abc' },
          },
        },
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      expect(mockUpdate).toHaveBeenCalledWith({ plan: 'free' });
    });
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  ```bash
  npx jest app/api/webhooks/ls/__tests__/route.test.ts
  ```
  Expected: FAIL — `Cannot find module '@/app/api/webhooks/ls/route'`

- [ ] **Step 3: Create `app/api/webhooks/ls/route.ts`**
  ```ts
  import crypto from 'crypto';
  import { supabaseAdmin } from '@/lib/supabase-admin';

  function verifySignature(payload: string, signature: string): boolean {
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
    const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    return hmac === signature;
  }

  export async function POST(req: Request) {
    const signature = req.headers.get('x-signature') ?? '';
    const payload = await req.text();

    if (!verifySignature(payload, signature)) {
      return new Response('Invalid signature', { status: 401 });
    }

    const { meta, data } = JSON.parse(payload) as {
      meta: { event_name: string };
      data: {
        id?: string;
        attributes: {
          product_name?: string;
          trial_ends_at?: string | null;
          custom_data: { clerk_user_id: string };
        };
      };
    };

    const userId = data.attributes.custom_data.clerk_user_id;

    if (meta.event_name === 'subscription_created' || meta.event_name === 'subscription_updated') {
      const plan = data.attributes.product_name?.toLowerCase().includes('business') ? 'business' : 'pro';
      const trialEnds = data.attributes.trial_ends_at
        ? new Date(data.attributes.trial_ends_at).toISOString()
        : null;
      await supabaseAdmin
        .from('users')
        .update({ plan, ls_subscription_id: data.id ?? null, trial_ends: trialEnds })
        .eq('id', userId);
    }

    if (meta.event_name === 'subscription_cancelled') {
      await supabaseAdmin.from('users').update({ plan: 'free' }).eq('id', userId);
    }

    return Response.json({ ok: true });
  }
  ```

- [ ] **Step 4: Run test to verify it passes**
  ```bash
  npx jest app/api/webhooks/ls/__tests__/route.test.ts
  ```
  Expected: PASS — 3 tests pass.

- [ ] **Step 5: Commit**
  ```bash
  git add app/api/webhooks/ls/
  git commit -m "feat: Lemon Squeezy webhook handler updates user plan in Supabase"
  ```

---

## Task 8: NavBar component

**Files:**
- Create: `components/NavBar.tsx`
- Create: `components/__tests__/NavBar.test.tsx`

- [ ] **Step 1: Write failing test**

  Create `components/__tests__/NavBar.test.tsx`:
  ```tsx
  import { render, screen } from '@testing-library/react';
  import NavBar from '@/components/NavBar';

  // Mock Clerk components
  jest.mock('@clerk/nextjs', () => ({
    SignInButton: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    UserButton: () => <div data-testid="user-button" />,
    SignedIn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    SignedOut: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  }));

  describe('NavBar', () => {
    it('renders site logo link', () => {
      render(<NavBar />);
      expect(screen.getByRole('link', { name: /luckydraw/i })).toBeInTheDocument();
    });

    it('renders nav links', () => {
      render(<NavBar />);
      expect(screen.getByRole('link', { name: /pricing/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /faq/i })).toBeInTheDocument();
    });
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  ```bash
  npx jest components/__tests__/NavBar.test.tsx
  ```
  Expected: FAIL — `Cannot find module '@/components/NavBar'`

- [ ] **Step 3: Create `components/NavBar.tsx`**
  ```tsx
  import Link from 'next/link';
  import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

  export default function NavBar() {
    return (
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <Link href="/" className="font-bold text-xl text-blue-600">
          LuckyDraw.me
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/pricing" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
            Pricing
          </Link>
          <Link href="/faq" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
            FAQ
          </Link>
          <Link href="/list" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
            Get Listed
          </Link>
          <SignedIn>
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
              Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </nav>
    );
  }
  ```

- [ ] **Step 4: Run test to verify it passes**
  ```bash
  npx jest components/__tests__/NavBar.test.tsx
  ```
  Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add components/NavBar.tsx components/__tests__/NavBar.test.tsx
  git commit -m "feat: add NavBar with Clerk auth buttons"
  ```

---

## Task 9: UpgradePrompt component

**Files:**
- Create: `components/UpgradePrompt.tsx`
- Create: `components/__tests__/UpgradePrompt.test.tsx`

- [ ] **Step 1: Write failing test**

  Create `components/__tests__/UpgradePrompt.test.tsx`:
  ```tsx
  import { render, screen, fireEvent } from '@testing-library/react';
  import UpgradePrompt from '@/components/UpgradePrompt';

  describe('UpgradePrompt', () => {
    it('renders the upgrade message', () => {
      render(<UpgradePrompt feature="unlimited" onClose={() => {}} />);
      expect(screen.getByText(/upgrade to pro/i)).toBeInTheDocument();
    });

    it('calls onClose when close button clicked', () => {
      const onClose = jest.fn();
      render(<UpgradePrompt feature="unlimited" onClose={onClose} />);
      fireEvent.click(screen.getByRole('button', { name: /close/i }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('has a link to /pricing', () => {
      render(<UpgradePrompt feature="export" onClose={() => {}} />);
      expect(screen.getByRole('link', { name: /see pricing/i })).toHaveAttribute('href', '/pricing');
    });
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  ```bash
  npx jest components/__tests__/UpgradePrompt.test.tsx
  ```
  Expected: FAIL

- [ ] **Step 3: Create `components/UpgradePrompt.tsx`**
  ```tsx
  import Link from 'next/link';

  type Feature = 'export' | 'history' | 'unlimited' | 'noad' | 'whitelabel' | 'api';

  const MESSAGES: Record<Feature, string> = {
    unlimited: 'You\'ve reached the 50-entry limit. Upgrade to Pro for unlimited entries.',
    export: 'Export results as PDF or CSV — available on Pro and above.',
    history: 'Save and revisit your draw history — available on Pro and above.',
    noad: 'Enjoy an ad-free experience — available on Pro and above.',
    whitelabel: 'Remove LuckyDraw.me branding — available on Business plan.',
    api: 'API access is available on the Business plan.',
  };

  interface UpgradePromptProps {
    feature: Feature;
    onClose: () => void;
  }

  export default function UpgradePrompt({ feature, onClose }: UpgradePromptProps) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Upgrade to Pro</h2>
          <p className="text-gray-600 mb-6">{MESSAGES[feature]}</p>
          <div className="flex gap-3">
            <Link
              href="/pricing"
              className="flex-1 bg-indigo-600 text-white text-center py-3 rounded-xl font-semibold hover:bg-indigo-700"
            >
              See Pricing
            </Link>
            <button
              onClick={onClose}
              aria-label="Close"
              className="px-4 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 4: Run test to verify it passes**
  ```bash
  npx jest components/__tests__/UpgradePrompt.test.tsx
  ```
  Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add components/UpgradePrompt.tsx components/__tests__/UpgradePrompt.test.tsx
  git commit -m "feat: add UpgradePrompt modal component"
  ```

---

## Task 10: DrawTool component (port from CRA + feature gates)

**Files:**
- Create: `components/DrawTool.tsx`
- Create: `components/__tests__/DrawTool.test.tsx`

This is the core draw tool ported from `src/pages/home/Home.js` in the old CRA app.

- [ ] **Step 1: Read the original CRA Home.js**

  Read `/Users/jason/Documents/Projects/Personal/reactjs-lucky-draw/src/pages/home/Home.js` to understand the current draw logic before porting.

- [ ] **Step 2: Write failing tests**

  Create `components/__tests__/DrawTool.test.tsx`:
  ```tsx
  import { render, screen, fireEvent } from '@testing-library/react';
  import DrawTool from '@/components/DrawTool';

  describe('DrawTool', () => {
    it('renders the entry textarea', () => {
      render(<DrawTool plan="free" />);
      expect(screen.getByPlaceholderText(/enter names/i)).toBeInTheDocument();
    });

    it('shows upgrade prompt when free user has more than 50 entries', () => {
      render(<DrawTool plan="free" />);
      const textarea = screen.getByPlaceholderText(/enter names/i);
      // 51 entries, one per line
      const entries = Array.from({ length: 51 }, (_, i) => `Person ${i + 1}`).join('\n');
      fireEvent.change(textarea, { target: { value: entries } });
      fireEvent.click(screen.getByRole('button', { name: /draw/i }));
      expect(screen.getByText(/upgrade to pro/i)).toBeInTheDocument();
    });

    it('draws a winner from entries for pro user', () => {
      render(<DrawTool plan="pro" />);
      const textarea = screen.getByPlaceholderText(/enter names/i);
      fireEvent.change(textarea, { target: { value: 'Alice\nBob\nCharlie' } });
      fireEvent.click(screen.getByRole('button', { name: /draw/i }));
      // Winner should be one of the entries
      const winner = screen.getByTestId('winner-display');
      expect(['Alice', 'Bob', 'Charlie']).toContain(winner.textContent);
    });

    it('does not show ads for pro user', () => {
      const { container } = render(<DrawTool plan="pro" />);
      expect(container.querySelector('[data-ad]')).not.toBeInTheDocument();
    });
  });
  ```

- [ ] **Step 3: Run test to verify it fails**
  ```bash
  npx jest components/__tests__/DrawTool.test.tsx
  ```
  Expected: FAIL — `Cannot find module '@/components/DrawTool'`

- [ ] **Step 4: Create `components/DrawTool.tsx`**

  Create `components/DrawTool.tsx` — port the draw logic from the old CRA `Home.js`, wrapping it in a client component with feature gates:
  ```tsx
  'use client';

  import { useState } from 'react';
  import { canUse } from '@/lib/plan';
  import UpgradePrompt from '@/components/UpgradePrompt';

  const FREE_ENTRY_LIMIT = 50;

  interface DrawToolProps {
    plan: 'free' | 'pro' | 'business';
    onDrawComplete?: (entries: string[], winners: string[]) => void;
  }

  export default function DrawTool({ plan, onDrawComplete }: DrawToolProps) {
    const [entriesText, setEntriesText] = useState('');
    const [winner, setWinner] = useState<string | null>(null);
    const [previousWinners, setPreviousWinners] = useState<string[]>([]);
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [upgradeFeature, setUpgradeFeature] = useState<'unlimited' | 'export' | 'history' | 'noad' | 'whitelabel' | 'api'>('unlimited');

    const entries = entriesText
      .split('\n')
      .map((e) => e.trim())
      .filter(Boolean);

    function handleDraw() {
      if (!canUse('unlimited', plan) && entries.length > FREE_ENTRY_LIMIT) {
        setUpgradeFeature('unlimited');
        setShowUpgrade(true);
        return;
      }

      const available = entries.filter((e) => !previousWinners.includes(e));
      if (available.length === 0) return;

      const drawn = available[Math.floor(Math.random() * available.length)];
      setWinner(drawn);
      const newWinners = [...previousWinners, drawn];
      setPreviousWinners(newWinners);
      onDrawComplete?.(entries, newWinners);
    }

    function handleExport() {
      if (!canUse('export', plan)) {
        setUpgradeFeature('export');
        setShowUpgrade(true);
        return;
      }
      // Export handled by parent via /api/export
      window.location.href = '/api/export?format=csv';
    }

    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lucky Draw Online Generator</h1>
        <p className="text-gray-500 mb-6">Enter names below, one per line, then click Draw.</p>

        <textarea
          className="w-full h-40 border border-gray-300 rounded-xl p-4 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Enter names, one per line..."
          value={entriesText}
          onChange={(e) => setEntriesText(e.target.value)}
        />

        {!canUse('unlimited', plan) && (
          <p className="text-xs text-gray-400 mt-1">
            {entries.length}/{FREE_ENTRY_LIMIT} entries (free tier limit)
          </p>
        )}

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleDraw}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
          >
            Draw Winner
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 text-sm"
          >
            Export
          </button>
        </div>

        {winner && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-1">Winner</p>
            <p
              data-testid="winner-display"
              className="text-4xl font-bold text-indigo-600"
            >
              {winner}
            </p>
          </div>
        )}

        {previousWinners.length > 1 && (
          <div className="mt-6">
            <p className="text-sm font-medium text-gray-500 mb-2">Previously drawn</p>
            <ul className="flex flex-wrap gap-2">
              {previousWinners.slice(0, -1).map((w) => (
                <li key={w} className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
                  {w}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!canUse('noad', plan) && (
          <div data-ad className="mt-8 text-center text-gray-400 text-xs border border-dashed border-gray-200 rounded-xl p-4">
            {/* Ezoic ad unit rendered here */}
            <div id="ezoic-pub-ad-placeholder-draw-tool"></div>
          </div>
        )}

        {showUpgrade && (
          <UpgradePrompt feature={upgradeFeature} onClose={() => setShowUpgrade(false)} />
        )}
      </div>
    );
  }
  ```

- [ ] **Step 5: Run test to verify it passes**
  ```bash
  npx jest components/__tests__/DrawTool.test.tsx
  ```
  Expected: PASS — all 4 tests pass.

- [ ] **Step 6: Commit**
  ```bash
  git add components/DrawTool.tsx components/__tests__/DrawTool.test.tsx
  git commit -m "feat: port DrawTool with Pro feature gates and upgrade prompts"
  ```

---

## Task 11: PricingCards component

**Files:**
- Create: `components/PricingCards.tsx`
- Create: `components/__tests__/PricingCards.test.tsx`

- [ ] **Step 1: Write failing tests**

  Create `components/__tests__/PricingCards.test.tsx`:
  ```tsx
  import { render, screen, fireEvent } from '@testing-library/react';
  import PricingCards from '@/components/PricingCards';

  describe('PricingCards', () => {
    it('shows all three tiers', () => {
      render(<PricingCards />);
      expect(screen.getByText('Free')).toBeInTheDocument();
      expect(screen.getByText('Pro')).toBeInTheDocument();
      expect(screen.getByText('Business')).toBeInTheDocument();
    });

    it('shows monthly prices by default', () => {
      render(<PricingCards />);
      expect(screen.getByText('$9')).toBeInTheDocument();
      expect(screen.getByText('$49')).toBeInTheDocument();
    });

    it('toggles to annual pricing', () => {
      render(<PricingCards />);
      fireEvent.click(screen.getByRole('button', { name: /annual/i }));
      expect(screen.getByText('$79')).toBeInTheDocument();
      expect(screen.getByText('$399')).toBeInTheDocument();
    });

    it('Pro card has Popular badge', () => {
      render(<PricingCards />);
      expect(screen.getByText(/popular/i)).toBeInTheDocument();
    });
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  ```bash
  npx jest components/__tests__/PricingCards.test.tsx
  ```
  Expected: FAIL

- [ ] **Step 3: Create `components/PricingCards.tsx`**
  ```tsx
  'use client';

  import { useState } from 'react';
  import Link from 'next/link';

  const TIERS = [
    {
      name: 'Free',
      monthly: 0,
      annual: 0,
      description: 'For casual use',
      features: ['50 entries per draw', '1 winner per draw', 'Basic draw tool'],
      missing: ['Export PDF/CSV', 'Draw history', 'Ad-free'],
      cta: 'Current plan',
      ctaHref: '/',
      highlight: false,
    },
    {
      name: 'Pro',
      monthly: 9,
      annual: 79,
      description: 'For power users & creators',
      badge: 'Popular',
      features: [
        'Unlimited entries',
        'Unlimited winners',
        'Export PDF/CSV',
        '30-day draw history',
        'Ad-free experience',
      ],
      missing: [],
      cta: 'Start free trial',
      ctaHrefMonthly: process.env.NEXT_PUBLIC_LS_PRO_MONTHLY_URL ?? '/pricing',
      ctaHrefAnnual: process.env.NEXT_PUBLIC_LS_PRO_ANNUAL_URL ?? '/pricing',
      highlight: true,
    },
    {
      name: 'Business',
      monthly: 49,
      annual: 399,
      description: 'For teams & enterprises',
      features: [
        'Everything in Pro',
        'White-label branding',
        'Shareable private URL',
        'API access',
        '5 team seats',
        '1-year draw history',
      ],
      missing: [],
      cta: 'Start free trial',
      ctaHrefMonthly: process.env.NEXT_PUBLIC_LS_BUSINESS_MONTHLY_URL ?? '/pricing',
      ctaHrefAnnual: process.env.NEXT_PUBLIC_LS_BUSINESS_ANNUAL_URL ?? '/pricing',
      highlight: false,
    },
  ];

  export default function PricingCards() {
    const [annual, setAnnual] = useState(false);

    return (
      <div>
        {/* Billing toggle */}
        <div className="flex justify-center gap-3 mb-10">
          <button
            onClick={() => setAnnual(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${!annual ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            aria-label="Annual"
            className={`px-4 py-2 rounded-lg text-sm font-medium ${annual ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            Annual <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Save 27%</span>
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {TIERS.map((tier) => {
            const price = annual ? tier.annual : tier.monthly;
            const ctaHref = tier.name === 'Free'
              ? tier.ctaHref
              : annual
              ? (tier as { ctaHrefAnnual: string }).ctaHrefAnnual
              : (tier as { ctaHrefMonthly: string }).ctaHrefMonthly;

            return (
              <div
                key={tier.name}
                className={`relative rounded-2xl p-8 border-2 ${tier.highlight ? 'border-indigo-500 shadow-lg' : 'border-gray-200'}`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                    {tier.badge}
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
                  <p className="text-gray-500 text-sm mt-1">{tier.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-extrabold text-gray-900">${price}</span>
                    {price > 0 && (
                      <span className="text-gray-400 text-sm ml-1">/{annual ? 'yr' : 'mo'}</span>
                    )}
                    {price === 0 && <span className="text-gray-400 text-sm ml-1">/forever</span>}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-500 font-bold mt-0.5">✓</span> {f}
                    </li>
                  ))}
                  {tier.missing?.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="mt-0.5">✗</span> {f}
                    </li>
                  ))}
                </ul>

                <Link
                  href={ctaHref ?? '/pricing'}
                  className={`block text-center py-3 rounded-xl font-semibold text-sm transition ${
                    tier.highlight
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : tier.name === 'Business'
                      ? 'bg-gray-900 text-white hover:bg-gray-800'
                      : 'bg-gray-100 text-gray-600 cursor-default'
                  }`}
                >
                  {tier.cta}
                </Link>

                {tier.name !== 'Free' && (
                  <p className="text-center text-xs text-gray-400 mt-2">7-day free trial, card required</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 4: Run test to verify it passes**
  ```bash
  npx jest components/__tests__/PricingCards.test.tsx
  ```
  Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add components/PricingCards.tsx components/__tests__/PricingCards.test.tsx
  git commit -m "feat: add PricingCards with monthly/annual toggle"
  ```

---

## Task 12: Page routes

**Files:**
- Create: `app/page.tsx`
- Create: `app/pricing/page.tsx`
- Create: `app/faq/page.tsx`
- Create: `app/list/page.tsx`

- [ ] **Step 1: Create `app/page.tsx`** (home — draws the draw tool)
  ```tsx
  import type { Metadata } from 'next';
  import { auth } from '@clerk/nextjs/server';
  import { supabaseAdmin } from '@/lib/supabase-admin';
  import DrawTool from '@/components/DrawTool';
  import NavBar from '@/components/NavBar';

  export const metadata: Metadata = {
    title: 'Lucky Draw Online Generator | Free Random Winner Picker Tool',
    description: 'Use our free lucky draw online generator to pick random winners instantly. Best random name picker, raffle generator & contest draw tool. Fair, fast & transparent — no registration needed.',
    alternates: { canonical: 'https://luckydraw.me' },
    openGraph: {
      title: 'Lucky Draw Online Generator — Free Random Winner Picker',
      description: 'Use our free lucky draw online generator to instantly select random winners for raffles, giveaways, contests & events.',
      url: 'https://luckydraw.me',
      images: [{ url: 'https://luckydraw.me/images/luckydraw-share.png', width: 1200, height: 630 }],
    },
  };

  export default async function HomePage() {
    const { userId } = auth();
    let plan: 'free' | 'pro' | 'business' = 'free';

    if (userId) {
      const { data } = await supabaseAdmin.from('users').select('plan').eq('id', userId).single();
      plan = (data?.plan as typeof plan) ?? 'free';
    }

    return (
      <>
        <NavBar />
        <main className="min-h-screen bg-gray-50 py-12">
          <DrawTool plan={plan} />
        </main>
      </>
    );
  }
  ```

- [ ] **Step 2: Create `app/pricing/page.tsx`**
  ```tsx
  import type { Metadata } from 'next';
  import NavBar from '@/components/NavBar';
  import PricingCards from '@/components/PricingCards';

  export const metadata: Metadata = {
    title: 'Pricing | LuckyDraw.me',
    description: 'Free, Pro ($9/mo), and Business ($49/mo) plans. Start with a 7-day free trial.',
    alternates: { canonical: 'https://luckydraw.me/pricing' },
  };

  export default function PricingPage() {
    return (
      <>
        <NavBar />
        <main className="min-h-screen bg-gray-50 py-20 px-4">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-extrabold text-gray-900 mb-4">Simple, honest pricing</h1>
            <p className="text-xl text-gray-500">Start free. Upgrade when you need more.</p>
          </div>
          <PricingCards />
        </main>
      </>
    );
  }
  ```

- [ ] **Step 3: Create `app/faq/page.tsx`**

  Port the FAQ content from the old CRA `src/pages/faq/Faq.js`. Use Next.js Metadata API instead of React Helmet:
  ```tsx
  import type { Metadata } from 'next';
  import NavBar from '@/components/NavBar';

  export const metadata: Metadata = {
    title: 'FAQ | Lucky Draw Online Generator | LuckyDraw.me',
    description: 'Frequently asked questions about LuckyDraw.me — the free online lucky draw generator.',
    alternates: { canonical: 'https://luckydraw.me/faq' },
  };

  // Port ALL FAQ items from src/components/FaqSection/index.jsx (13 questions total)
  const FAQS = [
    { q: 'What tools can I use to do a lucky draw?', a: 'LuckyDraw.me is the most trusted and widely used lucky draw online generator. It is free, requires no registration, and works on all devices. Simply visit luckydraw.me, enter your participant names one per line, and click Draw to instantly select a random winner.' },
    { q: 'What is a lucky draw tool?', a: 'A lucky draw tool, also known as a random picker or random name picker, is a digital software or online platform designed for randomly selecting winners in contests, raffles, giveaways, or events. It ensures fair and transparent winner selection using random number generation algorithms. LuckyDraw.me is the leading free lucky draw online generator trusted by thousands worldwide.' },
    { q: 'How does a lucky draw tool work?', a: 'Users input participant names or items, one per line, into the lucky draw generator. They configure preferences such as animation speed and whether to remove drawn items. When the Draw button is clicked, the random picker algorithm instantly selects a winner. The result is displayed immediately with a visual celebration.' },
    { q: 'How does a lucky draw work?', a: 'A lucky draw is a competition where participants are given equal chances of winning a prize through random selection. In an online lucky draw generator, each participant name is entered into the tool, and the generator randomly picks a winner from the full list. Every entry has the same probability of being selected, ensuring a fair and unbiased outcome.' },
    { q: 'How can I ensure that the tool is fair and random?', a: 'LuckyDraw.me uses a cryptographically-seeded random number generator built into your browser, providing statistically uniform random selection. Every participant has an equal probability of being drawn. The drawing process is displayed visually in real time, so all participants can witness the selection. No data is stored or manipulated on any server.' },
    { q: 'Does the tool support multiple winners?', a: 'Yes, LuckyDraw.me supports selecting multiple winners per session. Enable the Remove Drawn Item option to ensure previously selected winners are excluded from future draws. You can continue clicking Draw until all required winners have been selected.' },
    { q: 'How do you hold a lucky draw?', a: 'To hold a lucky draw online, collect your participants\' names or entries, then paste them into LuckyDraw.me one per line. Configure whether to show animation and whether to remove drawn names. Click Draw to randomly select winners instantly. The process is fully transparent and can be screen-recorded or livestreamed for added credibility.' },
    { q: 'What is a good lucky draw prize?', a: 'Popular lucky draw prizes include electronic devices such as smartphones, tablets, and earbuds, gift cards and vouchers, travel vouchers, gift baskets, seasonal products, and cash prizes. The best prizes are ones that appeal broadly to your audience and have clear monetary value, ensuring strong participation in your lucky draw.' },
    { q: 'How secure is LuckyDraw.me for storing data?', a: 'LuckyDraw.me does not store any participant data entered into the tool. All processing happens locally in your browser. No names, entries, or draw results are transmitted to or saved on any server. Your data remains completely private and is cleared when you close or refresh the page.' },
    { q: 'What are popular lucky draw tools?', a: 'The most popular lucky draw online generator is LuckyDraw.me, trusted by over 689,840 users worldwide with a 5-star rating. Other options include RandomPicker and Comment Picker. LuckyDraw.me stands out for its completely free unlimited access, no registration requirement, multiple winner support, and transparent real-time drawing animation.' },
    { q: 'What is a lucky draw online generator?', a: 'A lucky draw online generator is a free web-based tool that randomly selects winners from a list of participants. It uses a random number generation algorithm to ensure every participant has an equal and fair chance of winning. LuckyDraw.me is one of the most trusted lucky draw online generators, used by over 689,840 users worldwide for raffles, giveaways, contests, and events.' },
    { q: 'Can I use the lucky draw generator for Instagram giveaways?', a: 'Absolutely. Our lucky draw online generator is one of the most popular tools for Instagram giveaways. Copy all participant usernames or comments, paste them into the generator one per line, and click Draw to pick a winner instantly. Many creators screen-record the draw to share with followers as proof of a fair and transparent selection.' },
    { q: 'Is the lucky draw generator suitable for corporate events and team building?', a: 'Yes, our lucky draw online generator is widely used at corporate events, team-building activities, office parties, and company raffles. It works for any size of event — from small team gatherings of 10 people to large company-wide draws with hundreds of participants. Simply import your employee or attendee list and run the lucky draw generator on a projected screen for everyone to see.' },
  ];

  export default function FaqPage() {
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQS.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    };

    return (
      <>
        <NavBar />
        <main className="min-h-screen bg-gray-50 py-16 px-4">
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-10">Frequently Asked Questions</h1>
            <div className="space-y-6">
              {FAQS.map(({ q, a }) => (
                <div key={q} className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="font-semibold text-gray-900 mb-2">{q}</h2>
                  <p className="text-gray-600 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </>
    );
  }
  ```

- [ ] **Step 4: Create `app/list/page.tsx`**

  Port the sponsor listing page with Stripe tiers (same content as quick-wins plan):
  ```tsx
  import type { Metadata } from 'next';
  import NavBar from '@/components/NavBar';

  export const metadata: Metadata = {
    title: 'List Your Business | Get High-Quality Backlinks | LuckyDraw.me',
    description: 'Get your company listed on LuckyDraw.me for premium SEO backlinks. Join 689,840+ monthly visitors and boost your search rankings.',
    alternates: { canonical: 'https://luckydraw.me/list' },
  };

  const TIERS = [
    { name: 'Gold', price: '$99', description: 'Listed entry with nofollow link to your site.', envKey: 'NEXT_PUBLIC_STRIPE_GOLD_URL' as const },
    { name: 'Platinum', price: '$299', description: 'Do-follow link + logo + company description. Most popular.', badge: true, envKey: 'NEXT_PUBLIC_STRIPE_PLATINUM_URL' as const },
    { name: 'Featured', price: '$599', description: 'Above-the-fold placement + press mention.', envKey: 'NEXT_PUBLIC_STRIPE_FEATURED_URL' as const },
  ];

  export default function ListPage() {
    return (
      <>
        <NavBar />
        <main className="min-h-screen bg-gray-50 py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-blue-600 mb-3">Get Your Company Listed on LuckyDraw.me</h1>
            <h2 className="text-xl text-gray-600 mb-8">Boost Your SEO with High-Quality Backlinks</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-10">
              LuckyDraw.me attracts over <strong>689,840 monthly users</strong>. A listing gives your site a high-quality backlink from a trusted domain in the events and giveaway niche.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TIERS.map((tier) => (
                <div key={tier.name} className="bg-white rounded-2xl p-8 border-2 border-gray-200 relative">
                  {tier.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-semibold px-4 py-1 rounded-full">Most Popular</div>
                  )}
                  <div className="text-xl font-bold mb-1">{tier.name}</div>
                  <div className="text-3xl font-extrabold text-gray-900 mb-3">{tier.price}<span className="text-sm text-gray-400 font-normal"> one-time</span></div>
                  <p className="text-gray-500 text-sm mb-6">{tier.description}</p>
                  <a
                    href={process.env[tier.envKey] ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700"
                  >
                    Get {tier.name} Listing
                  </a>
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-sm mt-8">After payment, email hello@luckydraw.me with your details. Listing added within 48 hours.</p>
          </div>
        </main>
      </>
    );
  }
  ```

  Add `NEXT_PUBLIC_STRIPE_GOLD_URL`, `NEXT_PUBLIC_STRIPE_PLATINUM_URL`, `NEXT_PUBLIC_STRIPE_FEATURED_URL` to `.env.local` and `.env.example`.

- [ ] **Step 5: Verify build**
  ```bash
  npm run build
  ```
  Expected: no errors.

- [ ] **Step 6: Commit**
  ```bash
  git add app/
  git commit -m "feat: add all page routes (home, pricing, faq, list)"
  ```

---

## Task 13: Dashboard page (draw history)

**Files:**
- Create: `app/dashboard/page.tsx`

- [ ] **Step 1: Create `app/dashboard/page.tsx`**
  ```tsx
  import { auth } from '@clerk/nextjs/server';
  import { redirect } from 'next/navigation';
  import { supabaseAdmin } from '@/lib/supabase-admin';
  import NavBar from '@/components/NavBar';
  import Link from 'next/link';

  export default async function DashboardPage() {
    const { userId } = auth();
    if (!userId) redirect('/');

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('plan')
      .eq('id', userId)
      .single();

    const plan = user?.plan ?? 'free';

    if (plan === 'free') {
      return (
        <>
          <NavBar />
          <main className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center max-w-md">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">Dashboard requires Pro</h1>
              <p className="text-gray-500 mb-6">Upgrade to Pro to save and revisit your draw history.</p>
              <Link href="/pricing" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700">
                See Pricing
              </Link>
            </div>
          </main>
        </>
      );
    }

    const { data: draws } = await supabaseAdmin
      .from('draws')
      .select('*')
      .eq('user_id', userId)
      .order('drawn_at', { ascending: false })
      .limit(50);

    return (
      <>
        <NavBar />
        <main className="min-h-screen bg-gray-50 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Draw History</h1>
            {!draws || draws.length === 0 ? (
              <p className="text-gray-500">No draws yet. <Link href="/" className="text-indigo-600">Run your first draw →</Link></p>
            ) : (
              <div className="space-y-4">
                {draws.map((draw) => (
                  <div key={draw.id} className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="font-semibold text-gray-900">{draw.title}</h2>
                        <p className="text-sm text-gray-400 mt-1">
                          {draw.entries.length} entries · {draw.winners.length} winner{draw.winners.length !== 1 ? 's' : ''}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {draw.winners.map((w: string) => (
                            <span key={w} className="bg-indigo-50 text-indigo-700 text-sm px-3 py-1 rounded-full font-medium">{w}</span>
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(draw.drawn_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </>
    );
  }
  ```

- [ ] **Step 2: Commit**
  ```bash
  git add app/dashboard/page.tsx
  git commit -m "feat: add dashboard page with draw history for Pro+ users"
  ```

---

## Task 14: Save draws to Supabase (from DrawTool)

**Files:**
- Modify: `components/DrawTool.tsx`
- Modify: `app/page.tsx` (pass userId + plan to DrawTool)

- [ ] **Step 1: Add `userId` prop to DrawTool**

  In `components/DrawTool.tsx`, add `userId` to props interface and `onDrawComplete` callback:
  ```tsx
  interface DrawToolProps {
    plan: 'free' | 'pro' | 'business';
    userId?: string;
    onDrawComplete?: (entries: string[], winners: string[]) => void;
  }
  ```

  Inside `handleDraw()`, after setting the winner, call a server action to save if Pro+:
  ```tsx
  // At the top of DrawTool.tsx, add import:
  import { saveDrawAction } from '@/app/actions';

  // Inside handleDraw(), after setWinner(drawn):
  if (canUse('history', plan) && userId) {
    await saveDrawAction({ userId, entries, winners: newWinners, title: 'Untitled Draw' });
  }
  ```

- [ ] **Step 2: Create `app/actions.ts`** (Server Actions)
  ```ts
  'use server';

  import { supabaseAdmin } from '@/lib/supabase-admin';

  export async function saveDrawAction({
    userId,
    entries,
    winners,
    title,
  }: {
    userId: string;
    entries: string[];
    winners: string[];
    title: string;
  }) {
    await supabaseAdmin.from('draws').insert({ user_id: userId, entries, winners, title });
  }
  ```

- [ ] **Step 3: Pass `userId` from `app/page.tsx`**

  In `app/page.tsx`, update the `<DrawTool>` render:
  ```tsx
  <DrawTool plan={plan} userId={userId ?? undefined} />
  ```

- [ ] **Step 4: Run tests**
  ```bash
  npx jest
  ```
  Expected: all tests pass.

- [ ] **Step 5: Commit**
  ```bash
  git add components/DrawTool.tsx app/actions.ts app/page.tsx
  git commit -m "feat: save draws to Supabase for Pro+ users via Server Action"
  ```

---

## Task 15: Export endpoint (CSV + PDF)

**Files:**
- Create: `app/api/export/route.ts`
- Create: `app/api/export/__tests__/route.test.ts`

- [ ] **Step 1: Write failing test**

  Create `app/api/export/__tests__/route.test.ts`:
  ```ts
  jest.mock('@clerk/nextjs/server', () => ({
    auth: jest.fn().mockReturnValue({ userId: 'user_abc' }),
  }));

  jest.mock('@/lib/supabase-admin', () => ({
    supabaseAdmin: {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: { plan: 'pro' } }),
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({
                data: [{ title: 'Test Draw', winners: ['Alice'], entries: ['Alice', 'Bob'], drawn_at: '2026-06-09T10:00:00Z' }],
              }),
            }),
          }),
        }),
      }),
    },
  }));

  import { GET } from '@/app/api/export/route';

  describe('GET /api/export', () => {
    it('returns 403 for free plan users', async () => {
      // Override mock for this test
      const { supabaseAdmin } = require('@/lib/supabase-admin');
      supabaseAdmin.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: { plan: 'free' } }),
          }),
        }),
      });
      const req = new Request('http://localhost/api/export?format=csv');
      const res = await GET(req);
      expect(res.status).toBe(403);
    });

    it('returns CSV with correct content-type for pro user', async () => {
      const req = new Request('http://localhost/api/export?format=csv');
      const res = await GET(req);
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toContain('text/csv');
    });
  });
  ```

- [ ] **Step 2: Run test to verify it fails**
  ```bash
  npx jest app/api/export/__tests__/route.test.ts
  ```
  Expected: FAIL

- [ ] **Step 3: Create `app/api/export/route.ts`**
  ```ts
  import { auth } from '@clerk/nextjs/server';
  import { supabaseAdmin } from '@/lib/supabase-admin';
  import { canUse } from '@/lib/plan';

  export async function GET(req: Request) {
    const { userId } = auth();
    if (!userId) return new Response('Unauthorized', { status: 401 });

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('plan')
      .eq('id', userId)
      .single();

    const plan = user?.plan as 'free' | 'pro' | 'business' ?? 'free';

    if (!canUse('export', plan)) {
      return new Response('Upgrade to Pro to export draws', { status: 403 });
    }

    const { data: draws } = await supabaseAdmin
      .from('draws')
      .select('*')
      .eq('user_id', userId)
      .order('drawn_at', { ascending: false })
      .limit(100);

    const url = new URL(req.url);
    const format = url.searchParams.get('format') ?? 'csv';

    if (format === 'csv') {
      const rows = [
        ['Title', 'Winners', 'Entry Count', 'Date'],
        ...(draws ?? []).map((d) => [
          `"${d.title}"`,
          `"${d.winners.join('; ')}"`,
          String(d.entries.length),
          new Date(d.drawn_at).toISOString(),
        ]),
      ];
      const csv = rows.map((r) => r.join(',')).join('\n');
      return new Response(csv, {
        headers: {
          'content-type': 'text/csv',
          'content-disposition': 'attachment; filename="luckydraw-history.csv"',
        },
      });
    }

    return new Response('Unsupported format', { status: 400 });
  }
  ```

- [ ] **Step 4: Run test to verify it passes**
  ```bash
  npx jest app/api/export/__tests__/route.test.ts
  ```
  Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add app/api/export/
  git commit -m "feat: add CSV export endpoint for Pro+ users"
  ```

---

## Task 16: Deploy to Vercel and validate SEO parity

**Files:**
- Create: `next.config.ts` (redirects from old CRA routes)
- No other code changes

- [ ] **Step 1: Install Vercel CLI**
  ```bash
  npm install -g vercel
  ```

- [ ] **Step 2: Link project to Vercel**
  ```bash
  vercel link
  ```
  Follow prompts: create new project named `luckydraw-me-next`.

- [ ] **Step 3: Add env vars to Vercel**
  ```bash
  vercel env add CLERK_SECRET_KEY
  vercel env add CLERK_WEBHOOK_SECRET
  vercel env add SUPABASE_SERVICE_ROLE_KEY
  vercel env add LEMONSQUEEZY_WEBHOOK_SECRET
  # For NEXT_PUBLIC_ vars, use the dashboard (Settings → Environment Variables)
  ```

- [ ] **Step 4: Deploy preview**
  ```bash
  vercel deploy
  ```
  Copy the preview URL (e.g., `https://luckydraw-me-next-xyz.vercel.app`).

- [ ] **Step 5: Update webhook URLs**

  - Clerk dashboard → Webhooks → update endpoint URL to Vercel preview URL
  - Lemon Squeezy dashboard → Webhooks → update endpoint URL

- [ ] **Step 6: SEO parity checklist**

  Run these checks before DNS cutover. Compare Vercel preview vs current luckydraw.me:

  ```
  ✓ Title tag matches on home, faq, list, pricing pages
  ✓ Meta description present on all pages
  ✓ Canonical URLs correct (https://luckydraw.me not preview URL)
  ✓ OG tags present (title, description, image)
  ✓ JSON-LD schema present on home (FAQPage, SoftwareApplication, HowTo)
  ✓ robots.txt accessible at /robots.txt
  ✓ sitemap.xml accessible at /sitemap.xml
  ✓ All images load (check /images/ paths)
  ✓ 404 page returns 404 status (not 200)
  ✓ Nav links work (/, /faq, /list, /pricing)
  ✓ No console errors in browser
  ```

- [ ] **Step 7: Add `next-sitemap` for automatic sitemap**
  ```bash
  npm install next-sitemap
  ```

  Create `next-sitemap.config.js`:
  ```js
  /** @type {import('next-sitemap').IConfig} */
  module.exports = {
    siteUrl: 'https://luckydraw.me',
    generateRobotsTxt: true,
    exclude: ['/dashboard'],
  };
  ```

  Add to `package.json` scripts:
  ```json
  "postbuild": "next-sitemap"
  ```

- [ ] **Step 8: Commit and push**
  ```bash
  git add next-sitemap.config.js package.json
  git commit -m "chore: add next-sitemap for automatic sitemap + robots.txt generation"
  git push origin feat/nextjs-saas
  ```

---

## Task 17: DNS cutover (final step)

> **Warning:** This is irreversible until you manually repoint DNS. Only proceed once the SEO parity checklist in Task 16 passes completely.

- [ ] **Step 1: Promote Vercel preview to production**
  ```bash
  vercel --prod
  ```

- [ ] **Step 2: Add domain in Vercel**

  Vercel dashboard → Project → Settings → Domains → Add `luckydraw.me` and `www.luckydraw.me`.
  Vercel shows required DNS records.

- [ ] **Step 3: Update DNS at your registrar**

  Point `luckydraw.me` and `www.luckydraw.me` A/CNAME records to Vercel's values from Step 2.
  DNS propagation: 5–60 minutes.

- [ ] **Step 4: Verify live site**

  Open https://luckydraw.me — confirm Next.js app is live, draw tool works, Clerk sign-in works.

- [ ] **Step 5: Update webhook URLs to production domain**

  - Clerk: update webhook endpoint to `https://luckydraw.me/api/webhooks/clerk`
  - Lemon Squeezy: update webhook endpoint to `https://luckydraw.me/api/webhooks/ls`

- [ ] **Step 6: Merge feature branch**
  ```bash
  git checkout master
  git merge feat/nextjs-saas
  git push origin master
  ```

---

## Final test run

```bash
npx jest --coverage
```

Expected output: all tests pass. Coverage summary across:
- `lib/plan.ts` — 100%
- `app/api/webhooks/ls/route.ts` — 100%
- `app/api/webhooks/clerk/route.ts` — 100%
- `app/api/export/route.ts` — 100%
- `components/DrawTool.tsx` — core paths covered
- `components/UpgradePrompt.tsx` — 100%
- `components/PricingCards.tsx` — 100%
