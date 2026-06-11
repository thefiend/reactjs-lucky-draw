# Group A Draw Enhancements — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add multiple winners, CSV import, weighted entries, and elimination mode to the draw tool while extracting all logic into a `useDrawEngine` hook.

**Architecture:** Pure parsing functions in `lib/parseEntries.ts` → custom hook `lib/useDrawEngine.ts` owns all state and actions → `components/DrawTool.tsx` becomes a thin UI shell. `lib/plan.ts` gains a `multi-winner` feature key gating >1 winner at Pro.

**Tech Stack:** React hooks, Jest + `@testing-library/react` (`renderHook`), browser FileReader API, canvas-confetti (existing).

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `lib/plan.ts` | Modify | Add `'multi-winner'` feature |
| `lib/__tests__/plan.test.ts` | Modify | Add multi-winner assertions |
| `lib/parseEntries.ts` | Create | Pure parse + expand functions |
| `lib/__tests__/parseEntries.test.ts` | Create | Unit tests for parsing |
| `lib/useDrawEngine.ts` | Create | All draw state and actions |
| `lib/__tests__/useDrawEngine.test.ts` | Create | Hook unit tests |
| `components/DrawTool.tsx` | Modify | Thin UI shell using hook |
| `components/__tests__/DrawTool.test.tsx` | Modify | Integration tests for new UI |

---

## Task 1: Add `multi-winner` to plan feature map

**Files:**
- Modify: `lib/plan.ts`
- Modify: `lib/__tests__/plan.test.ts`

- [ ] **Step 1: Write the failing tests**

Add inside the existing `describe('canUse')` block in `lib/__tests__/plan.test.ts`:

```typescript
it('free plan cannot use multi-winner', () => {
  expect(canUse('multi-winner', 'free')).toBe(false);
});

it('pro plan can use multi-winner', () => {
  expect(canUse('multi-winner', 'pro')).toBe(true);
});

it('business plan can use multi-winner', () => {
  expect(canUse('multi-winner', 'business')).toBe(true);
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npx jest lib/__tests__/plan.test.ts --no-coverage
```

Expected: TypeScript compile error — `'multi-winner'` not assignable to `Feature`.

- [ ] **Step 3: Update `lib/plan.ts`**

```typescript
export type Feature = 'export' | 'history' | 'unlimited' | 'noad' | 'whitelabel' | 'api' | 'multi-winner';
export type Plan = 'free' | 'pro' | 'business';

export const PRO_FEATURES: Feature[] = ['export', 'history', 'unlimited', 'noad', 'multi-winner'];

export function canUse(feature: Feature, plan: Plan): boolean {
  if (plan === 'business') return true;
  if (plan === 'pro') return PRO_FEATURES.includes(feature);
  return false;
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
npx jest lib/__tests__/plan.test.ts --no-coverage
```

Expected: all 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/plan.ts lib/__tests__/plan.test.ts
git commit -m "feat: add multi-winner feature gate to plan"
```

---

## Task 2: Create `lib/parseEntries.ts`

**Files:**
- Create: `lib/parseEntries.ts`
- Create: `lib/__tests__/parseEntries.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/__tests__/parseEntries.test.ts`:

```typescript
import { parseEntries, expandPool } from '@/lib/parseEntries';

describe('parseEntries', () => {
  it('parses plain names with weight 1', () => {
    expect(parseEntries('Alice\nBob')).toEqual([
      { name: 'Alice', weight: 1 },
      { name: 'Bob', weight: 1 },
    ]);
  });

  it('parses weighted entries with x syntax', () => {
    expect(parseEntries('Alice x3')).toEqual([{ name: 'Alice', weight: 3 }]);
  });

  it('is case-insensitive for x syntax', () => {
    expect(parseEntries('Alice X2')).toEqual([{ name: 'Alice', weight: 2 }]);
  });

  it('trims whitespace from names', () => {
    expect(parseEntries('  Alice  \n  Bob  ')).toEqual([
      { name: 'Alice', weight: 1 },
      { name: 'Bob', weight: 1 },
    ]);
  });

  it('filters empty lines', () => {
    expect(parseEntries('Alice\n\nBob\n')).toEqual([
      { name: 'Alice', weight: 1 },
      { name: 'Bob', weight: 1 },
    ]);
  });

  it('treats "Name x0" as weight 1', () => {
    expect(parseEntries('Alice x0')).toEqual([{ name: 'Alice', weight: 1 }]);
  });

  it('returns empty array for empty string', () => {
    expect(parseEntries('')).toEqual([]);
  });
});

describe('expandPool', () => {
  it('expands weighted entries into flat array', () => {
    const parsed = [
      { name: 'Alice', weight: 3 },
      { name: 'Bob', weight: 1 },
    ];
    expect(expandPool(parsed)).toEqual(['Alice', 'Alice', 'Alice', 'Bob']);
  });

  it('returns single entry for weight 1', () => {
    expect(expandPool([{ name: 'Alice', weight: 1 }])).toEqual(['Alice']);
  });

  it('returns empty array for empty input', () => {
    expect(expandPool([])).toEqual([]);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npx jest lib/__tests__/parseEntries.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '@/lib/parseEntries'`.

- [ ] **Step 3: Create `lib/parseEntries.ts`**

```typescript
export interface ParsedEntry {
  name: string;
  weight: number;
}

const WEIGHT_REGEX = /^(.+?)\s+x(\d+)$/i;

export function parseEntries(text: string): ParsedEntry[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(WEIGHT_REGEX);
      if (match) {
        const weight = parseInt(match[2], 10);
        return { name: match[1].trim(), weight: weight > 0 ? weight : 1 };
      }
      return { name: line, weight: 1 };
    });
}

export function expandPool(entries: ParsedEntry[]): string[] {
  return entries.flatMap(({ name, weight }) => Array(weight).fill(name) as string[]);
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
npx jest lib/__tests__/parseEntries.test.ts --no-coverage
```

Expected: all 10 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/parseEntries.ts lib/__tests__/parseEntries.test.ts
git commit -m "feat: add parseEntries and expandPool utilities"
```

---

## Task 3: Create `lib/useDrawEngine.ts`

**Files:**
- Create: `lib/useDrawEngine.ts`
- Create: `lib/__tests__/useDrawEngine.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/__tests__/useDrawEngine.test.ts`:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useDrawEngine } from '@/lib/useDrawEngine';

jest.mock('@/app/actions', () => ({ saveDrawAction: jest.fn() }));
jest.mock('canvas-confetti', () => jest.fn());

afterEach(() => {
  jest.useRealTimers();
});

describe('useDrawEngine — entry parsing', () => {
  it('returns parsedEntries from entriesText', () => {
    const { result } = renderHook(() => useDrawEngine('free'));
    act(() => { result.current.setEntriesText('Alice x3\nBob'); });
    expect(result.current.parsedEntries).toEqual([
      { name: 'Alice', weight: 3 },
      { name: 'Bob', weight: 1 },
    ]);
  });

  it('entryCount counts unique names (not expanded slots)', () => {
    const { result } = renderHook(() => useDrawEngine('free'));
    act(() => { result.current.setEntriesText('Alice x3\nBob'); });
    expect(result.current.entryCount).toBe(2);
  });

  it('expandedPool repeats names by weight', () => {
    const { result } = renderHook(() => useDrawEngine('free'));
    act(() => { result.current.setEntriesText('Alice x2\nBob'); });
    expect(result.current.expandedPool).toEqual(['Alice', 'Alice', 'Bob']);
  });
});

describe('useDrawEngine — handleDraw', () => {
  it('picks 1 winner for pro user after animation', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useDrawEngine('pro'));
    act(() => { result.current.setEntriesText('Alice\nBob\nCarol'); });
    act(() => { result.current.handleDraw(); });
    await act(async () => { jest.advanceTimersByTime(3000); });
    expect(result.current.winners.length).toBe(1);
    expect(['Alice', 'Bob', 'Carol']).toContain(result.current.winners[0]);
  });

  it('picks N unique winners for pro user', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useDrawEngine('pro'));
    act(() => { result.current.setEntriesText('Alice\nBob\nCarol\nDave'); });
    act(() => { result.current.setWinnerCount(3); });
    act(() => { result.current.handleDraw(); });
    await act(async () => { jest.advanceTimersByTime(3000); });
    expect(result.current.winners.length).toBe(3);
    expect(new Set(result.current.winners).size).toBe(3);
  });

  it('shows upgrade prompt for multi-winner on free plan', () => {
    const { result } = renderHook(() => useDrawEngine('free'));
    act(() => { result.current.setEntriesText('Alice\nBob\nCarol'); });
    act(() => { result.current.setWinnerCount(2); });
    act(() => { result.current.handleDraw(); });
    expect(result.current.showUpgrade).toBe(true);
    expect(result.current.upgradeFeature).toBe('multi-winner');
  });

  it('shows upgrade prompt for >50 entries on free plan', () => {
    const { result } = renderHook(() => useDrawEngine('free'));
    const entries = Array.from({ length: 51 }, (_, i) => `Person ${i + 1}`).join('\n');
    act(() => { result.current.setEntriesText(entries); });
    act(() => { result.current.handleDraw(); });
    expect(result.current.showUpgrade).toBe(true);
    expect(result.current.upgradeFeature).toBe('unlimited');
  });

  it('excludes previous winners from pool on second draw', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useDrawEngine('pro'));
    act(() => { result.current.setEntriesText('Alice\nBob'); });
    act(() => { result.current.handleDraw(); });
    await act(async () => { jest.advanceTimersByTime(3000); });
    const firstWinner = result.current.winners[0];
    act(() => { result.current.handleDraw(); });
    await act(async () => { jest.advanceTimersByTime(3000); });
    expect(result.current.winners[0]).not.toBe(firstWinner);
  });

  it('appends drawn names to previousWinners', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useDrawEngine('pro'));
    act(() => { result.current.setEntriesText('Alice\nBob\nCarol'); });
    act(() => { result.current.handleDraw(); });
    await act(async () => { jest.advanceTimersByTime(3000); });
    expect(result.current.previousWinners.length).toBe(1);
  });
});

describe('useDrawEngine — handleReset', () => {
  it('clears winners and previousWinners', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useDrawEngine('pro'));
    act(() => { result.current.setEntriesText('Alice\nBob'); });
    act(() => { result.current.handleDraw(); });
    await act(async () => { jest.advanceTimersByTime(3000); });
    expect(result.current.previousWinners.length).toBeGreaterThan(0);
    act(() => { result.current.handleReset(); });
    expect(result.current.winners).toEqual([]);
    expect(result.current.previousWinners).toEqual([]);
  });
});

describe('useDrawEngine — handleCSVImport', () => {
  function mockFileReader(content: string) {
    const mockReader = {
      readAsText: jest.fn(),
      onload: null as ((e: ProgressEvent<FileReader>) => void) | null,
    };
    jest.spyOn(global, 'FileReader').mockImplementation(
      () => mockReader as unknown as FileReader
    );
    return { mockReader, content };
  }

  afterEach(() => {
    (global.FileReader as unknown as jest.SpyInstance).mockRestore?.();
  });

  it('appends CSV names to entriesText', () => {
    const { result } = renderHook(() => useDrawEngine('free'));
    act(() => { result.current.setEntriesText('Alice'); });

    const { mockReader, content } = mockFileReader('Bob\nCarol\nDave');
    const file = new File([content], 'entries.csv', { type: 'text/csv' });

    act(() => { result.current.handleCSVImport(file); });
    act(() => {
      mockReader.onload?.({ target: { result: content } } as unknown as ProgressEvent<FileReader>);
    });

    expect(result.current.entriesText).toBe('Alice\nBob\nCarol\nDave');
  });

  it('deduplicates names already in entriesText', () => {
    const { result } = renderHook(() => useDrawEngine('free'));
    act(() => { result.current.setEntriesText('Alice\nBob'); });

    const { mockReader, content } = mockFileReader('Bob\nCarol');
    const file = new File([content], 'entries.csv', { type: 'text/csv' });

    act(() => { result.current.handleCSVImport(file); });
    act(() => {
      mockReader.onload?.({ target: { result: content } } as unknown as ProgressEvent<FileReader>);
    });

    expect(result.current.entriesText).toBe('Alice\nBob\nCarol');
  });

  it('takes only the first column of each CSV row', () => {
    const { result } = renderHook(() => useDrawEngine('free'));
    act(() => { result.current.setEntriesText(''); });

    const csvWithColumns = 'Alice,email@a.com\nBob,email@b.com';
    const { mockReader, content } = mockFileReader(csvWithColumns);
    const file = new File([content], 'entries.csv', { type: 'text/csv' });

    act(() => { result.current.handleCSVImport(file); });
    act(() => {
      mockReader.onload?.({ target: { result: content } } as unknown as ProgressEvent<FileReader>);
    });

    expect(result.current.entriesText).toBe('Alice\nBob');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npx jest lib/__tests__/useDrawEngine.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '@/lib/useDrawEngine'`.

- [ ] **Step 3: Create `lib/useDrawEngine.ts`**

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { parseEntries, expandPool, type ParsedEntry } from '@/lib/parseEntries';
import { canUse, type Feature, type Plan } from '@/lib/plan';
import { saveDrawAction } from '@/app/actions';

export const FREE_ENTRY_LIMIT = 50;

const ANIMATION_INTERVALS = [60, 80, 110, 150, 200, 260, 300];
const ANIMATION_DURATION = 2000;

interface UseDrawEngineOptions {
  onDrawComplete?: (entries: string[], winners: string[]) => void;
}

export interface DrawEngineState {
  entriesText: string;
  setEntriesText: (text: string) => void;
  winnerCount: number;
  setWinnerCount: (count: number) => void;
  winners: string[];
  previousWinners: string[];
  isAnimating: boolean;
  displayName: string | null;
  showUpgrade: boolean;
  setShowUpgrade: (show: boolean) => void;
  upgradeFeature: Feature;
  setUpgradeFeature: (feature: Feature) => void;
  parsedEntries: ParsedEntry[];
  expandedPool: string[];
  availablePool: string[];
  entryCount: number;
  handleDraw: () => void;
  handleCSVImport: (file: File) => void;
  handleReset: () => void;
}

export function useDrawEngine(
  plan: Plan,
  userId?: string,
  options: UseDrawEngineOptions = {}
): DrawEngineState {
  const [entriesText, setEntriesText] = useState('');
  const [winnerCount, setWinnerCount] = useState(1);
  const [winners, setWinners] = useState<string[]>([]);
  const [previousWinners, setPreviousWinners] = useState<string[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<Feature>('unlimited');
  const animationRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, []);

  const parsedEntries = parseEntries(entriesText);
  const expandedPool = expandPool(parsedEntries);
  const entryCount = parsedEntries.length;
  const availablePool = expandedPool.filter((name) => !previousWinners.includes(name));

  function handleDraw() {
    if (winnerCount > 1 && !canUse('multi-winner', plan)) {
      setUpgradeFeature('multi-winner');
      setShowUpgrade(true);
      return;
    }
    if (!canUse('unlimited', plan) && entryCount > FREE_ENTRY_LIMIT) {
      setUpgradeFeature('unlimited');
      setShowUpgrade(true);
      return;
    }
    if (availablePool.length === 0) return;

    const count = Math.min(winnerCount, availablePool.length);
    const shuffled = [...availablePool].sort(() => Math.random() - 0.5);
    const drawn = shuffled.slice(0, count);

    setIsAnimating(true);
    setWinners([]);

    let elapsed = 0;
    let intervalIndex = 0;

    function tick() {
      const randomName = availablePool[Math.floor(Math.random() * availablePool.length)];
      setDisplayName(randomName);

      if (elapsed >= ANIMATION_DURATION) {
        setDisplayName(null);
        setIsAnimating(false);
        setWinners(drawn);
        const newPreviousWinners = [...previousWinners, ...drawn];
        setPreviousWinners(newPreviousWinners);
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
        options.onDrawComplete?.(parsedEntries.map((e) => e.name), newPreviousWinners);
        if (canUse('history', plan) && userId) {
          saveDrawAction({
            userId,
            entries: parsedEntries.map((e) => e.name),
            winners: newPreviousWinners,
            title: 'Untitled Draw',
          });
        }
        return;
      }

      const currentInterval = ANIMATION_INTERVALS[Math.min(intervalIndex, ANIMATION_INTERVALS.length - 1)];
      elapsed += currentInterval;
      const nextThreshold = (intervalIndex + 1) * (ANIMATION_DURATION / ANIMATION_INTERVALS.length);
      if (elapsed >= nextThreshold) intervalIndex++;
      animationRef.current = setTimeout(tick, currentInterval);
    }

    animationRef.current = setTimeout(tick, ANIMATION_INTERVALS[0]);
  }

  function handleCSVImport(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) ?? '';
      const existing = entriesText.split('\n').map((l) => l.trim()).filter(Boolean);
      const existingSet = new Set(existing);
      const newNames = text
        .split('\n')
        .map((row) => row.split(',')[0].trim())
        .filter((name) => name && !existingSet.has(name));
      setEntriesText([...existing, ...newNames].join('\n'));
    };
    reader.readAsText(file);
  }

  function handleReset() {
    setWinners([]);
    setPreviousWinners([]);
  }

  return {
    entriesText, setEntriesText,
    winnerCount, setWinnerCount,
    winners, previousWinners,
    isAnimating, displayName,
    showUpgrade, setShowUpgrade,
    upgradeFeature, setUpgradeFeature,
    parsedEntries, expandedPool, availablePool,
    entryCount,
    handleDraw, handleCSVImport, handleReset,
  };
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
npx jest lib/__tests__/useDrawEngine.test.ts --no-coverage
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/useDrawEngine.ts lib/__tests__/useDrawEngine.test.ts
git commit -m "feat: add useDrawEngine hook"
```

---

## Task 4: Refactor `DrawTool.tsx` + update integration tests

**Files:**
- Modify: `components/DrawTool.tsx`
- Modify: `components/__tests__/DrawTool.test.tsx`

- [ ] **Step 1: Update `DrawTool.test.tsx` to use new testid `winner-display-0`**

Replace `components/__tests__/DrawTool.test.tsx` entirely:

```typescript
import { render, screen, fireEvent, act } from '@testing-library/react';
import DrawTool from '@/components/DrawTool';

jest.mock('@/app/actions', () => ({ saveDrawAction: jest.fn() }));
jest.mock('canvas-confetti', () => jest.fn());

afterEach(() => {
  jest.useRealTimers();
});

describe('DrawTool', () => {
  it('renders the entry textarea', () => {
    render(<DrawTool plan="free" />);
    expect(screen.getByPlaceholderText(/enter names/i)).toBeInTheDocument();
  });

  it('shows upgrade prompt when free user has more than 50 entries', () => {
    render(<DrawTool plan="free" />);
    const textarea = screen.getByPlaceholderText(/enter names/i);
    const entries = Array.from({ length: 51 }, (_, i) => `Person ${i + 1}`).join('\n');
    fireEvent.change(textarea, { target: { value: entries } });
    fireEvent.click(screen.getByRole('button', { name: /draw winner/i }));
    expect(screen.getByText(/upgrade to pro/i)).toBeInTheDocument();
  });

  it('draws a winner from entries for pro user', async () => {
    jest.useFakeTimers();
    render(<DrawTool plan="pro" />);
    fireEvent.change(screen.getByPlaceholderText(/enter names/i), {
      target: { value: 'Alice\nBob\nCharlie' },
    });
    fireEvent.click(screen.getByRole('button', { name: /draw winner/i }));
    await act(async () => { jest.advanceTimersByTime(3000); });
    const winner = screen.getByTestId('winner-display-0');
    expect(['Alice', 'Bob', 'Charlie']).toContain(winner.textContent);
  });

  it('does not show ads for pro user', () => {
    const { container } = render(<DrawTool plan="pro" />);
    expect(container.querySelector('[data-ad]')).not.toBeInTheDocument();
  });

  it('disables draw button while animating', async () => {
    jest.useFakeTimers();
    render(<DrawTool plan="pro" />);
    fireEvent.change(screen.getByPlaceholderText(/enter names/i), {
      target: { value: 'Alice\nBob\nCharlie' },
    });
    const drawButton = screen.getByRole('button', { name: /draw winner/i });
    fireEvent.click(drawButton);
    expect(drawButton).toBeDisabled();
    await act(async () => { jest.advanceTimersByTime(3000); });
    expect(drawButton).not.toBeDisabled();
  });

  it('does not show winner-display during animation', async () => {
    jest.useFakeTimers();
    render(<DrawTool plan="pro" />);
    fireEvent.change(screen.getByPlaceholderText(/enter names/i), {
      target: { value: 'Alice\nBob\nCharlie' },
    });
    fireEvent.click(screen.getByRole('button', { name: /draw winner/i }));
    expect(screen.queryByTestId('winner-display-0')).not.toBeInTheDocument();
    await act(async () => { jest.advanceTimersByTime(3000); });
    expect(screen.getByTestId('winner-display-0')).toBeInTheDocument();
  });

  it('fires confetti when winner is revealed', async () => {
    jest.useFakeTimers();
    const confetti = require('canvas-confetti') as jest.Mock;
    confetti.mockClear();
    render(<DrawTool plan="pro" />);
    fireEvent.change(screen.getByPlaceholderText(/enter names/i), {
      target: { value: 'Alice\nBob\nCharlie' },
    });
    fireEvent.click(screen.getByRole('button', { name: /draw winner/i }));
    await act(async () => { jest.advanceTimersByTime(3000); });
    expect(confetti).toHaveBeenCalledTimes(1);
    expect(confetti).toHaveBeenCalledWith(
      expect.objectContaining({ particleCount: 120, spread: 70 })
    );
  });

  it('shows upgrade prompt when free user changes winner count to 2', () => {
    render(<DrawTool plan="free" />);
    fireEvent.change(screen.getByPlaceholderText(/enter names/i), {
      target: { value: 'Alice\nBob\nCarol' },
    });
    const countInput = screen.getByRole('spinbutton');
    fireEvent.change(countInput, { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: /draw winner/i }));
    expect(screen.getByText(/upgrade to pro/i)).toBeInTheDocument();
  });

  it('renders multiple winners after draw with count 3', async () => {
    jest.useFakeTimers();
    render(<DrawTool plan="pro" />);
    fireEvent.change(screen.getByPlaceholderText(/enter names/i), {
      target: { value: 'Alice\nBob\nCarol\nDave' },
    });
    const countInput = screen.getByRole('spinbutton');
    fireEvent.change(countInput, { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: /draw winner/i }));
    await act(async () => { jest.advanceTimersByTime(3000); });
    expect(screen.getByTestId('winner-display-0')).toBeInTheDocument();
    expect(screen.getByTestId('winner-display-1')).toBeInTheDocument();
    expect(screen.getByTestId('winner-display-2')).toBeInTheDocument();
  });

  it('shows reset button after a draw and clears on click', async () => {
    jest.useFakeTimers();
    render(<DrawTool plan="pro" />);
    fireEvent.change(screen.getByPlaceholderText(/enter names/i), {
      target: { value: 'Alice\nBob\nCarol' },
    });
    fireEvent.click(screen.getByRole('button', { name: /draw winner/i }));
    await act(async () => { jest.advanceTimersByTime(3000); });
    const resetBtn = screen.getByRole('button', { name: /reset draw/i });
    expect(resetBtn).toBeInTheDocument();
    fireEvent.click(resetBtn);
    expect(screen.queryByTestId('winner-display-0')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify tests fail**

```bash
npx jest components/__tests__/DrawTool.test.tsx --no-coverage
```

Expected: FAIL — `winner-display-0` not found, reset button not found.

- [ ] **Step 3: Replace `components/DrawTool.tsx`**

```tsx
'use client';

import { useRef } from 'react';
import { useDrawEngine } from '@/lib/useDrawEngine';
import { canUse } from '@/lib/plan';
import UpgradePrompt from '@/components/UpgradePrompt';
import type { Plan } from '@/lib/plan';

const FREE_ENTRY_LIMIT = 50;

interface DrawToolProps {
  plan: Plan;
  userId?: string;
  onDrawComplete?: (entries: string[], winners: string[]) => void;
}

export default function DrawTool({ plan, userId, onDrawComplete }: DrawToolProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    entriesText, setEntriesText,
    winnerCount, setWinnerCount,
    winners, previousWinners,
    isAnimating, displayName,
    showUpgrade, setShowUpgrade,
    upgradeFeature, setUpgradeFeature,
    entryCount,
    handleDraw, handleCSVImport, handleReset,
  } = useDrawEngine(plan, userId, { onDrawComplete });

  function handleWinnerCountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Math.max(1, parseInt(e.target.value, 10) || 1);
    setWinnerCount(val);
    if (val > 1 && !canUse('multi-winner', plan)) {
      setUpgradeFeature('multi-winner');
      setShowUpgrade(true);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4">

      {/* Header */}
      <div className="text-center mb-8" style={{ animation: 'fade-up 0.5s ease both' }}>
        <h1
          className="text-4xl font-bold tracking-tight text-[#0D4972] mb-2"
          style={{ fontFamily: 'var(--font-jost)' }}
        >
          Lucky Draw Online Generator
        </h1>
        <p className="text-sm text-[#4A4A4A]/50">
          Enter names below, one per line, then click Draw.
        </p>
      </div>

      {/* Card */}
      <div
        className="bg-white rounded-2xl p-7"
        style={{ boxShadow: 'var(--shadow-card)', animation: 'fade-up 0.5s 0.1s ease both', opacity: 0 }}
      >
        <textarea
          className={`w-full h-44 border border-[#9CD6EF]/50 rounded-xl p-4 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-[#139DD9]/40 focus:border-[#139DD9]/60 placeholder:text-[#9CD6EF] transition-all${isAnimating ? ' opacity-40 pointer-events-none' : ''}`}
          style={{ boxShadow: 'inset 0 2px 6px rgba(13,73,114,0.04)' }}
          placeholder="Enter names, one per line..."
          value={entriesText}
          onChange={(e) => setEntriesText(e.target.value)}
        />

        {!canUse('unlimited', plan) && (
          <p className="text-xs text-[#9CD6EF] mt-1.5">
            {entryCount}/{FREE_ENTRY_LIMIT} entries (free tier)
          </p>
        )}

        {/* Winner count */}
        <div className="flex items-center gap-2 mt-4 text-sm text-[#4A4A4A]/70">
          <span>Draw</span>
          <input
            type="number"
            min={1}
            value={winnerCount}
            onChange={handleWinnerCountChange}
            disabled={isAnimating}
            className="w-16 border border-[#9CD6EF]/50 rounded-lg px-2 py-1 text-center text-sm font-medium text-[#0D4972] focus:outline-none focus:ring-2 focus:ring-[#139DD9]/40 disabled:opacity-40"
          />
          <span>winner{winnerCount !== 1 ? 's' : ''}</span>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={handleDraw}
            disabled={isAnimating}
            aria-label={isAnimating ? 'Drawing...' : 'Draw Winner'}
            className="flex-1 text-white py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all disabled:cursor-not-allowed"
            style={{
              background: isAnimating
                ? 'linear-gradient(135deg, #9CD6EF, #66C6EB)'
                : 'linear-gradient(135deg, #198BCA 0%, #1565C0 100%)',
              boxShadow: isAnimating ? 'none' : 'var(--shadow-btn)',
              fontFamily: 'var(--font-jost)',
            }}
            onMouseEnter={(e) => { if (!isAnimating) (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
          >
            {isAnimating ? 'Drawing...' : 'Draw Winner'}
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnimating}
            className="px-4 py-3.5 rounded-xl text-sm font-medium text-[#198BCA] border border-[#9CD6EF]/60 hover:bg-[#EBF7FD] hover:border-[#66C6EB] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Import CSV
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleCSVImport(file);
              e.target.value = '';
            }}
          />

          <button
            onClick={() => { window.location.href = '/api/export?format=csv'; }}
            disabled={isAnimating}
            className="px-4 py-3.5 rounded-xl text-sm font-medium text-[#198BCA] border border-[#9CD6EF]/60 hover:bg-[#EBF7FD] hover:border-[#66C6EB] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Export
          </button>
        </div>

        {/* Slot machine animation */}
        {isAnimating && displayName && (
          <div className="mt-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#9CD6EF] mb-3">
              Drawing...
            </p>
            <div
              className="inline-block text-4xl font-bold px-8 py-3 rounded-2xl min-w-[200px]"
              style={{
                fontFamily: 'var(--font-jost)',
                background: 'linear-gradient(135deg, #EBF7FD, #ddf0fa)',
                color: '#198BCA',
                boxShadow: '0 0 0 1px rgba(156,214,239,0.4), inset 0 1px 0 rgba(255,255,255,0.8)',
              }}
            >
              {displayName}
            </div>
            <div className="mt-4 w-48 h-0.5 bg-[#9CD6EF]/20 rounded-full mx-auto overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #139DD9, #1D72FF)',
                  animation: 'progress-fill 2s linear forwards',
                }}
              />
            </div>
          </div>
        )}

        {/* Winner reveal */}
        {!isAnimating && winners.length > 0 && (
          <div
            className="mt-8 text-center py-6 rounded-xl"
            style={{
              background: 'linear-gradient(160deg, #f0f8fd 0%, #e6f4fb 100%)',
              animation: 'winner-appear 0.55s cubic-bezier(0.34,1.56,0.64,1) both',
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-[#139DD9] mb-3">
              🎉 {winners.length === 1 ? 'Winner' : 'Winners'}
            </p>
            {winners.map((w, i) => (
              <p
                key={`${w}-${i}`}
                data-testid={`winner-display-${i}`}
                className="text-5xl font-bold text-[#0D4972]"
                style={{
                  fontFamily: 'var(--font-jost)',
                  filter: 'drop-shadow(0 2px 16px rgba(19,157,217,0.22))',
                  animationDelay: `${i * 80}ms`,
                }}
              >
                {winners.length > 1 && (
                  <span className="text-2xl mr-2 text-[#139DD9]">{i + 1}.</span>
                )}
                {w}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Previously drawn */}
      {previousWinners.length > 0 && (
        <div className="mt-5 px-1" style={{ animation: 'fade-up 0.4s ease both' }}>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9CD6EF] mb-2.5">
            Previously drawn
          </p>
          <ul className="flex flex-wrap gap-2">
            {previousWinners.map((w) => (
              <li
                key={w}
                className="text-sm px-3 py-1 rounded-full text-[#0D6394] border border-[#9CD6EF]/50 line-through opacity-50"
                style={{ background: 'rgba(235,247,253,0.8)' }}
              >
                {w}
              </li>
            ))}
          </ul>
          <button
            onClick={handleReset}
            className="mt-3 text-xs text-[#9CD6EF] hover:text-[#198BCA] transition-colors"
          >
            Reset draw
          </button>
        </div>
      )}

      {!canUse('noad', plan) && (
        <div data-ad className="mt-6 text-center text-[#9CD6EF]/60 text-xs border border-dashed border-[#9CD6EF]/30 rounded-xl p-4">
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

- [ ] **Step 4: Run all tests to verify everything passes**

```bash
npx jest --no-coverage
```

Expected: all tests PASS across all test files.

- [ ] **Step 5: Commit**

```bash
git add components/DrawTool.tsx components/__tests__/DrawTool.test.tsx
git commit -m "feat: refactor DrawTool to use useDrawEngine hook, add multi-winner UI, CSV import, elimination, reset"
```

---

## Final verification

- [ ] **Run full test suite**

```bash
npx jest --no-coverage
```

Expected: all tests PASS.

- [ ] **TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Commit if clean**

```bash
git add -A
git status  # should be empty or only untracked
```
