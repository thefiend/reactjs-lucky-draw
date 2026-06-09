'use client';

import { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { canUse } from '@/lib/plan';
import UpgradePrompt from '@/components/UpgradePrompt';
import type { Feature } from '@/lib/plan';
import { saveDrawAction } from '@/app/actions';

const FREE_ENTRY_LIMIT = 50;

interface DrawToolProps {
  plan: 'free' | 'pro' | 'business';
  userId?: string;
  onDrawComplete?: (entries: string[], winners: string[]) => void;
}

export default function DrawTool({ plan, userId, onDrawComplete }: DrawToolProps) {
  const [entriesText, setEntriesText] = useState('');
  const [winner, setWinner] = useState<string | null>(null);
  const [previousWinners, setPreviousWinners] = useState<string[]>([]);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<Feature>('unlimited');
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const animationRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const entries = entriesText
    .split('\n')
    .map((e) => e.trim())
    .filter(Boolean);

  function handleDraw() {
    if (!canUse('unlimited', plan) && entries.length > FREE_ENTRY_LIMIT) {
      setUpgradeFeature('unlimited');
      setShowUpgrade(true);
      return;
    }

    const available = entries.filter((e) => !previousWinners.includes(e));
    if (available.length === 0) return;

    const drawn = available[Math.floor(Math.random() * available.length)];

    setIsAnimating(true);
    setWinner(null);

    const intervals = [60, 80, 110, 150, 200, 260, 300];
    const totalDuration = 2000;
    let elapsed = 0;
    let intervalIndex = 0;

    function tick() {
      const randomName = available[Math.floor(Math.random() * available.length)];
      setDisplayName(randomName);

      if (elapsed >= totalDuration) {
        setDisplayName(null);
        setIsAnimating(false);
        setWinner(drawn);
        const newWinners = [...previousWinners, drawn];
        setPreviousWinners(newWinners);
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
        onDrawComplete?.(entries, newWinners);
        if (canUse('history', plan) && userId) {
          saveDrawAction({ userId, entries, winners: newWinners, title: 'Untitled Draw' });
        }
        return;
      }

      const currentInterval = intervals[Math.min(intervalIndex, intervals.length - 1)];
      elapsed += currentInterval;
      const nextIntervalThreshold = (intervalIndex + 1) * (totalDuration / intervals.length);
      if (elapsed >= nextIntervalThreshold) intervalIndex++;

      animationRef.current = setTimeout(tick, currentInterval);
    }

    animationRef.current = setTimeout(tick, intervals[0]);
  }

  function handleExport() {
    if (!canUse('export', plan)) {
      setUpgradeFeature('export');
      setShowUpgrade(true);
      return;
    }
    window.location.href = '/api/export?format=csv';
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Lucky Draw Online Generator</h1>
      <p className="text-gray-500 mb-6">Enter names below, one per line, then click Draw.</p>

      <textarea
        className={`w-full h-40 border border-gray-300 rounded-xl p-4 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-opacity${isAnimating ? ' opacity-50' : ''}`}
        placeholder="Enter names, one per line..."
        value={entriesText}
        onChange={(e) => setEntriesText(e.target.value)}
      />

      {!canUse('unlimited', plan) && (
        <p className="text-xs text-gray-400 mt-1">
          {entries.length}/{FREE_ENTRY_LIMIT} entries (free tier limit)
        </p>
      )}

      <div className="flex gap-3 mt-4">
        <button
          onClick={handleDraw}
          disabled={isAnimating}
          aria-label={isAnimating ? 'Drawing...' : 'Draw Winner'}
          className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isAnimating ? 'Drawing...' : 'Draw Winner'}
        </button>
        <button
          onClick={handleExport}
          disabled={isAnimating}
          className="px-4 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Export
        </button>
      </div>

      {isAnimating && displayName && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-1">Drawing...</p>
          <div className="inline-block bg-indigo-50 text-indigo-600 text-4xl font-bold px-6 py-2 rounded-xl min-w-[180px]">
            {displayName}
          </div>
          <div className="mt-3 w-40 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full"
              style={{
                animation: 'progress-fill 2s linear forwards',
              }}
            />
          </div>
        </div>
      )}

      {!isAnimating && winner && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-1">Winner</p>
          <p
            data-testid="winner-display"
            className="text-4xl font-bold text-indigo-600"
          >
            {winner}
          </p>
        </div>
      )}

      {previousWinners.length > 1 && (
        <div className="mt-6">
          <p className="text-sm font-medium text-gray-500 mb-2">Previously drawn</p>
          <ul className="flex flex-wrap gap-2">
            {previousWinners.slice(0, -1).map((w) => (
              <li key={w} className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!canUse('noad', plan) && (
        <div data-ad className="mt-8 text-center text-gray-400 text-xs border border-dashed border-gray-200 rounded-xl p-4">
          <div id="ezoic-pub-ad-placeholder-draw-tool"></div>
        </div>
      )}

      {showUpgrade && (
        <UpgradePrompt feature={upgradeFeature} onClose={() => setShowUpgrade(false)} />
      )}
    </div>
  );
}
