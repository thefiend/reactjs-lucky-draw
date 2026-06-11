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

  it('never draws the same person twice even with weighted entries', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useDrawEngine('pro'));
    // Alice has weight 3, but should only win once
    act(() => { result.current.setEntriesText('Alice x3\nBob\nCarol'); });
    act(() => { result.current.setWinnerCount(2); });
    act(() => { result.current.handleDraw(); });
    await act(async () => { jest.advanceTimersByTime(3000); });
    expect(result.current.winners.length).toBe(2);
    expect(new Set(result.current.winners).size).toBe(2);
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
