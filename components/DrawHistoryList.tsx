'use client';

import { useRef, useState, useEffect } from 'react';
import React from 'react';
import Link from 'next/link';
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
  const cardRefs = useRef<Record<string, React.RefObject<HTMLDivElement | null>>>({});
  const pendingDownload = useRef<string | null>(null);

  function getOrCreateRef(id: string): React.RefObject<HTMLDivElement | null> {
    if (!cardRefs.current[id]) {
      cardRefs.current[id] = React.createRef<HTMLDivElement>();
    }
    return cardRefs.current[id];
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
      const ref = getOrCreateRef(draw.id);
      downloadCertificate(ref, `luckydraw-${draw.id}.png`);
    }
  }

  useEffect(() => {
    if (!pendingDownload.current) return;
    const id = pendingDownload.current;
    pendingDownload.current = null;
    const draw = draws.find((d) => d.id === id);
    if (!draw) return;
    const ref = getOrCreateRef(id);
    downloadCertificate(ref, `luckydraw-${id}.png`).then(() => {
      setDownloadingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    });
  }, [downloadingIds, draws]);

  if (draws.length === 0) {
    return (
      <p className="text-gray-500">
        No draws yet.{' '}
        <Link href="/" className="text-indigo-600">
          Run your first draw →
        </Link>
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
                cardRef={getOrCreateRef(draw.id)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
