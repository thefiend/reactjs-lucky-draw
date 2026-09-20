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

      {/* The step-by-step method lives on /verify, next to the tool that carries
          it out. Repeating it here would put the same content on two indexable
          URLs and split the links pointing at it. */}
      <section aria-labelledby="check-a-draw" className="paper mt-12 p-6">
        <h2 id="check-a-draw" className="text-xl">
          Rather check a draw than read about one?
        </h2>
        <p className="mt-3 max-w-[60ch] text-slate">
          Paste the entry list, the seed and the announced winners into the verifier, and
          it recomputes the draw in your browser. The full method is written out below
          it, step by step, if you would rather reproduce it in your own code.
        </p>
        <p className="mt-4">
          <Link href="/verify" className="underline">
            Verify a draw
          </Link>
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
