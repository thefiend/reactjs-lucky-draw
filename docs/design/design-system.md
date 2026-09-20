# LuckyDraw.me design system

## Brief

A free lucky draw generator. Audience: teachers picking a pupil, small brands running an
Instagram giveaway, MCs on stage at a company annual dinner (SEA-heavy), streamers on air.
Primary job: paste a list, draw a winner, show the room it was fair, screenshot or share it.

The product moat is **provable randomness, free, no account**. The design's job is to make
that proof feel physical.

## Visual concept: the raffle ticket

Competitors reach for casino wheels (wheelofnames) or corporate SaaS blue (randompicker).
Our vernacular is the **paper raffle ticket and its stub** — perforations, serial numbers,
ink stamps, ticket-stock colours. It is specific to draws, unused by the field, and it
carries the differentiator: a stub with a serial number *is* a receipt for a draw.

The winner reveal is a stub tearing off the ticket and being stamped. That single moment is
where the design spends its boldness; everything around it stays flat, quiet paper.

## Tokens

### Colour

| Token | Light | Dark | Role |
|---|---|---|---|
| `--color-ink` | `#141B34` | `#E8EAF2` | text, rules |
| `--color-paper` | `#FCFAF4` | `#141B34` | page ground (ticket stock) |
| `--color-stock` | `#F3EEE0` | `#1D2647` | raised paper: input pad, stub |
| `--color-marigold` | `#E9A425` | `#F2B546` | primary action, seal ring |
| `--color-stamp` | `#C7304A` | `#E8596F` | the verified stamp, winner accent |
| `--color-mint` | `#1F9B80` | `#3ECAA8` | verification pass states |
| `--color-slate` | `#5D657F` | `#9AA3BF` | secondary text, perforation dots |

Marigold and stamp-red come from real ticket stock and rubber stamp ink. Deliberately not the
cream+terracotta or dark+acid-green pairings that read as generated.

### Type

- **Bricolage Grotesque** (variable, width axis) — headlines and the winner name. Slightly
  irregular grotesque; it looks printed rather than rendered, which suits ticket stock.
- **Public Sans** — body, UI, form controls. Neutral, high legibility, not Inter.
- **IBM Plex Mono** — serial numbers, seeds, hashes **only**. Monospace here is functional
  (fixed-width data people compare character by character), never decorative labelling.

Scale (1.25 ratio, clamped for fluid display sizes):
`0.8125 / 0.9375 / 1 / 1.25 / 1.5625 / 1.953 / 2.441 / 3.052rem`
Body 1rem at 1.6 line-height, measure capped at 68ch. Headlines set tight (1.05) with
`-0.015em` tracking. Sentence case everywhere — no all-caps labels.

### Layout

Tool first. No marketing hero above the machine: the draw *is* the hero.

```
┌───────────────────────────────────────────────────────────────┐
│ LuckyDraw.me      Tools   Fairness   FAQ            [ Draw ]  │
├───────────────────────────────────────────────────────────────┤
│  Free lucky draw generator                ╎                   │
│  that proves the winner                   ╎   ┌─────────────┐ │
│  was random.                              ╎   │  STAGE      │ │
│  Paste names, draw, keep the stub.         ╎  │  ticket roll │ │
│                                            ╎  │             │ │
│  ┌ names pad ──────────────┐               ╎  │ ·····tear··· │ │
│  │ Ada Lovelace            │               ╎  │  WINNER      │ │
│  │ Grace Hopper            │  ← ticket     ╎  │  ⊚ stamped   │ │
│  │ …                       │    stock pad  ╎  │  #A7F2-3C91  │ │
│  └─────────────────────────┘               ╎  └─────────────┘ │
│  [ Draw a winner ]  3 of 128 picked        ╎                   │
├───────────────────────────────────────────────────────────────┤
│ proof strip: seed 4f9c… · list hash 8ab1… · Verify this draw   │
└───────────────────────────────────────────────────────────────┘
```

Left-aligned throughout; centring reserved for the stub itself, where the winner name and
seal need to sit on an axis. Two columns at ≥900px, stacked below, with the stage first on
mobile once a draw has run (the result is what people show the room).

Surfaces are flat paper: 1px `slate` rules at 40% opacity, no soft grey drop shadows. The
only radii are 2px on paper edges and a full round on the seal. Perforations are real dotted
borders, not decoration.

### Principles

1. The draw moment is the only animated thing. Names riffle in the stage, the stub slides
   down, the stamp lands. `prefers-reduced-motion` → result appears, stamp fades in.
2. Every draw produces a serial, a seed and a list hash, always visible. Proof is UI, not a
   marketing claim.
3. Copy is plain and active: "Draw a winner", "Verify this draw", "Add names to start".
4. Quality floor, unannounced: keyboard focus visible on paper (2px marigold outline),
   contrast ≥4.5:1 both themes, works at 320px, dark mode via `prefers-color-scheme` plus a
   manual toggle.

## Plan review against the brief

Three things were revised after the first pass, because they were defaults rather than
choices:

- **Rejected**: dark stage with a bright accent and a big spinning wheel. That is the
  category default (and a generated-design default). Replaced with the paper-ticket system,
  which is unique to us and states the fairness moat.
- **Rejected**: marketing hero with a headline, three feature cards, and a CTA. Tool-first
  layout instead — the draw pad is above the fold, since the search intent is "do the thing
  now", and it is also what earns dwell time.
- **Rejected**: `01 / 02 / 03` step markers on the how-it-works section. Kept numbering only
  where the content is genuinely sequential (the three-step fairness verification), dropped
  it elsewhere.

Monospace and the mono serial numbers stay, because they carry data people verify rather
than acting as a typographic flourish.
