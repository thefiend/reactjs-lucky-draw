import { JsonLd, breadcrumbSchema, organizationSchema } from "../../lib/schema";

export const metadata = {
  title: "Sponsor LuckyDraw.me — permanent listing on the lucky draw tool",
  description:
    "Put your company in the sponsors section of a lucky draw generator running since 2018. One-time payment, permanent hand-placed listing, do-follow from Platinum up.",
  alternates: { canonical: "/list" },
  openGraph: {
    title: "Sponsor LuckyDraw.me",
    description:
      "A permanent, hand-placed listing on the homepage of a lucky draw generator running since 2018.",
    url: "/list",
  },
};

// Replace with the live Stripe Payment Link URLs from dashboard.stripe.com.
const TIERS = [
  {
    name: "Gold",
    price: "$99",
    url: "https://buy.stripe.com/REPLACE_WITH_GOLD_URL",
    summary: "Listed entry with a nofollow link to your site.",
    includes: ["Name and logo in the sponsors section", "nofollow link"],
  },
  {
    name: "Platinum",
    price: "$299",
    url: "https://buy.stripe.com/REPLACE_WITH_PLATINUM_URL",
    summary: "Do-follow link, logo, and a description you write.",
    includes: ["Do-follow link", "Logo", "One- to two-sentence description"],
    featured: true,
  },
  {
    name: "Featured",
    price: "$599",
    url: "https://buy.stripe.com/REPLACE_WITH_FEATURED_URL",
    summary: "Top placement in the section plus a homepage mention.",
    includes: [
      "Everything in Platinum",
      "First position in the sponsors section",
      "Named mention on the homepage",
    ],
  },
];

export default function ListPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <JsonLd
        schema={[
          organizationSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Sponsor us", path: "/list" },
          ]),
        ]}
      />

      <h1 className="max-w-[30ch] text-3xl font-semibold">
        Sponsor the lucky draw tool
      </h1>
      <p className="mt-4 max-w-[68ch] text-lg text-slate">
        Sponsor listings are what keep the draw free, unlimited, and free of a sign-up
        wall. Your listing sits in the sponsors section of the homepage — the page people
        land on before they run a draw.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={`paper flex flex-col p-5 ${
              tier.featured ? "border-marigold" : ""
            }`}
          >
            <h2 className="text-lg">{tier.name}</h2>
            <p className="mt-1">
              <span className="font-display text-2xl font-semibold">{tier.price}</span>{" "}
              <span className="text-sm text-slate">one-time</span>
            </p>
            <p className="mt-2 text-sm text-slate">{tier.summary}</p>
            <ul className="mt-3 flex-1 space-y-1 text-sm">
              {tier.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <a
              href={tier.url}
              rel="noopener noreferrer"
              className={`mt-5 block px-4 py-2 text-center text-sm font-semibold ${
                tier.featured
                  ? "bg-marigold text-[#141b34]"
                  : "border border-rule hover:border-marigold"
              }`}
            >
              Take the {tier.name} listing
            </a>
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm text-slate">
        After paying, email <strong>hello@luckydraw.me</strong> with your company name,
        destination URL, logo, and description. Listings go live within 48 hours.
      </p>

      <article className="mt-14 max-w-[68ch] space-y-8">
        <section>
          <h2 className="text-2xl">What a listing is</h2>
          <p className="mt-3 text-slate">
            A permanent, hand-placed entry in the sponsors section. It is not an ad slot:
            nothing rotates it out and it does not expire, so the link keeps its value
            long after the one-time payment. Gold carries a{" "}
            <code className="font-mono">nofollow</code> link; Platinum and Featured carry
            a do-follow link, your logo, and a short description you write yourself.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">Who it suits</h2>
          <p className="mt-3 text-slate">
            The audience is people running raffles, giveaways, and contests — event
            organisers, marketing teams, community managers, teachers, and creators. That
            makes a listing most relevant to:
          </p>
          <ul className="mt-3 list-disc space-y-1 ps-6 text-slate">
            <li>Giveaway and contest platforms</li>
            <li>Event management and ticketing tools</li>
            <li>Marketing and promotion agencies</li>
            <li>Productivity and SaaS tools</li>
            <li>Print, prize, and merchandise suppliers</li>
          </ul>
          <p className="mt-3 text-slate">
            Ask and we will send current traffic figures straight from Google Analytics
            and Search Console rather than a number on a landing page.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">How it works</h2>
          <ol className="mt-3 list-decimal space-y-1 ps-6 text-slate">
            <li>Pick the tier with the link and placement you want, and pay.</li>
            <li>Email your company name, URL, logo, and description.</li>
            <li>We review the site, place the listing, and send you the live URL.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl">What we turn down</h2>
          <p className="mt-3 text-slate">
            Every submission is reviewed, because a sponsors section full of junk links
            helps nobody — least of all the companies already in it. We decline gambling
            and real-money casino sites, adult content, pharmaceutical and supplement
            offers, link farms and private blog networks, and anything serving malware or
            deceptive downloads. Declined submissions are refunded in full.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">Questions we get</h2>
          <dl className="mt-3 space-y-4 text-slate">
            <div>
              <dt className="font-semibold text-ink">Is the payment recurring?</dt>
              <dd>No. One payment, and the listing stays up.</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">Can I change the URL later?</dt>
              <dd>Yes, email us and we will update it at no cost.</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">Can I upgrade tiers?</dt>
              <dd>Yes. Pay the difference and we move the listing.</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">Do you guarantee rankings?</dt>
              <dd>
                No, and nobody honestly can. What you get is stated plainly above: a
                do-follow link on Platinum and Featured from a live, indexed page in the
                random picker niche.
              </dd>
            </div>
          </dl>
        </section>
      </article>
    </div>
  );
}
