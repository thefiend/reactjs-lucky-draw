# Group B: History Replay + Winner Certificate — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add slot-machine replay for draw history and one-click PNG certificate download, sharing a `useSlotMachine` hook and `WinnerCard` component across the main draw tool and the Pro dashboard.

**Architecture:** Extract animation loop from `useDrawEngine` into `lib/useSlotMachine.ts` → `components/WinnerCard.tsx` renders an off-screen branded card for `html2canvas` capture → `lib/downloadCertificate.ts` handles PNG export → `components/DrawHistoryList.tsx` is a client component that consumes both for replay + download on the dashboard. `app/dashboard/page.tsx` stays a server component and passes data down.

**Tech Stack:** React hooks, html2canvas, Jest + @testing-library/react, canvas-confetti (existing).

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `lib/useSlotMachine.ts` | Create | Animation hook: cycles names, calls onComplete |
| `lib/__tests__/useSlotMachine.test.ts` | Create | Hook unit tests |
| `lib/useDrawEngine.ts` | Modify | Replace inline animation with useSlotMachine |
| `lib/downloadCertificate.ts` | Create | html2canvas → PNG → anchor download |
| `lib/__tests__/downloadCertificate.test.ts` | Create | Mock html2canvas, verify download flow |
| `components/WinnerCard.tsx` | Create | Branded 600×400 card, inline styles, off-screen |
| `components/__tests__/WinnerCard.test.tsx` | Create | Render, watermark, plan gating |
| `components/DrawTool.tsx` | Modify | Add certificate section after winner reveal |
| `components/__tests__/DrawTool.test.tsx` | Modify | Add certificate button tests |
| `components/DrawHistoryList.tsx` | Create | Client: replay state + lazy certificate download |
| `components/__tests__/DrawHistoryList.test.tsx` | Create | Integration tests |
| `app/dashboard/page.tsx` | Modify | Replace inline map with DrawHistoryList |

---

## Task 1: Install html2canvas

**Files:**
- Modify: `package.json` (via npm install)

- [ ] **Step 1: Install**

```bash
npm install html2canvas
```

- [ ] **Step 2: Verify TypeScript can find types**

```bash
npx tsc --noEmit 2>&1 | grep html2canvas
```

Expected: no output (types ship with html2canvas).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit --no-gpg-sign -m "chore: add html2canvas dependency"
```

---

## Task 2: Create `lib/useSlotMachine.ts`

**Files:**
- Create: `lib/useSlotMachine.ts`
- Create: `lib/__tests__/useSlotMachine.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/__tests__/useSlotMachine.test.ts`:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useSlotMachine } from '@/lib/useSlotMachine';

afterEach(() => {
  jest.useRealTimers();
});

describe('useSlotMachine', () => {
  it('starts with isAnimating false and displayName null', () => {
    const { result } = renderHook(() => useSlotMachine());
    expect(result.current.isAnimating).toBe(false);
    expect(result.current.displayName).toBeNull();
  });

  it('sets isAnimating to true when run is called', () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useSlotMachine());
    act(() => { result.current.run(['Alice', 'Bob'], jest.fn()); });
    expect(result.current.isAnimating).toBe(true);
  });

  it('sets displayName to a pool member while animating', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useSlotMachine());
    act(() => { result.current.run(['Alice', 'Bob'], jest.fn()); });
    await act(async () => { jest.advanceTimersByTime(100); });
    expect(['Alice', 'Bob']).toContain(result.current.displayName);
  });

  it('calls onComplete after animation finishes', async () => {
    jest.useFakeTimers();
    const onComplete = jest.fn();
    const { result } = renderHook(() => useSlotMachine());
    act(() => { result.current.run(['Alice', 'Bob'], onComplete); });
    await act(async () => { jest.advanceTimersByTime(3000); });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('sets isAnimating to false after animation finishes', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useSlotMachine());
    act(() => { result.current.run(['Alice', 'Bob'], jest.fn()); });
    await act(async () => { jest.advanceTimersByTime(3000); });
    expect(result.current.isAnimating).toBe(false);
  });

  it('sets displayName to null after animation finishes', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useSlotMachine());
    act(() => { result.current.run(['Alice', 'Bob'], jest.fn()); });
    await act(async () => { jest.advanceTimersByTime(3000); });
    expect(result.current.displayName).toBeNull();
  });

  it('ignores second run call while already animating', async () => {
    jest.useFakeTimers();
    const first = jest.fn();
    const second = jest.fn();
    const { result } = renderHook(() => useSlotMachine());
    act(() => { result.current.run(['Alice'], first); });
    act(() => { result.current.run(['Bob'], second); });
    await act(async () => { jest.advanceTimersByTime(3000); });
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npx jest lib/__tests__/useSlotMachine.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '@/lib/useSlotMachine'`.

- [ ] **Step 3: Create `lib/useSlotMachine.ts`**

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';

const ANIMATION_INTERVALS = [60, 80, 110, 150, 200, 260, 300];
const ANIMATION_DURATION = 2000;

export interface SlotMachineState {
  displayName: string | null;
  isAnimating: boolean;
  run: (pool: string[], onComplete: () => void) => void;
}

export function useSlotMachine(): SlotMachineState {
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, []);

  function run(pool: string[], onComplete: () => void) {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setIsAnimating(true);

    let elapsed = 0;
    let intervalIndex = 0;

    function tick() {
      const randomName = pool[Math.floor(Math.random() * pool.length)];
      setDisplayName(randomName);

      if (elapsed >= ANIMATION_DURATION) {
        setDisplayName(null);
        setIsAnimating(false);
        isAnimatingRef.current = false;
        onComplete();
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

  return { displayName, isAnimating, run };
}
```

Note: `isAnimatingRef` is a synchronous guard (React state updates are batched, so `isAnimating` state may not reflect the latest value inside the same render cycle; the ref ensures `run` cannot be entered twice even if called synchronously back-to-back).

- [ ] **Step 4: Run to verify it passes**

```bash
npx jest lib/__tests__/useSlotMachine.test.ts --no-coverage
```

Expected: 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/useSlotMachine.ts lib/__tests__/useSlotMachine.test.ts
git commit --no-gpg-sign -m "feat: add useSlotMachine animation hook"
```

---

## Task 3: Refactor `lib/useDrawEngine.ts` to use `useSlotMachine`

**Files:**
- Modify: `lib/useDrawEngine.ts`

- [ ] **Step 1: Run existing tests to confirm baseline**

```bash
npx jest lib/__tests__/useDrawEngine.test.ts --no-coverage
```

Expected: 14 tests PASS (baseline before changes).

- [ ] **Step 2: Replace `useDrawEngine.ts` with refactored version**

Replace the entire file at `lib/useDrawEngine.ts`:

```typescript
'use client';

import { useState } from 'react';
import confetti from 'canvas-confetti';
import { parseEntries, expandPool, type ParsedEntry } from '@/lib/parseEntries';
import { canUse, type Feature, type Plan } from '@/lib/plan';
import { saveDrawAction } from '@/app/actions';
import { useSlotMachine } from '@/lib/useSlotMachine';

export const FREE_ENTRY_LIMIT = 50;

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
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<Feature>('unlimited');

  const { displayName, isAnimating, run } = useSlotMachine();

  const parsedEntries = parseEntries(entriesText);
  const expandedPool = expandPool(parsedEntries);
  const entryCount = parsedEntries.length;
  const availablePool = expandedPool.filter((name) => !previousWinners.includes(name));

  function handleDraw() {
    if (isAnimating) return;
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
    const drawn = [...new Set(shuffled)].slice(0, count);

    setWinners([]);

    run(availablePool, () => {
      setWinners(drawn);
      const newPreviousWinners = [...previousWinners, ...drawn];
      setPreviousWinners(newPreviousWinners);
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      options.onDrawComplete?.(parsedEntries.map((e) => e.name), drawn);
      if (canUse('history', plan) && userId) {
        saveDrawAction({
          userId,
          entries: parsedEntries.map((e) => e.name),
          winners: drawn,
          title: 'Untitled Draw',
        });
      }
    });
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

- [ ] **Step 3: Run tests to verify nothing regressed**

```bash
npx jest lib/__tests__/useDrawEngine.test.ts lib/__tests__/useSlotMachine.test.ts --no-coverage
```

Expected: all tests PASS (14 + 7 = 21).

- [ ] **Step 4: Run full suite**

```bash
npx jest --no-coverage
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/useDrawEngine.ts
git commit --no-gpg-sign -m "refactor: replace inline animation loop in useDrawEngine with useSlotMachine"
```

---

## Task 4: Create `lib/downloadCertificate.ts`

**Files:**
- Create: `lib/downloadCertificate.ts`
- Create: `lib/__tests__/downloadCertificate.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/__tests__/downloadCertificate.test.ts`:

```typescript
import { downloadCertificate } from '@/lib/downloadCertificate';

jest.mock('html2canvas', () => jest.fn());

describe('downloadCertificate', () => {
  let createObjectURL: jest.Mock;
  let revokeObjectURL: jest.Mock;
  let clickSpy: jest.SpyInstance;

  beforeEach(() => {
    createObjectURL = jest.fn(() => 'blob:mock-url');
    revokeObjectURL = jest.fn();
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;
    clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  afterEach(() => {
    clickSpy.mockRestore();
  });

  it('does nothing when ref.current is null', async () => {
    const html2canvas = require('html2canvas') as jest.Mock;
    await downloadCertificate({ current: null }, 'test.png');
    expect(html2canvas).not.toHaveBeenCalled();
  });

  it('calls html2canvas with the element', async () => {
    const html2canvas = require('html2canvas') as jest.Mock;
    const mockBlob = new Blob(['test']);
    html2canvas.mockResolvedValue({
      toBlob: jest.fn((cb: (blob: Blob) => void) => cb(mockBlob)),
    });

    const div = document.createElement('div');
    await downloadCertificate({ current: div }, 'test.png');

    expect(html2canvas).toHaveBeenCalledWith(div, { useCORS: true, scale: 2 });
  });

  it('creates and revokes object URL', async () => {
    const html2canvas = require('html2canvas') as jest.Mock;
    const mockBlob = new Blob(['test']);
    html2canvas.mockResolvedValue({
      toBlob: jest.fn((cb: (blob: Blob) => void) => cb(mockBlob)),
    });

    const div = document.createElement('div');
    await downloadCertificate({ current: div }, 'test.png');

    expect(createObjectURL).toHaveBeenCalledWith(mockBlob);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('triggers anchor click with correct download attribute', async () => {
    const html2canvas = require('html2canvas') as jest.Mock;
    const mockBlob = new Blob(['test']);
    html2canvas.mockResolvedValue({
      toBlob: jest.fn((cb: (blob: Blob) => void) => cb(mockBlob)),
    });

    const div = document.createElement('div');
    await downloadCertificate({ current: div }, 'my-cert.png');

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npx jest lib/__tests__/downloadCertificate.test.ts --no-coverage
```

Expected: FAIL — `Cannot find module '@/lib/downloadCertificate'`.

- [ ] **Step 3: Create `lib/downloadCertificate.ts`**

```typescript
import html2canvas from 'html2canvas';

export async function downloadCertificate(
  ref: { current: HTMLDivElement | null },
  filename: string
): Promise<void> {
  if (!ref.current) return;

  const canvas = await html2canvas(ref.current, { useCORS: true, scale: 2 });

  return new Promise<void>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) { resolve(); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      resolve();
    });
  });
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
npx jest lib/__tests__/downloadCertificate.test.ts --no-coverage
```

Expected: 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/downloadCertificate.ts lib/__tests__/downloadCertificate.test.ts
git commit --no-gpg-sign -m "feat: add downloadCertificate utility"
```

---

## Task 5: Create `components/WinnerCard.tsx`

**Files:**
- Create: `components/WinnerCard.tsx`
- Create: `components/__tests__/WinnerCard.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `components/__tests__/WinnerCard.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import WinnerCard from '@/components/WinnerCard';

describe('WinnerCard', () => {
  it('renders all winner names', () => {
    const ref = createRef<HTMLDivElement>();
    render(<WinnerCard winners={['Alice', 'Bob']} title="Team Raffle" date="Jun 12 2026" plan="pro" cardRef={ref} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('renders title and date', () => {
    const ref = createRef<HTMLDivElement>();
    render(<WinnerCard winners={['Alice']} title="My Draw" date="Jun 12 2026" plan="pro" cardRef={ref} />);
    expect(screen.getByText(/My Draw/)).toBeInTheDocument();
    expect(screen.getByText(/Jun 12 2026/)).toBeInTheDocument();
  });

  it('shows watermark for free plan', () => {
    const ref = createRef<HTMLDivElement>();
    render(<WinnerCard winners={['Alice']} title="Draw" date="Jun 12 2026" plan="free" cardRef={ref} />);
    expect(screen.getByTestId('watermark')).toBeInTheDocument();
  });

  it('does not show watermark for pro plan', () => {
    const ref = createRef<HTMLDivElement>();
    render(<WinnerCard winners={['Alice']} title="Draw" date="Jun 12 2026" plan="pro" cardRef={ref} />);
    expect(screen.queryByTestId('watermark')).not.toBeInTheDocument();
  });

  it('does not show watermark for business plan', () => {
    const ref = createRef<HTMLDivElement>();
    render(<WinnerCard winners={['Alice']} title="Draw" date="Jun 12 2026" plan="business" cardRef={ref} />);
    expect(screen.queryByTestId('watermark')).not.toBeInTheDocument();
  });

  it('renders luckydraw.me branding', () => {
    const ref = createRef<HTMLDivElement>();
    render(<WinnerCard winners={['Alice']} title="Draw" date="Jun 12 2026" plan="pro" cardRef={ref} />);
    expect(screen.getByText('luckydraw.me')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npx jest components/__tests__/WinnerCard.test.tsx --no-coverage
```

Expected: FAIL — `Cannot find module '@/components/WinnerCard'`.

- [ ] **Step 3: Create `components/WinnerCard.tsx`**

```tsx
import type { Plan } from '@/lib/plan';

interface WinnerCardProps {
  winners: string[];
  title: string;
  date: string;
  plan: Plan;
  cardRef: React.RefObject<HTMLDivElement>;
}

export default function WinnerCard({ winners, title, date, plan, cardRef }: WinnerCardProps) {
  return (
    <div
      ref={cardRef}
      style={{
        position: 'absolute',
        left: '-9999px',
        top: 0,
        width: '600px',
        height: '400px',
        background: 'linear-gradient(135deg, #f0f8fd 0%, #e6f4fb 100%)',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        padding: '40px',
        boxSizing: 'border-box',
        overflow: 'hidden',
      } as React.CSSProperties}
    >
      {plan === 'free' && (
        <div
          data-testid="watermark"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontSize: '64px',
              fontWeight: 900,
              color: 'rgba(13,73,114,0.08)',
              transform: 'rotate(-30deg)',
              userSelect: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            luckydraw.me
          </span>
        </div>
      )}

      <p
        style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#139DD9',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '24px',
          margin: '0 0 24px 0',
        }}
      >
        🎉 Lucky Draw Winner
      </p>

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        {winners.map((w, i) => (
          <p
            key={`${w}-${i}`}
            style={{
              fontSize: winners.length === 1 ? '48px' : '32px',
              fontWeight: 700,
              color: '#0D4972',
              margin: '4px 0',
            }}
          >
            {w}
          </p>
        ))}
      </div>

      <p
        style={{
          fontSize: '13px',
          color: '#4A4A4A',
          opacity: 0.6,
          margin: '0 0 8px 0',
        }}
      >
        {title} · {date}
      </p>

      <p
        style={{
          fontSize: '12px',
          color: '#139DD9',
          fontWeight: 600,
          margin: 0,
        }}
      >
        luckydraw.me
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
npx jest components/__tests__/WinnerCard.test.tsx --no-coverage
```

Expected: 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add components/WinnerCard.tsx components/__tests__/WinnerCard.test.tsx
git commit --no-gpg-sign -m "feat: add WinnerCard component for certificate download"
```

---

## Task 6: Update `components/DrawTool.tsx` — add certificate section

**Files:**
- Modify: `components/DrawTool.tsx`
- Modify: `components/__tests__/DrawTool.test.tsx`

- [ ] **Step 1: Add failing tests to `DrawTool.test.tsx`**

Add these two tests inside the existing `describe('DrawTool')` block at the end of `components/__tests__/DrawTool.test.tsx`:

```typescript
  it('shows Download Certificate button after a draw', async () => {
    jest.useFakeTimers();
    render(<DrawTool plan="pro" />);
    fireEvent.change(screen.getByPlaceholderText(/enter names/i), {
      target: { value: 'Alice\nBob\nCarol' },
    });
    fireEvent.click(screen.getByRole('button', { name: /draw winner/i }));
    await act(async () => { jest.advanceTimersByTime(3000); });
    expect(screen.getByRole('button', { name: /download certificate/i })).toBeInTheDocument();
  });

  it('does not show Download Certificate button before a draw', () => {
    render(<DrawTool plan="pro" />);
    expect(screen.queryByRole('button', { name: /download certificate/i })).not.toBeInTheDocument();
  });
```

Also add at the top of the file, after existing mocks:
```typescript
jest.mock('@/lib/downloadCertificate', () => ({ downloadCertificate: jest.fn() }));
jest.mock('html2canvas', () => jest.fn());
```

- [ ] **Step 2: Run to verify new tests fail**

```bash
npx jest components/__tests__/DrawTool.test.tsx --no-coverage
```

Expected: FAIL on the 2 new tests — `Download Certificate` button not found.

- [ ] **Step 3: Update `components/DrawTool.tsx`**

Add these imports at the top (after existing imports):

```typescript
import { useRef } from 'react';  // already imported — no change needed
import WinnerCard from '@/components/WinnerCard';
import { downloadCertificate } from '@/lib/downloadCertificate';
```

Add `cardRef` declaration after `fileInputRef`:

```typescript
const cardRef = useRef<HTMLDivElement>(null);
```

Add the certificate section **after** the winner reveal `</div>` and **before** the closing `</div>` of the Card section (i.e. after line `</div>` that closes the winner reveal block, still inside the white card div):

```tsx
        {/* Certificate download */}
        {!isAnimating && winners.length > 0 && (
          <>
            <WinnerCard
              winners={winners}
              title="Lucky Draw"
              date={new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              plan={plan}
              cardRef={cardRef}
            />
            <div className="mt-4 text-center">
              <button
                onClick={() => downloadCertificate(cardRef, 'luckydraw-winner.png')}
                className="text-sm text-[#198BCA] border border-[#9CD6EF]/60 hover:bg-[#EBF7FD] rounded-xl px-4 py-2 transition-all"
              >
                Download Certificate
              </button>
            </div>
          </>
        )}
```

- [ ] **Step 4: Run all tests**

```bash
npx jest --no-coverage
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add components/DrawTool.tsx components/__tests__/DrawTool.test.tsx
git commit --no-gpg-sign -m "feat: add certificate download to DrawTool after winner reveal"
```

---

## Task 7: Create `components/DrawHistoryList.tsx`

**Files:**
- Create: `components/DrawHistoryList.tsx`
- Create: `components/__tests__/DrawHistoryList.test.tsx`

- [ ] **Step 1: Write the failing tests**

Create `components/__tests__/DrawHistoryList.test.tsx`:

```typescript
import { render, screen, fireEvent, act } from '@testing-library/react';
import DrawHistoryList from '@/components/DrawHistoryList';

jest.mock('canvas-confetti', () => jest.fn());
jest.mock('@/lib/downloadCertificate', () => ({ downloadCertificate: jest.fn() }));
jest.mock('html2canvas', () => jest.fn());

afterEach(() => {
  jest.useRealTimers();
});

const DRAWS = [
  {
    id: 'draw-1',
    title: 'Team Raffle',
    entries: ['Alice', 'Bob', 'Carol'],
    winners: ['Alice'],
    drawn_at: '2026-06-12T10:00:00Z',
  },
  {
    id: 'draw-2',
    title: 'Prize Draw',
    entries: ['Dave', 'Eve'],
    winners: ['Eve'],
    drawn_at: '2026-06-11T10:00:00Z',
  },
];

describe('DrawHistoryList', () => {
  it('renders draw titles and winners', () => {
    render(<DrawHistoryList draws={DRAWS} />);
    expect(screen.getByText('Team Raffle')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Prize Draw')).toBeInTheDocument();
    expect(screen.getByText('Eve')).toBeInTheDocument();
  });

  it('renders empty state when draws is empty', () => {
    render(<DrawHistoryList draws={[]} />);
    expect(screen.getByText(/no draws yet/i)).toBeInTheDocument();
  });

  it('renders Replay and Download Certificate buttons for each draw', () => {
    render(<DrawHistoryList draws={DRAWS} />);
    expect(screen.getAllByRole('button', { name: /replay/i })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /download certificate/i })).toHaveLength(2);
  });

  it('shows "Replaying..." and disables Replay button during animation', async () => {
    jest.useFakeTimers();
    render(<DrawHistoryList draws={DRAWS} />);
    const [replayBtn] = screen.getAllByRole('button', { name: /replay/i });
    fireEvent.click(replayBtn);
    expect(screen.getByRole('button', { name: /replaying/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /replay/i })[0]).toBeDisabled();
  });

  it('clears replaying state after animation completes', async () => {
    jest.useFakeTimers();
    render(<DrawHistoryList draws={DRAWS} />);
    const [replayBtn] = screen.getAllByRole('button', { name: /replay/i });
    fireEvent.click(replayBtn);
    await act(async () => { jest.advanceTimersByTime(3000); });
    expect(screen.queryByRole('button', { name: /replaying/i })).not.toBeInTheDocument();
  });

  it('fires confetti after replay completes', async () => {
    jest.useFakeTimers();
    const confetti = require('canvas-confetti') as jest.Mock;
    confetti.mockClear();
    render(<DrawHistoryList draws={DRAWS} />);
    const [replayBtn] = screen.getAllByRole('button', { name: /replay/i });
    fireEvent.click(replayBtn);
    await act(async () => { jest.advanceTimersByTime(3000); });
    expect(confetti).toHaveBeenCalledTimes(1);
  });

  it('calls downloadCertificate when Download Certificate is clicked', async () => {
    const { downloadCertificate } = require('@/lib/downloadCertificate') as { downloadCertificate: jest.Mock };
    downloadCertificate.mockClear();
    render(<DrawHistoryList draws={DRAWS} />);
    const [downloadBtn] = screen.getAllByRole('button', { name: /download certificate/i });
    fireEvent.click(downloadBtn);
    // Wait for useEffect to fire after state update
    await act(async () => {});
    expect(downloadCertificate).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npx jest components/__tests__/DrawHistoryList.test.tsx --no-coverage
```

Expected: FAIL — `Cannot find module '@/components/DrawHistoryList'`.

- [ ] **Step 3: Create `components/DrawHistoryList.tsx`**

```tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import React from 'react';
import confetti from 'canvas-confetti';
import { useSlotMachine } from '@/lib/useSlotMachine';
import WinnerCard from '@/components/WinnerCard';
import { downloadCertificate } from '@/lib/downloadCertificate';

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

export default function DrawHistoryList({ draws }: DrawHistoryListProps) {
  const [replayingId, setReplayingId] = useState<string | null>(null);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const { displayName, isAnimating, run } = useSlotMachine();
  const cardRefs = useRef<Map<string, React.RefObject<HTMLDivElement>>>(new Map());
  const pendingDownload = useRef<string | null>(null);

  function getCardRef(id: string): React.RefObject<HTMLDivElement> {
    if (!cardRefs.current.has(id)) {
      cardRefs.current.set(id, React.createRef<HTMLDivElement>());
    }
    return cardRefs.current.get(id)!;
  }

  function handleReplay(draw: Draw) {
    if (isAnimating) return;
    setReplayingId(draw.id);
    run(draw.entries, () => {
      setReplayingId(null);
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    });
  }

  function handleDownload(draw: Draw) {
    if (!downloadingIds.has(draw.id)) {
      pendingDownload.current = draw.id;
      setDownloadingIds((prev) => new Set([...prev, draw.id]));
    } else {
      const ref = getCardRef(draw.id);
      const date = new Date(draw.drawn_at).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      });
      downloadCertificate(ref, `luckydraw-${draw.id}.png`);
    }
  }

  useEffect(() => {
    if (!pendingDownload.current) return;
    const id = pendingDownload.current;
    pendingDownload.current = null;
    const draw = draws.find((d) => d.id === id);
    if (!draw) return;
    const ref = getCardRef(id);
    const date = new Date(draw.drawn_at).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
    downloadCertificate(ref, `luckydraw-${id}.png`);
  }, [downloadingIds]);

  if (draws.length === 0) {
    return (
      <p className="text-gray-500">
        No draws yet.{' '}
        <a href="/" className="text-indigo-600">
          Run your first draw →
        </a>
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {draws.map((draw) => {
        const isReplaying = replayingId === draw.id;
        const date = new Date(draw.drawn_at).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
        });

        return (
          <div key={draw.id} className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="font-semibold text-gray-900">{draw.title}</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {draw.entries.length} entries · {draw.winners.length} winner{draw.winners.length !== 1 ? 's' : ''}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {draw.winners.map((w) => (
                    <span
                      key={w}
                      className="bg-indigo-50 text-indigo-700 text-sm px-3 py-1 rounded-full font-medium"
                    >
                      {w}
                    </span>
                  ))}
                </div>

                {isReplaying && displayName && (
                  <div className="mt-4 text-center">
                    <div
                      className="inline-block text-2xl font-bold px-6 py-2 rounded-xl"
                      style={{
                        background: 'linear-gradient(135deg, #EBF7FD, #ddf0fa)',
                        color: '#198BCA',
                      }}
                    >
                      {displayName}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleReplay(draw)}
                    disabled={isAnimating}
                    className="text-sm text-[#198BCA] border border-[#9CD6EF]/60 hover:bg-[#EBF7FD] rounded-xl px-3 py-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isReplaying ? 'Replaying...' : 'Replay'}
                  </button>
                  <button
                    onClick={() => handleDownload(draw)}
                    className="text-sm text-[#198BCA] border border-[#9CD6EF]/60 hover:bg-[#EBF7FD] rounded-xl px-3 py-1.5 transition-all"
                  >
                    Download Certificate
                  </button>
                </div>
              </div>
              <span className="text-xs text-gray-400 ml-4">{date}</span>
            </div>

            {downloadingIds.has(draw.id) && (
              <WinnerCard
                winners={draw.winners}
                title={draw.title}
                date={date}
                plan="pro"
                cardRef={getCardRef(draw.id)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
npx jest components/__tests__/DrawHistoryList.test.tsx --no-coverage
```

Expected: 7 tests PASS.

- [ ] **Step 5: Run full suite**

```bash
npx jest --no-coverage
```

Expected: all tests PASS.

- [ ] **Step 6: Commit**

```bash
git add components/DrawHistoryList.tsx components/__tests__/DrawHistoryList.test.tsx
git commit --no-gpg-sign -m "feat: add DrawHistoryList with replay and certificate download"
```

---

## Task 8: Update `app/dashboard/page.tsx`

**Files:**
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: Replace the file**

Replace `app/dashboard/page.tsx` with:

```tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-admin';
import NavBar from '@/components/NavBar';
import DrawHistoryList from '@/components/DrawHistoryList';
import Link from 'next/link';

export default async function DashboardPage() {
  const { userId } = await auth();
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
          <DrawHistoryList draws={draws ?? []} />
        </div>
      </main>
    </>
  );
}
```

- [ ] **Step 2: Run full suite**

```bash
npx jest --no-coverage
```

Expected: all tests PASS.

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/page.tsx
git commit --no-gpg-sign -m "feat: replace dashboard inline map with DrawHistoryList"
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

Expected: no errors introduced by this feature.
