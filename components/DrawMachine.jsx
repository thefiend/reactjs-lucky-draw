"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import TicketStub from "./TicketStub";
import { normaliseEntries, runDraw } from "../lib/draw";
import { SITE_URL } from "../lib/site";

const RIFFLE_MS = 90;
const RIFFLE_DURATION = 1150;

const SAMPLE = ["Ada Lovelace", "Grace Hopper", "Katherine Johnson", "Alan Turing"];

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function DrawMachine() {
  const [text, setText] = useState("");
  // Held as the raw string so the field can be emptied and retyped. Coercing on
  // every keystroke snaps an empty field back to "1", and the next digit typed
  // lands beside it as "13".
  const [winnerCount, setWinnerCount] = useState("1");
  const [result, setResult] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [error, setError] = useState(null);
  const [riffleIndex, setRiffleIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [copied, setCopied] = useState(false);
  const stageRef = useRef(null);

  const entries = useMemo(() => normaliseEntries(text), [text]);
  const picks = Math.min(
    Math.max(1, Number.parseInt(winnerCount, 10) || 1),
    Math.max(entries.length, 1)
  );

  // Riffle the real list past the stage while the draw resolves. This is
  // decoration over a result that is already decided by the seed — it never
  // touches which name comes out.
  useEffect(() => {
    if (!isDrawing || entries.length === 0) return undefined;
    const timer = window.setInterval(() => {
      setRiffleIndex((index) => (index + 1) % entries.length);
    }, RIFFLE_MS);
    return () => window.clearInterval(timer);
  }, [isDrawing, entries.length]);

  const handleDraw = useCallback(
    async (event) => {
      event.preventDefault();
      if (entries.length === 0) {
        setError("Add at least one name to draw from.");
        return;
      }

      const withMotion = !prefersReducedMotion();
      setAnimate(withMotion);
      setError(null);
      setCopied(false);
      setResult(null);
      setIsDrawing(true);

      const drawing = runDraw({ entries, count: picks });
      if (withMotion) {
        await new Promise((resolve) => window.setTimeout(resolve, RIFFLE_DURATION));
      }

      try {
        setResult(await drawing);
      } catch (cause) {
        setError(cause.message);
      } finally {
        setIsDrawing(false);
      }
    },
    [entries, picks]
  );

  const removeWinners = useCallback(() => {
    if (!result) return;
    const won = new Set(result.winners.map((winner) => winner.name));
    const kept = entries.filter((entry) => !won.has(entry));
    setText(kept.join("\n"));
    setResult(null);
    setWinnerCount(String(Math.min(picks, Math.max(kept.length, 1))));
  }, [entries, picks, result]);

  const copyResult = useCallback(async () => {
    if (!result) return;
    const lines = [
      `Lucky draw ${result.serial}`,
      ...result.winners.map((winner) => `${winner.position}. ${winner.name}`),
      `Entries: ${result.entryCount}`,
      `Seed: ${result.seed}`,
      `List SHA-256: ${result.listHash}`,
      `Anyone can recompute this draw: ${SITE_URL}/faq#is-it-fair`,
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
  }, [result]);

  return (
    <form onSubmit={handleDraw} className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      {/* The stage sits second in the source so keyboard and screen-reader order
          follows the task, but first on a phone once there is a result to show
          the room. */}
      <div className={result ? "order-2 lg:order-1" : ""}>
        <label htmlFor="entries" className="font-display text-xl">
          Your entries
        </label>
        <p className="mt-1 text-sm text-slate">
          One per line. Repeat a name to give it extra chances.
        </p>
        <textarea
          id="entries"
          name="entries"
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={12}
          spellCheck="false"
          placeholder={SAMPLE.join("\n")}
          aria-describedby="entry-count"
          className="paper mt-3 w-full resize-y p-4 font-sans text-base leading-7 placeholder:text-slate/60"
        />

        <div className="mt-3 flex flex-wrap items-end gap-x-6 gap-y-3">
          <p id="entry-count" className="text-sm text-slate" aria-live="polite">
            {entries.length === 0
              ? "No entries yet"
              : `${entries.length} ${entries.length === 1 ? "entry" : "entries"}`}
          </p>

          <div className="flex items-center gap-2">
            <label htmlFor="winners" className="text-sm">
              Winners to draw
            </label>
            <input
              id="winners"
              name="winners"
              type="number"
              min={1}
              max={Math.max(entries.length, 1)}
              value={winnerCount}
              onChange={(event) => setWinnerCount(event.target.value)}
              onBlur={() => setWinnerCount(String(picks))}
              className="paper w-16 px-2 py-1 font-mono text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isDrawing}
          className="mt-5 w-full bg-marigold px-6 py-3 font-display text-lg font-semibold text-[#141b34] disabled:opacity-60 sm:w-auto"
        >
          {isDrawing
            ? "Drawing…"
            : picks > 1
              ? `Draw ${picks} winners`
              : "Draw a winner"}
        </button>

        {error && (
          <p role="alert" className="mt-3 text-sm text-stamp">
            {error}
          </p>
        )}
      </div>

      <div className={result ? "order-1 lg:order-2" : ""}>
        <div
          ref={stageRef}
          aria-live="polite"
          aria-atomic="true"
          className="min-h-56"
        >
          {result ? (
            <TicketStub result={result} animate={animate} />
          ) : (
            <div className="paper flex min-h-56 items-center justify-center p-6 text-center">
              {isDrawing ? (
                <span
                  key={riffleIndex}
                  className="animate-riffle font-display text-xl"
                >
                  {entries[riffleIndex]}
                </span>
              ) : (
                <p className="max-w-[24ch] text-sm text-slate">
                  The winner appears here on a stub, with the seed it was drawn from.
                </p>
              )}
            </div>
          )}
        </div>

        {result && (
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <button
              type="button"
              onClick={copyResult}
              className="border border-rule px-3 py-1.5 hover:border-marigold"
            >
              {copied ? "Copied" : "Copy result and proof"}
            </button>
            {entries.length > result.winners.length && (
              <button
                type="button"
                onClick={removeWinners}
                className="border border-rule px-3 py-1.5 hover:border-marigold"
              >
                Remove winners from the list
              </button>
            )}
            <Link href="/faq#is-it-fair" className="self-center underline">
              How to check this draw
            </Link>
          </div>
        )}
      </div>
    </form>
  );
}
