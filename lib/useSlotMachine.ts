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
