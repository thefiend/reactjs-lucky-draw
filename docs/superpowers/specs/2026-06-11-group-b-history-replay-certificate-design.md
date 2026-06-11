# Group B: History Replay + Winner Certificate — Design Spec

**Date:** 2026-06-11
**Status:** Approved
**Features:** Draw history replay animation, winner certificate PNG download

---

## Overview

Two post-draw output features sharing a `WinnerCard` component and a `useSlotMachine` hook:

1. **History replay** — Pro dashboard shows past draws; clicking Replay reruns the slot machine animation for that draw, revealing winners again with confetti.
2. **Winner certificate** — Branded PNG download available immediately after a draw (DrawTool) and from past draws (dashboard). Free for all plans — viral marketing surface.

---

## Architecture

### New files

| File | Responsibility |
|---|---|
| `lib/useSlotMachine.ts` | Pure animation hook: cycles names from a pool, calls onComplete when done |
| `components/WinnerCard.tsx` | Branded winner card UI rendered off-screen for html2canvas capture |
| `components/DrawHistoryList.tsx` | Client component: replay state + download for dashboard draw cards |

### Modified files

| File | Change |
|---|---|
| `lib/useDrawEngine.ts` | Replace inline animation loop with `useSlotMachine` |
| `components/DrawTool.tsx` | Render WinnerCard + Download Certificate button after winners revealed |
| `app/dashboard/page.tsx` | Replace inline map with `<DrawHistoryList draws={draws} />` |

---

## 1. `lib/useSlotMachine.ts`

Extracted from the existing animation loop in `useDrawEngine.ts`.

```typescript
useSlotMachine() → {
  displayName: string | null,
  isAnimating: boolean,
  run(pool: string[], onComplete: () => void): void,
}
```

- `run(pool, onComplete)` starts the setTimeout chain (intervals `[60,80,110,150,200,260,300]`, total 2000ms)
- Each tick: sets `displayName` to a random element from `pool`
- On completion: sets `displayName` to null, `isAnimating` to false, calls `onComplete()`
- Cleanup: `useEffect` returns clearTimeout on `animationRef`
- Calling `run` while already animating is a no-op (guard: `if (isAnimating) return`)

`useDrawEngine` replaces its inline tick loop with:
```typescript
const { displayName, isAnimating, run } = useSlotMachine();
// in handleDraw():
run(availablePool, () => {
  setWinners(drawn);
  // ... confetti, save, etc.
});
```

---

## 2. `components/WinnerCard.tsx`

Fixed-size `600×400px` div rendered off-screen (`position: absolute; left: -9999px`) so html2canvas can paint it.

**Props:**
```typescript
interface WinnerCardProps {
  winners: string[];
  title: string;
  date: string;       // formatted display string e.g. "Jun 11 2026"
  plan: Plan;
  cardRef: React.RefObject<HTMLDivElement>;
}
```

**Layout:**
```
┌─────────────────────────────────┐
│  🎉  Lucky Draw Winner          │  ← header
│                                 │
│       Alice                     │  ← large bold, centered
│       Bob                       │  ← staggered if multi-winner
│                                 │
│  "Team Raffle · Jun 11 2026"    │  ← title + date, small
│  luckydraw.me                   │  ← branding
│  [WATERMARK if free]            │  ← diagonal "luckydraw.me" overlay, opacity 0.08
└─────────────────────────────────┘
```

**Styling:** All inline styles (not Tailwind classes) — html2canvas requires painted CSS, not class-based styles that depend on a stylesheet being present.

**Download function:** Callers trigger download by calling a utility:
```typescript
async function downloadCertificate(ref: React.RefObject<HTMLDivElement>, filename: string): Promise<void>
```
- `html2canvas(ref.current)` → `.toBlob()` → create object URL → programmatic `<a download>` click → revoke URL
- Lives in `lib/downloadCertificate.ts` (pure utility, no React)

**Plan gating:** No gate on download. Free tier gets diagonal watermark overlay (low opacity). Pro gets clean card.

---

## 3. `components/DrawHistoryList.tsx`

Client component (`'use client'`). Receives `draws` array from server.

**Props:**
```typescript
interface Draw {
  id: string;
  title: string;
  entries: string[];
  winners: string[];
  drawn_at: string;
}

interface DrawHistoryListProps {
  draws: Draw[];
}
```

**State:**
```typescript
replayingId: string | null    // draw.id currently animating
```

**Single `useSlotMachine` instance** shared across all cards. Only one replay runs at a time; clicking Replay on another card while one is running is ignored (button disabled).

**Per-card layout:**
```
┌──────────────────────────────────────────────┐
│  Title                          Jun 11 2026  │
│  5 entries · 2 winners                       │
│  [Alice] [Bob]          ← winner pills       │
│                                              │
│  [Replay] [Download Certificate]             │
│  [slot machine display — only if replaying]  │
└──────────────────────────────────────────────┘
```

**Replay flow:**
1. Click Replay → set `replayingId = draw.id`
2. `run(draw.entries, onComplete)`
3. `onComplete`: clear `replayingId`, fire `confetti()`
4. Winners pills remain visible throughout (they don't hide during replay — replaying is a bonus animation, not a re-draw)

**Certificate per card:**
- `WinnerCard` rendered off-screen only for cards where "Download Certificate" has been clicked (`downloadingIds: Set<string>` state — add id on first click)
- Each active card gets its own `useRef<HTMLDivElement>` stored in a `refs` map (`useRef<Map<string, React.RefObject<HTMLDivElement>>>(new Map())`)
- "Download Certificate" click → add id to `downloadingIds`, then in a `useEffect` triggered by the new id → `downloadCertificate(ref, filename)`
- Lazy rendering prevents 50 off-screen elements for users with long history

---

## 4. `components/DrawTool.tsx` changes

After winner reveal section (`winners.length > 0 && !isAnimating`):

```tsx
{/* Certificate download */}
{winners.length > 0 && !isAnimating && (
  <>
    <WinnerCard
      winners={winners}
      title="Lucky Draw"
      date={new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      plan={plan}
      cardRef={cardRef}
    />
    <button onClick={() => downloadCertificate(cardRef, 'luckydraw-winner.png')}>
      Download Certificate
    </button>
  </>
)}
```

`cardRef = useRef<HTMLDivElement>(null)` added to DrawTool.

---

## 5. `app/dashboard/page.tsx` changes

Replace the inline `draws.map(...)` with:
```tsx
<DrawHistoryList draws={draws ?? []} />
```

Page stays a server component. `DrawHistoryList` is the only client boundary.

---

## 6. Plan gating

| Feature | Free | Pro | Business |
|---|---|---|---|
| Certificate download | ✓ (watermark) | ✓ (clean) | ✓ (clean) |
| Dashboard replay | — (dashboard Pro-gated) | ✓ | ✓ |

---

## 7. Dependencies

- `html2canvas` — add to package.json
- No other new dependencies

---

## 8. Testing

- `useSlotMachine`: run completes after fake timers, onComplete called, isAnimating transitions
- `WinnerCard`: renders winners, title, date; shows watermark on free plan; no watermark on pro
- `DrawHistoryList`: Replay button triggers animation, Download Certificate button calls downloadCertificate, only one replay at a time
- `DrawTool`: certificate section appears after draw, Download Certificate button present
- `downloadCertificate`: mock html2canvas, verify blob → anchor → click → revoke pattern

---

## Out of Scope

- Replay individual winners sequentially (all winners revealed together after single animation)
- Custom certificate titles from user input
- Certificate sharing via URL
- Replay history persistence (replay is UI-only, no DB write)
