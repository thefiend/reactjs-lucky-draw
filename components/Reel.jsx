"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A slot reel that comes to rest on a name chosen before it started moving.
 *
 * Same bargain as the wheel: the seed has already fixed the winner, so the strip
 * is built with that name at the bottom and slid up to it. Nothing about the
 * deceleration changes who won.
 *
 * The names on the way past are the real entries, not filler, so a room watching
 * can see their own list going by.
 */

const SPIN_MS = 2200;
const ROW_HEIGHT = 56;
const MIN_ROWS = 18;

/** The strip: the real list cycled enough times to read as motion, winner last. */
export function reelRows(entries, winner) {
  const rows = [];
  if (entries.length > 0) {
    while (rows.length < MIN_ROWS) {
      rows.push(...entries);
    }
  }
  rows.push(winner);
  return rows;
}

export default function Reel({ entries, winner, animate = true, onDone }) {
  const rows = reelRows(entries, winner);
  const [running, setRunning] = useState(false);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    if (!animate) {
      done.current?.();
      return undefined;
    }

    const start = window.requestAnimationFrame(() => setRunning(true));
    // A timer rather than transitionend, which a backgrounded tab never sends.
    const timer = window.setTimeout(() => done.current?.(), SPIN_MS);

    return () => {
      window.cancelAnimationFrame(start);
      window.clearTimeout(timer);
    };
  }, [animate]);

  return (
    <div
      className="paper relative overflow-hidden"
      style={{ height: ROW_HEIGHT }}
      aria-hidden="true"
      data-testid="reel"
    >
      <div
        style={{
          transform: `translateY(${running ? -(rows.length - 1) * ROW_HEIGHT : 0}px)`,
          transition: animate ? `transform ${SPIN_MS}ms cubic-bezier(0.1, 0.8, 0.2, 1)` : "none",
        }}
      >
        {rows.map((name, index) => (
          <div
            key={`${name}-${index}`}
            className="flex items-center justify-center truncate px-3 font-display text-xl"
            style={{ height: ROW_HEIGHT }}
          >
            {name}
          </div>
        ))}
      </div>

      {/* Hairlines above and below the window, the way a reel is masked. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 border-t border-rule" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 border-b border-rule" />
    </div>
  );
}
