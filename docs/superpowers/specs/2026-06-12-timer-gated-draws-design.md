# Timer-Gated Draws — Design Spec

**Date:** 2026-06-12
**Status:** Approved
**Feature:** Countdown timer that locks entries and auto-fires the draw when it expires

---

## Overview

User sets a duration (minutes), clicks Start Timer, entries lock, a visible countdown runs, and when it hits zero the draw fires automatically with confetti. Cancel at any point restores normal state. Free for all plans.

---

## Architecture

Two independent hooks wired together in DrawTool:

| File | Action | Responsibility |
|---|---|---|
| `lib/useCountdownTimer.ts` | Create | Countdown state: start, tick, expire, cancel |
| `lib/__tests__/useCountdownTimer.test.ts` | Create | Unit tests for timer transitions |
| `components/DrawTool.tsx` | Modify | Render timer controls, wire isExpired → handleDraw |
| `components/__tests__/DrawTool.test.tsx` | Modify | Integration tests for timer UI |

---

## 1. `lib/useCountdownTimer.ts`

```typescript
useCountdownTimer() → {
  minutes: number;
  setMinutes: (m: number) => void;
  secondsLeft: number;
  isRunning: boolean;
  isExpired: boolean;
  start(): void;
  cancel(): void;
}
```

**Behaviour:**

- `start()`: validates `minutes >= 1`, sets `secondsLeft = minutes * 60`, starts `setInterval` at 1000ms, sets `isRunning = true`, `isExpired = false`
- Each tick: `secondsLeft -= 1`
- When `secondsLeft` reaches 0: clears interval, sets `isRunning = false`, `isExpired = true`
- `cancel()`: clears interval, resets `secondsLeft = 0`, `isRunning = false`, `isExpired = false`
- `useEffect` cleanup: clears interval on unmount
- Calling `start()` while already running is a no-op
- Default `minutes`: 5

**State transitions:**

```
idle → (start) → running → (secondsLeft=0) → expired
running → (cancel) → idle
expired → (cancel) → idle
```

---

## 2. DrawTool wiring

DrawTool uses both hooks independently and wires them via `useEffect`:

```typescript
const timer = useCountdownTimer();
const engine = useDrawEngine(plan, userId, { onDrawComplete });

useEffect(() => {
  if (timer.isExpired) {
    engine.handleDraw();
    timer.cancel(); // reset timer to idle after draw fires
  }
}, [timer.isExpired]);
```

---

## 3. UI changes — DrawTool

### Timer row (below winner count, above buttons)

**Idle state:**
```
Timer: [__5__] min   [Start Timer]
```
- `<input type="number" min={1} max={60}>` for minutes, disabled while `isRunning`
- "Start Timer" button — disabled when `entriesText.trim()` is empty

**Running state — replaces timer row and buttons row:**
```
⏱ Drawing in  2:34  [Cancel]
```
- Countdown formatted as `M:SS` (e.g. `2:34`, `0:09`)
- Format: `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`
- "Cancel" button calls `timer.cancel()`
- Draw/Import CSV buttons hidden while `isRunning` (auto-draw handles it)
- Export button remains visible and enabled

**Textarea:** `disabled` while `isRunning` (entries lock on start)

### Position in layout

```
[ Textarea                              ]
[ entries counter (free tier)           ]
[ Draw [N] winners row                  ]
[ Timer row                             ]  ← new
[ Draw Winner ] [ Import CSV ] [ Export ]  ← hidden while isRunning
[ ⏱ countdown + Cancel ]                  ← shown while isRunning
[ slot machine animation                ]
[ winner reveal                         ]
[ certificate download                  ]
[ previously drawn + reset              ]
[ ad placeholder                        ]
[ upgrade prompt                        ]
```

---

## 4. Plan gating

None. Timer is free for all plans.

---

## 5. Testing

### `useCountdownTimer` tests

- Initial state: `isRunning = false`, `isExpired = false`, `secondsLeft = 0`, `minutes = 5`
- After `start()`: `isRunning = true`, `secondsLeft = minutes * 60`
- After partial tick advance: `secondsLeft` decremented correctly
- After full duration advance: `isExpired = true`, `isRunning = false`, `secondsLeft = 0`
- After `cancel()` from running: `isRunning = false`, `isExpired = false`, `secondsLeft = 0`
- Second `start()` call while running: no-op (state unchanged)
- `setMinutes` updates minutes when idle

### DrawTool integration tests

- Timer row renders with minutes input and Start Timer button
- Start Timer button disabled when textarea is empty
- After clicking Start Timer: countdown display appears, Draw/Import CSV buttons hidden, textarea disabled
- Cancel button restores normal state
- After fake-timer advance to zero: `handleDraw` fires (mock `useDrawEngine`)

---

## Out of Scope

- Persisting timer state across page reloads
- Timer visible to remote audience (that's the live draw room feature)
- Seconds-level input (minutes only)
- Multiple timers
