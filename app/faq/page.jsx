import Link from "next/link";

import FaqList from "../../components/FaqList";
import { FAQS } from "../../lib/faq";
import { JsonLd, breadcrumbSchema, faqSchema } from "../../lib/schema";

export const metadata = {
  title: "Lucky draw generator FAQ — fairness, multiple winners, privacy",
  description:
    "How the lucky draw online generator picks winners, how to verify a draw from its seed, how to draw multiple winners, and what happens to the names you paste in.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "Lucky draw generator FAQ",
    description:
      "How draws are made, how to verify one from its seed, and what happens to your list.",
    url: "/faq",
  },
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd
        schema={[
          faqSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "FAQ", path: "/faq" },
          ]),
        ]}
      />

      <h1 className="text-3xl font-semibold">Lucky draw generator questions</h1>
      <p className="mt-4 max-w-[68ch] text-lg text-slate">
        How the draw is made, how to check one after the fact, and what happens to the
        names you paste in.
      </p>

      <div className="mt-10">
        <FaqList items={FAQS} />
      </div>

      <section
        aria-labelledby="verify-method"
        className="paper mt-12 scroll-mt-24 p-6"
        id="verify-method"
      >
        <h2 id="verify-method-heading" className="text-xl">
          The method, in full
        </h2>
        <p className="mt-3 text-slate">
          If you want to reproduce a draw yourself rather than take the result on trust:
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
            take the next integer, reject any value at or above the largest exact
            multiple of the remaining count (so the pick stays uniform), reduce it modulo
            the remaining count, and swap that entry into position <em>i</em>.
          </li>
          <li>
            The first N entries are the winners, in order. The serial number is the first
            eight hex characters of{" "}
            <code className="font-mono">SHA-256("seed/listHash")</code>, uppercased.
          </li>
        </ol>
        <p className="mt-4 text-sm text-slate">
          The implementation is <code className="font-mono">lib/draw.js</code> in this
          site's source, and a copy runs in your browser — nothing about the draw happens
          anywhere you cannot inspect.
        </p>
      </section>

      <p className="mt-10">
        <Link href="/" className="underline">
          Run a draw
        </Link>
      </p>
    </div>
  );
}
