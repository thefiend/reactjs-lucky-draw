# Slot Machine Animation — Design Spec

**Date:** 2026-06-09
**Status:** Approved
**File changed:** `components/DrawTool.tsx` only

## Summary

Add a slot-machine-style randomizing animation to `DrawTool` that plays for ~2 seconds before revealing the winner, followed by a confetti burst.

## Behaviour

### States

1. **Idle** — current UI, no change
2. **Animating** — triggered when "Draw Winner" is clicked
   - Winner display area shows a cycling name in an indigo pill
   - "Drawing..." label above the pill
   - A progress bar fills left-to-right over 2 seconds
   - Button label changes to "Drawing..." and is disabled
   - Textarea is visually dimmed (opacity 50%)
   - Export button is disabled
3. **Revealed** — when animation stops
   - Pill disappears; winner shown large (existing style)
   - `canvas-confetti` fires a one-shot burst
   - Button re-enabled, label returns to "Draw Winner" (or "Draw Again")

### Animation mechanics

| Property | Value |
|---|---|
| Total duration | 2000ms |
| Starting interval | 60ms |
| Ending interval | 300ms |
| Easing | Exponential slowdown — interval doubles roughly every 300ms |
| Cycling pool | Available entries only (previous winners excluded) |
| Confetti trigger | Once, when interval timer stops |

### Easing schedule (approximate)

The interval steps through: 60 → 80 → 110 → 150 → 200 → 260 → 300ms, then stops. Total ticks ~20–25.

## Implementation

### New state

```ts
const [isAnimating, setIsAnimating] = useState(false);
const [displayName, setDisplayName] = useState<string | null>(null);
```

`displayName` holds the name shown during animation (cycles rapidly). `winner` (existing) is only set once animation completes.

### Animation logic

`handleDraw` runs existing guard checks (plan limits, available entries) then:

1. Picks the actual winner upfront (`drawn`)
2. Sets `isAnimating = true`
3. Starts a self-rescheduling `setTimeout` chain — each tick picks a random name from `available` and sets `displayName`
4. After 2000ms, clears the timer, sets `displayName = null`, sets `winner = drawn`, fires confetti
5. Calls existing `saveDrawAction` / `onDrawComplete` after animation completes

### Confetti

Install `canvas-confetti`. Fire with modest settings (no fullscreen takeover):

```ts
confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
```

### UI changes

- During animation: show `displayName` in indigo pill with "Drawing..." label and progress bar
- Button: `disabled` + label "Drawing..." when `isAnimating`
- Textarea: `opacity-50` class when `isAnimating`
- Revealed: existing winner display (`data-testid="winner-display"`) unchanged — same markup, same styles

## Constraints

- No new component files — all changes inside `DrawTool.tsx`
- `canvas-confetti` is the only new dependency
- Existing `data-testid="winner-display"` must remain for tests
- Animation must not block or delay `saveDrawAction` / `onDrawComplete` calls (fire after animation resolves)
