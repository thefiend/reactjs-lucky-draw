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
        options.onDrawComplete?.(parsedEntries.map((e) => e.name), drawn);
        if (canUse('history', plan) && userId) {
          saveDrawAction({
            userId,
            entries: parsedEntries.map((e) => e.name),
            winners: drawn,
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
