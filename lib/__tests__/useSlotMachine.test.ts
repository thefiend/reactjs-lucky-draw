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
