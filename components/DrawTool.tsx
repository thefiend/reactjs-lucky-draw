'use client';

import { useState } from 'react';
import { canUse } from '@/lib/plan';
import UpgradePrompt from '@/components/UpgradePrompt';
import type { Feature } from '@/lib/plan';

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
    setWinner(drawn);
    const newWinners = [...previousWinners, drawn];
    setPreviousWinners(newWinners);
    onDrawComplete?.(entries, newWinners);
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
        className="w-full h-40 border border-gray-300 rounded-xl p-4 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
          aria-label="Draw Winner"
          className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
        >
          Draw Winner
        </button>
        <button
          onClick={handleExport}
          className="px-4 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 text-sm"
        >
          Export
        </button>
      </div>

      {winner && (
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
