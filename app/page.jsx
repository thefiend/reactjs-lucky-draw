import Link from "next/link";

import DrawMachine from "../components/DrawMachine";
import FaqList from "../components/FaqList";
import Sponsors from "../components/Sponsors";
import { FAQS } from "../lib/faq";
import {
  JsonLd,
  breadcrumbSchema,
  faqSchema,
  howToSchema,
  softwareApplicationSchema,
} from "../lib/schema";

export const metadata = {
  title: "Lucky Draw Online Generator | Free Random Winner Picker",
  description:
    "Free lucky draw online generator. Paste your names, pick random winners, and keep the seed so anyone can check the draw was fair. No sign-up, no limits.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Lucky Draw Online Generator — free random winner picker",
    description:
      "Paste your names, draw random winners, and share the seed so anybody can recompute the result.",
    url: "/",
  },
};

const USE_CASES = [
  {
    title: "Instagram and Facebook giveaways",
    body: "Paste the commenters, draw, and post the serial number with the winner. Anybody who doubts it can rerun the draw from the seed and get the same name.",
  },
  {
    title: "Company events and annual dinners",
    body: "Project the stage on the big screen. The winner name is set in large display type and stays readable from the back of the room.",
  },
  {
    title: "Classrooms",
    body: "Keep the class list in the pad and draw whoever answers next. Remove drawn names so the same pupil is not picked twice in a lesson.",
  },
  {
    title: "Raffles and prize draws",
    body: "Draw several winners at once, in order, so first prize, second, and third come out of one shuffle.",
  },
  {
    title: "Streams and live shows",
    body: "Run the draw on air. Viewers can check it afterwards without taking your word for it, which a spinning wheel never gave them.",
  },
  {
    title: "Team and pair assignment",
    body: "Draw the whole list to shuffle it, then read the order off the stub to split people into teams.",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <JsonLd
        schema={[
          softwareApplicationSchema(),
          howToSchema(),
          faqSchema(),
          breadcrumbSchema([{ name: "Home", path: "/" }]),
        ]}
      />

      <div className="max-w-[34ch]">
        <h1 className="text-4xl font-semibold">
          Free lucky draw generator that proves the winner was random
        </h1>
        <p className="mt-4 text-lg text-slate">
          Paste your names, draw, and keep the stub. Every draw publishes the seed it
          used, so anyone can recompute the result.
        </p>
      </div>

      <section id="draw" className="mt-10 scroll-mt-20">
        <h2 className="sr-only">Run a draw</h2>
        <DrawMachine />
      </section>

      <section aria-labelledby="proof" className="mt-16 border-t border-rule pt-8">
        <h2 id="proof" className="text-2xl">
          Why the result is checkable
        </h2>
        <p className="mt-3 max-w-[68ch] text-slate">
          Other pickers ask you to trust an animation. A wheel can be spun until the
          right name comes up, and a recording can be made again. This draw hands the
          audience the working, in three steps anyone can repeat.
        </p>
        <ol className="mt-6 grid gap-6 sm:grid-cols-3">
          <li>
            <p className="font-mono text-sm text-slate">Step 1</p>
            <h3 className="mt-1 text-lg">The seed is published</h3>
            <p className="mt-1 text-sm text-slate">
              Before the shuffle, the tool takes 16 random bytes from your browser's
              cryptographic random number generator and shows them on the stub. That
              seed is the only randomness in the draw.
            </p>
          </li>
          <li>
            <p className="font-mono text-sm text-slate">Step 2</p>
            <h3 className="mt-1 text-lg">The list is fingerprinted</h3>
            <p className="mt-1 text-sm text-slate">
              A SHA-256 hash of your entries goes on the stub too, so nobody can claim
              afterwards that a different list was in the machine.
            </p>
          </li>
          <li>
            <p className="font-mono text-sm text-slate">Step 3</p>
            <h3 className="mt-1 text-lg">Anyone recomputes it</h3>
            <p className="mt-1 text-sm text-slate">
              The shuffle is a plain Fisher-Yates draw driven by SHA-256 of the seed.
              Same list and same seed, same winners, every time —{" "}
              <Link href="/verify" className="underline">
                check a draw yourself
              </Link>
              .
            </p>
          </li>
        </ol>
      </section>

      <section aria-labelledby="use-cases" className="mt-16 border-t border-rule pt-8">
        <h2 id="use-cases" className="text-2xl">
          What people use it for
        </h2>
        <div className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2">
          {USE_CASES.map((useCase) => (
            <div key={useCase.title}>
              <h3 className="text-lg">{useCase.title}</h3>
              <p className="mt-1 text-sm text-slate">{useCase.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="about" className="mt-16 border-t border-rule pt-8">
        <h2 id="about" className="text-2xl">
          About this lucky draw online generator
        </h2>
        <div className="mt-4 max-w-[68ch] space-y-4 text-slate">
          <p>
            LuckyDraw.me is a free random name picker and raffle generator that has been
            running since 2018. It does one job: take a list of entries and pick winners
            from it without favouring anybody. There is no account, no paywall, no cap on
            how many draws you run, and no limit on how long your list is.
          </p>
          <p>
            The draw happens in your browser. Your list is never uploaded, never logged,
            and is gone when you close the tab — so it is safe to paste customer emails,
            employee names, or entrant handles into it.
          </p>
          <p>
            Where it differs from a random picker wheel is the record it leaves behind.
            Each draw gets a serial number, the seed it used, and a fingerprint of the
            list, so the fairness of the result is something the room can verify rather
            than something the tool asserts.
          </p>
        </div>
      </section>

      <Sponsors />

      <section aria-labelledby="faq" className="mt-16 border-t border-rule pt-8">
        <h2 id="faq" className="text-2xl">
          Common questions
        </h2>
        <div className="mt-6">
          <FaqList items={FAQS.slice(0, 5)} />
        </div>
        <p className="mt-6">
          <Link href="/faq" className="underline">
            Read all {FAQS.length} questions
          </Link>
        </p>
      </section>
    </div>
  );
}
