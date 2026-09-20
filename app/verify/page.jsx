import Link from "next/link";

import Verifier from "../../components/Verifier";
import { JsonLd, breadcrumbSchema, verifyHowToSchema } from "../../lib/schema";

export const metadata = {
  title: "Verify a lucky draw — recompute the winner from the seed",
  description:
    "Check that a lucky draw was random. Paste the entry list, the seed and the announced winners, and recompute the draw in your browser to see whether it holds up.",
  alternates: { canonical: "/verify" },
  openGraph: {
    title: "Verify a lucky draw",
    description:
      "Recompute a draw from its entry list and seed, in your browser, and see whether the announced winners hold up.",
    url: "/verify",
  },
};

export default function VerifyPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <JsonLd
        schema={[
          verifyHowToSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Verify a draw", path: "/verify" },
          ]),
        ]}
      />

      <h1 className="text-3xl font-semibold">Check whether a lucky draw was random</h1>
      <p className="mt-4 max-w-[68ch] text-lg text-slate">
        A screen recording of a draw proves nothing: it can be made over and over until a
        preferred name comes up. A seed published with the result proves something,
        because it commits to one outcome in advance and anyone can recompute it. Paste
        the three public values below and see for yourself.
      </p>

      <div className="mt-10">
        <Verifier />
      </div>

      <section aria-labelledby="what-it-means" className="mt-16 max-w-[68ch]">
        <h2 id="what-it-means" className="text-2xl">
          What the answer tells you
        </h2>
        <dl className="mt-6 space-y-6">
          <div>
            <dt className="font-display text-lg">It checks out</dt>
            <dd className="mt-1 text-slate">
              The winners are what that seed and that list produce, and only what they
              produce. Nobody chose the names after seeing them. Whoever ran the draw
              could not have picked the seed to land on a particular winner either —
              finding such a seed means recomputing the shuffle over and over, and the
              seed is drawn before anyone sees where it lands. Compare the serial as well:
              recomputing the winners alone would not catch a non-winning entry that was
              renamed afterwards, but the serial covers the whole list and would.
            </dd>
          </div>
          <div>
            <dt className="font-display text-lg">It does not check out</dt>
            <dd className="mt-1 text-slate">
              Something in the record is not what the draw actually ran on. Usually it is
              innocent: a name edited after the fact, a line lost in a copy and paste, or
              winners listed out of draw order. The recomputed result is shown next to the
              announced one so you can see which.
            </dd>
          </div>
          <div>
            <dt className="font-display text-lg">What it cannot tell you</dt>
            <dd className="mt-1 text-slate">
              Whether the entry list itself was honest. If a name was left out before the
              draw, no amount of recomputation reveals it — that is why the list hash is
              worth publishing when entries close, not after the winner is known.
            </dd>
          </div>
        </dl>
      </section>

      <section
        aria-labelledby="method"
        className="paper mt-16 max-w-[75ch] scroll-mt-24 p-6"
        id="method"
      >
        <h2 id="method-heading" className="text-2xl">
          The method, in full
        </h2>
        <p className="mt-3 text-slate">
          To reproduce a draw in your own code rather than trust ours:
        </p>
        <ol className="mt-4 list-decimal space-y-2 ps-6 text-slate">
          <li>
            Take the entry list exactly as it was drawn: each line trimmed, blank lines
            dropped, order preserved.
          </li>
          <li>
            Confirm the list is the right one by joining those lines with a newline and
            checking that its SHA-256 matches the list hash on the stub.
          </li>
          <li>
            Generate the keystream as <code className="font-mono">SHA-256("seed:0")</code>
            , <code className="font-mono">SHA-256("seed:1")</code>, and so on, reading it
            as big-endian 32-bit integers.
          </li>
          <li>
            Run a partial Fisher-Yates shuffle: for position <em>i</em> starting at 0,
            take the next integer, reject any value at or above the largest exact multiple
            of the remaining count (so the pick stays uniform), reduce it modulo the
            remaining count, and swap that entry into position <em>i</em>.
          </li>
          <li>
            The first N entries are the winners, in order. The serial number is the first
            eight hex characters of{" "}
            <code className="font-mono">SHA-256("seed/listHash")</code>, uppercased.
          </li>
        </ol>
        <p className="mt-4 text-sm text-slate">
          The implementation is <code className="font-mono">lib/draw.js</code> in this
          site's source, and a copy of it runs in your browser — nothing about the draw
          happens anywhere you cannot inspect.
        </p>
      </section>

      <p className="mt-10 flex flex-wrap gap-6">
        <Link href="/" className="underline">
          Run a draw
        </Link>
        <Link href="/faq" className="underline">
          Other questions
        </Link>
      </p>
    </div>
  );
}
