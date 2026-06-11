# Group A Draw Enhancements — Design Spec

**Date:** 2026-06-11
**Status:** Approved
**Features:** Multiple winners, CSV import, weighted entries, elimination mode

---

## Overview

Four core draw enhancements that strengthen the free→Pro upgrade wall by surfacing capability limits earlier. All logic extracted from `DrawTool.tsx` into a `useDrawEngine` hook. `DrawTool` becomes a thin UI shell.

**Plan gating:**
- `winnerCount > 1` → Pro only (triggers upgrade prompt)
- CSV import, weighted entries, elimination mode → free for all

---

## 1. Entry Parsing

Single `parseEntries(text: string)` function handles weighted syntax:

```
"Alice x3\nBob\nCarol x2"
→ [{ name: 'Alice', weight: 3 }, { name: 'Bob', weight: 1 }, { name: 'Carol', weight: 2 }]
```

**Regex:** `/^(.+?)\s+x(\d+)$/i` — name followed by ` x<integer>`. No new dependencies.

**Expansion:** entries are expanded into a flat pool before drawing:
```
['Alice', 'Alice', 'Alice', 'Bob', 'Carol', 'Carol']
```

**CSV import:** browser `FileReader` API reads uploaded `.csv`, splits on newline, takes first column of each row, appends as newline-separated names to `entriesText`. No library needed. Accepts `.csv` file type only.

---

## 2. `useDrawEngine` Hook

**Location:** `lib/useDrawEngine.ts`

**Replaces:** all logic currently inside `DrawTool.tsx`

### State

| Name | Type | Description |
|---|---|---|
| `entriesText` | `string` | Raw textarea value |
| `winnerCount` | `number` | Number of winners to draw (default 1) |
| `winners` | `string[]` | Current draw results |
| `previousWinners` | `string[]` | Eliminated pool (session only, resets on reload) |
| `isAnimating` | `boolean` | Slot machine running |
| `displayName` | `string \| null` | Name shown during slot machine flicker |
| `showUpgrade` | `boolean` | Upgrade prompt visibility |
| `upgradeFeature` | `Feature` | Which feature triggered upgrade prompt |

### Derived values

| Name | Description |
|---|---|
| `parsedEntries` | `{ name, weight }[]` from `parseEntries(entriesText)` |
| `expandedPool` | Flat string array after weight expansion |
| `availablePool` | `expandedPool` filtered by `previousWinners` |
| `entryCount` | Unique name count (for free tier counter display) |

### Actions

**`handleDraw()`**
1. If `winnerCount > 1 && !canUse('multi-winner', plan)` → show upgrade prompt, return
2. If `!canUse('unlimited', plan) && entryCount > FREE_ENTRY_LIMIT` → show upgrade prompt, return
3. Pick `winnerCount` unique winners from `availablePool` without replacement (Fisher-Yates slice)
4. Run existing slot machine animation (unchanged timing)
5. On animation end: set `winners`, append to `previousWinners`, fire confetti, call `onDrawComplete`, save draw if Pro

**`handleCSVImport(file: File)`**
1. Read file via `FileReader.readAsText`
2. Split on newline, take first comma-separated column of each row
3. Trim, filter empty, filter duplicates against existing entries
4. Append to `entriesText` as newline-separated names

**`handleReset()`**
Clears `previousWinners` and `winners`. Resets elimination state.

---

## 3. UI Changes — `DrawTool.tsx`

DrawTool imports `useDrawEngine`, renders UI only. No logic inside the component.

### Layout (top to bottom)

```
[ Header: title + subtitle ]

[ Card ]
  [ Textarea — unchanged ]
  [ Entry counter (free tier) ]
  [ "Draw X winners" row: label + number input ]    ← NEW
  [ Draw Winner ] [ Import CSV ] [ Export ]          ← CSV button added
  [ Slot machine animation — unchanged ]
  [ Winner reveal: staggered list if count > 1 ]    ← updated

[ Previously drawn — strikethrough + faded ]        ← style update
[ Reset button — appears once previousWinners > 0 ] ← NEW
[ Ad placeholder (free tier) ]
[ UpgradePrompt modal ]
```

### Winner count input

- `<input type="number" min="1" max={availablePool.length}>` inline with label "Draw _ winners"
- Free tier: input rendered, value locked to 1. Changing to 2+ fires upgrade prompt immediately via `canUse('multi-winner', plan)` check (on `onChange`, not on Draw click)
- Stepper arrows visible on all tiers to surface the feature

### Import CSV button

- Renders alongside Export button in button row
- Hidden `<input type="file" accept=".csv" ref={fileInputRef}>`
- Click CSV button → trigger file input click via ref
- `onChange` → call `handleCSVImport(file)`
- Disabled while animating

### Winner display

- `winnerCount === 1`: identical to current single-winner reveal
- `winnerCount > 1`: numbered list with staggered fade-in (each item delays 80ms × index)

```
🎉 Winners
  1. Alice
  2. Bob
  3. Carol
```

### Elimination styling

- `previousWinners` pills: add `line-through` + `opacity-50` to existing chip styles
- No layout change

### Reset button

- Appears below previousWinners section when `previousWinners.length > 0`
- Text: "Reset draw" — small, secondary style
- Calls `handleReset()`

---

## 4. Plan Feature Map Updates

Add `'multi-winner'` to `Feature` type in `lib/plan.ts`:

```typescript
export type Feature = 'export' | 'history' | 'unlimited' | 'noad' | 'whitelabel' | 'api' | 'multi-winner';
export const PRO_FEATURES: Feature[] = ['export', 'history', 'unlimited', 'noad', 'multi-winner'];
```

---

## 5. Testing

- `useDrawEngine` unit tests: parsing, weight expansion, multi-winner selection, CSV import, reset
- `DrawTool` integration tests: winner count input gate, CSV button trigger, elimination display, reset button visibility
- Existing slot machine animation tests: unchanged

---

## Out of Scope

- Weight persistence across sessions
- CSV column mapping UI
- Animated individual winner reveals (sequential slot machines per winner)
- Elimination persistence to DB
