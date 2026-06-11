'use client';

import { useRef } from 'react';
import { useDrawEngine, FREE_ENTRY_LIMIT } from '@/lib/useDrawEngine';
import { canUse } from '@/lib/plan';
import UpgradePrompt from '@/components/UpgradePrompt';
import type { Plan } from '@/lib/plan';

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
