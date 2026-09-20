const shorten = (value) => `${value.slice(0, 8)}…${value.slice(-4)}`;

/**
 * The torn-off stub: the winners, the stamp, and the three values that make the
 * draw checkable. The proof is part of the result, not a footnote about it.
 */
export default function TicketStub({ result, animate }) {
  const { winners, serial, seed, listHash, entryCount } = result;
  const multiple = winners.length > 1;

  return (
    <div className={`paper px-5 pb-5 pt-4 ${animate ? "animate-tear-off" : ""}`}>
      <div className="flex items-baseline justify-between gap-3 font-mono text-xs text-slate">
        <span>Draw {serial}</span>
        <span>
          {winners.length} of {entryCount}
        </span>
      </div>

      <div className="perforation mt-3 pt-5">
        <div className="relative text-center">
          <p className="text-sm text-slate">{multiple ? "Winners" : "Winner"}</p>

          <ol className="mt-2 space-y-2">
            {winners.map((winner) => (
              <li key={`${winner.position}-${winner.name}`} className="font-display">
                <span
                  className={`block break-words font-semibold ${
                    multiple ? "text-xl" : "text-4xl"
                  }`}
                >
                  {multiple && (
                    <span className="me-2 font-mono text-sm text-slate">
                      {winner.position}
                    </span>
                  )}
                  {winner.name}
                </span>
              </li>
            ))}
          </ol>

          <span
            aria-hidden="true"
            className={`pointer-events-none absolute -end-1 -top-2 rotate-[-8deg] rounded-full border-2 border-stamp px-3 py-1 font-mono text-[0.65rem] uppercase tracking-wide text-stamp ${
              animate ? "animate-stamp-down" : ""
            }`}
          >
            Drawn
          </span>
        </div>
      </div>

      <dl className="mt-6 space-y-1 border-t border-rule pt-3 font-mono text-xs text-slate">
        <div className="flex gap-2">
          <dt className="w-20 shrink-0">Seed</dt>
          <dd className="break-all" title={seed}>
            {shorten(seed)}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-20 shrink-0">List hash</dt>
          <dd className="break-all" title={listHash}>
            {shorten(listHash)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
