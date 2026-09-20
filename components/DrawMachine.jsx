"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import TicketStub from "./TicketStub";
import { certificateUrl } from "../lib/certificate";
import { runDraw } from "../lib/draw";
import {
  MAX_ENTRIES,
  hasHandles,
  keepHandles,
  oddsFor,
  parseEntries,
  removeNames,
} from "../lib/entries";

const RIFFLE_MS = 90;
const RIFFLE_DURATION = 1150;

// The placeholder doubles as the only documentation anyone reads: the weight on
// the second line is how people find out the syntax exists.
const SAMPLE = ["Ada Lovelace", "Grace Hopper x2", "Katherine Johnson", "Alan Turing"];

const percent = new Intl.NumberFormat("en", {
  style: "percent",
  maximumFractionDigits: 1,
});

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
  const [copied, setCopied] = useState(null);
  const [weights, setWeights] = useState(true);
  const [dedupe, setDedupe] = useState(false);
  const stageRef = useRef(null);

  const list = useMemo(() => parseEntries(text, { weights, dedupe }), [dedupe, text, weights]);
  const entries = list.entries;
  // A name holding more than one chance is the only reason to talk about odds.
  const uneven = list.names.length > 0 && list.names.length !== entries.length;
  const odds = useMemo(() => (uneven ? oddsFor(list) : []), [list, uneven]);
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
      setCopied(null);
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
    const won = result.winners.map((winner) => winner.name);
    const kept = removeNames(text, won, { weights });
    setText(kept);
    setResult(null);
    setWinnerCount(
      String(Math.min(picks, Math.max(parseEntries(kept, { weights, dedupe }).entries.length, 1)))
    );
  }, [dedupe, picks, result, text, weights]);

  // A pasted comment thread is one handle plus a sentence of noise per line.
  const pickHandles = useCallback(() => {
    setText(keepHandles(text).join("\n"));
    setResult(null);
  }, [text]);

  const copyResult = useCallback(async () => {
    if (!result) return;
    const lines = [
      `Lucky draw ${result.serial}`,
      ...result.winners.map((winner) => `${winner.position}. ${winner.name}`),
      `Entries: ${result.entryCount}`,
      `Seed: ${result.seed}`,
      `List SHA-256: ${result.listHash}`,
      `Check this draw: ${certificateUrl(result, entries)}`,
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied("result");
  }, [entries, result]);

  // The link carries the whole draw in its fragment, so whoever opens it can
  // recheck the result without us storing anything. It does carry the entry list,
  // which is the point and also worth saying out loud.
  const copyLink = useCallback(async () => {
    if (!result) return;
    await navigator.clipboard.writeText(certificateUrl(result, entries));
    setCopied("link");
  }, [entries, result]);

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
          One per line. Paste a numbered list or a column from a spreadsheet and it
          will be tidied up. Write <code className="font-mono">Ada x3</code> for three
          chances.
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
              : uneven
                ? `${entries.length} chances from ${list.names.length} names`
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

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={weights}
              onChange={(event) => setWeights(event.target.checked)}
              className="accent-marigold"
            />
            Read <code className="font-mono">x3</code> as extra chances
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={dedupe}
              onChange={(event) => setDedupe(event.target.checked)}
              className="accent-marigold"
            />
            Count a repeated name once
          </label>
          {hasHandles(text) && (
            <button
              type="button"
              onClick={pickHandles}
              className="border border-rule px-2 py-1 hover:border-marigold"
            >
              Keep only the @handles
            </button>
          )}
        </div>

        {odds.length > 0 && (
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer text-slate">
              Every name&rsquo;s odds
            </summary>
            <dl className="mt-2 max-h-56 overflow-y-auto">
              {odds.map((entrant) => (
                <div
                  key={entrant.name}
                  className="flex items-baseline justify-between gap-4 border-b border-rule py-1"
                >
                  <dt>{entrant.name}</dt>
                  <dd className="font-mono text-xs text-slate">
                    {entrant.chances} of {entries.length} &middot;{" "}
                    {percent.format(entrant.share)}
                  </dd>
                </div>
              ))}
            </dl>
          </details>
        )}

        {list.truncated && (
          <p className="mt-3 text-sm text-stamp">
            Only the first {MAX_ENTRIES.toLocaleString("en")} chances are in this draw.
            Trim the list or lower the weights.
          </p>
        )}

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
              {copied === "result" ? "Copied" : "Copy result and proof"}
            </button>
            <button
              type="button"
              onClick={copyLink}
              className="border border-rule px-3 py-1.5 hover:border-marigold"
            >
              {copied === "link" ? "Link copied" : "Copy a link that checks itself"}
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
            <Link href="/verify" className="self-center underline">
              How to check this draw
            </Link>
          </div>
        )}
      </div>
    </form>
  );
}
