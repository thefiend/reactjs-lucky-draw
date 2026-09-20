"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { decodeCertificate } from "../lib/certificate";
import { normaliseEntries, runDraw } from "../lib/draw";

const SEED = /^[0-9a-f]{32}$/;

// This page has ordinary anchors too (#method), and landing on one is not a
// broken certificate. A certificate payload is base64url and always far longer
// than a heading id, so only those are worth complaining about.
const LOOKS_LIKE_A_CERTIFICATE = /^[A-Za-z0-9_-]{24,}$/;

const TEXTAREA =
  "paper mt-2 w-full resize-y p-3 font-mono text-sm leading-6 placeholder:text-slate/60";

export default function Verifier() {
  const [entriesText, setEntriesText] = useState("");
  const [seed, setSeed] = useState("");
  const [winnersText, setWinnersText] = useState("");
  const [verdict, setVerdict] = useState(null);
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(false);
  const [fromLink, setFromLink] = useState(false);

  const check = useCallback(async ({ entries, seed: candidate, winners }) => {
    setVerdict(null);

    if (entries.length === 0) {
      setError("Paste the entry list the draw ran against, one name per line.");
      return;
    }
    if (winners.length === 0) {
      setError("Add the winners that were announced, one per line, in draw order.");
      return;
    }
    if (!SEED.test(candidate)) {
      setError("A seed is 32 hexadecimal characters, copied exactly as the draw showed it.");
      return;
    }
    if (winners.length > entries.length) {
      setError("There are more winners here than entries, so this cannot be a draw from this list.");
      return;
    }

    setError(null);
    setChecking(true);
    try {
      // runDraw is the same code path the draw itself ran, and verifyDraw() is
      // this comparison wrapped up. Recomputing in full rather than calling it
      // means a mismatch can show what the seed really produces, which is the
      // part that settles an argument.
      const recomputed = await runDraw({ entries, seed: candidate, count: winners.length });
      const matches = recomputed.winners.every(
        (winner, index) => winner.name === winners[index]
      );
      setVerdict({ matches, recomputed, claimed: winners });
    } catch (cause) {
      setError(cause.message);
    } finally {
      setChecking(false);
    }
  }, []);

  // A certificate link is only ever opened to be checked, so check it. The
  // payload is in the fragment, which never reaches a server and is not
  // available during prerender — hence on mount, in the browser, only.
  const loaded = useRef(false);
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    const fragment = window.location.hash.replace(/^#/, "");
    const certificate = decodeCertificate(fragment);
    if (!certificate) {
      if (LOOKS_LIKE_A_CERTIFICATE.test(fragment)) {
        setError("That link is not a draw certificate, or was cut short on the way here.");
      }
      return;
    }

    const winners = certificate.winners.map((winner) => winner.name);
    setEntriesText(certificate.entries.join("\n"));
    setSeed(certificate.seed);
    setWinnersText(winners.join("\n"));
    setFromLink(true);
    check({ entries: certificate.entries, seed: certificate.seed, winners });
  }, [check]);

  const onSubmit = (event) => {
    event.preventDefault();
    check({
      entries: normaliseEntries(entriesText),
      seed: seed.trim().toLowerCase(),
      winners: normaliseEntries(winnersText),
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <form onSubmit={onSubmit}>
        {fromLink && (
          <p className="mb-4 border-l-2 border-marigold pl-3 text-sm text-slate">
            Filled in from the link you opened. Change anything below and check again.
          </p>
        )}

        <label htmlFor="verify-entries" className="font-display text-xl">
          The entry list
        </label>
        <p className="mt-1 text-sm text-slate">
          Every name that was in the draw, one per line, in the order they were entered.
        </p>
        <textarea
          id="verify-entries"
          value={entriesText}
          onChange={(event) => setEntriesText(event.target.value)}
          rows={10}
          spellCheck="false"
          className={TEXTAREA}
        />

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="verify-seed" className="font-display text-xl">
              The seed
            </label>
            <p className="mt-1 text-sm text-slate">32 hexadecimal characters.</p>
            <input
              id="verify-seed"
              value={seed}
              onChange={(event) => setSeed(event.target.value)}
              spellCheck="false"
              autoComplete="off"
              className="paper mt-2 w-full p-3 font-mono text-sm"
            />
          </div>

          <div>
            <label htmlFor="verify-winners" className="font-display text-xl">
              The winners
            </label>
            <p className="mt-1 text-sm text-slate">As announced, in draw order.</p>
            <textarea
              id="verify-winners"
              value={winnersText}
              onChange={(event) => setWinnersText(event.target.value)}
              rows={4}
              spellCheck="false"
              className={TEXTAREA}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={checking}
          className="mt-6 w-full bg-marigold px-6 py-3 font-display text-lg font-semibold text-[#141b34] disabled:opacity-60 sm:w-auto"
        >
          {checking ? "Recomputing…" : "Recompute this draw"}
        </button>
      </form>

      <div aria-live="polite" aria-atomic="true">
        {error && (
          <p role="alert" className="paper p-4 text-sm text-stamp">
            {error}
          </p>
        )}

        {verdict && <Verdict {...verdict} />}

        {!error && !verdict && (
          <p className="paper p-4 text-sm text-slate">
            The recomputed winners appear here. Nothing you paste leaves your browser.
          </p>
        )}
      </div>
    </div>
  );
}

function Verdict({ matches, recomputed, claimed }) {
  return (
    <div className="paper p-5">
      <p
        className={`font-display text-2xl ${matches ? "text-mint" : "text-stamp"}`}
        data-verdict={matches ? "match" : "mismatch"}
      >
        {matches ? "This draw checks out" : "This draw does not check out"}
      </p>

      <p className="mt-2 text-sm text-slate">
        {matches
          ? `The seed and this list of ${recomputed.entryCount} produce exactly these winners, in this order. Anyone repeating the steps gets the same result.`
          : "The seed and this list produce a different result, shown below. The list, the seed or the announced winners is not the one the draw used."}
      </p>

      {matches && (
        // Recomputing the winners does not prove the list is the one that was
        // drawn: an entry that never won can be renamed without changing who
        // wins. The serial covers the list as well as the seed, so it is the
        // value that catches that.
        <p className="mt-3 text-sm text-slate">
          One more step worth taking: check the serial below against the one announced at
          the time. It is derived from the entry list as well as the seed, so editing even
          one name — winner or not — changes it.
        </p>
      )}

      <dl className="mt-4 grid gap-3 text-sm">
        <div>
          <dt className="text-slate">Recomputed winners</dt>
          <dd>
            <ol className="mt-1">
              {recomputed.winners.map((winner) => (
                <li key={winner.position} className="font-display text-lg">
                  {winner.position}. {winner.name}
                </li>
              ))}
            </ol>
          </dd>
        </div>

        {!matches && (
          <div>
            <dt className="text-slate">Announced as</dt>
            <dd>
              <ol className="mt-1">
                {claimed.map((name, index) => (
                  <li key={`${index}-${name}`}>
                    {index + 1}. {name}
                  </li>
                ))}
              </ol>
            </dd>
          </div>
        )}

        <div>
          <dt className="text-slate">Serial</dt>
          <dd className="font-mono">{recomputed.serial}</dd>
        </div>

        <div>
          <dt className="text-slate">List SHA-256</dt>
          <dd className="break-all font-mono text-xs">{recomputed.listHash}</dd>
        </div>
      </dl>
    </div>
  );
}
