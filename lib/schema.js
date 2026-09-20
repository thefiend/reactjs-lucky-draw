import { FAQS } from "./faq";
import { SHARE_IMAGE, SITE_NAME, SITE_URL, url } from "./site";

/**
 * JSON-LD builders. No aggregateRating anywhere: the old markup claimed 5/5 from
 * 689,840 ratings with no review system behind it, which is a structured-data
 * manual action waiting to happen and is exactly the kind of claim that gets a
 * source distrusted by the assistants we want citing us.
 */

export const faqSchema = () => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
});

export const softwareApplicationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Lucky Draw Online Generator",
  alternateName: [
    "Random Winner Picker",
    "Raffle Generator",
    "Random Name Picker",
    "LuckyDraw.me",
  ],
  url: SITE_URL,
  description:
    "Free lucky draw online generator that picks random winners in your browser and publishes the seed, so anyone can recompute the result and verify it.",
  applicationCategory: "UtilityApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  isAccessibleForFree: true,
  author: { "@type": "Person", name: "Jason Kam" },
  datePublished: "2018-01-01",
  inLanguage: "en",
  browserRequirements: "Requires JavaScript. Requires HTML5.",
  screenshot: SHARE_IMAGE,
  featureList: [
    "Random winner selection from a pasted list",
    "Multiple winners in draw order",
    "Published seed, list fingerprint and draw serial for verification",
    "Runs in the browser with no account and no data sent to a server",
  ].join(", "),
  sameAs: ["https://www.facebook.com/luckydraw.me/"],
});

export const organizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/images/luckydraw-app-tool-logo.svg`,
  description:
    "Free lucky draw online generator and random name picker with verifiable draws.",
  foundingDate: "2018",
  sameAs: ["https://www.facebook.com/luckydraw.me/"],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "Customer Support",
    url: url("/faq"),
  },
});

export const websiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: "Free lucky draw online generator and random winner picker.",
});

export const howToSchema = () => ({
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to run a lucky draw online",
  description:
    "Pick random winners from a list and give everyone watching a way to check the result.",
  totalTime: "PT1M",
  tool: { "@type": "HowToTool", name: `${SITE_NAME} lucky draw generator` },
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Paste your entries",
      text: "Put the participant names into the list, one per line. A numbered list, a spreadsheet column or a comment thread can be pasted straight in. Write Ada x3 to give an entry extra chances.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Choose how many winners",
      text: "Set the number of winners. They are returned in draw order and no entry can win twice.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Draw",
      text: "Press Draw a winner. The tool takes a random seed from your browser and shuffles the list with it.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Keep the stub",
      text: "Share the winners with the seed, list fingerprint, and serial number so anybody can recompute the draw.",
    },
  ],
});

export const verifyHowToSchema = () => ({
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to verify a lucky draw",
  description:
    "Recompute a draw from its entry list and seed to confirm the announced winners are the ones that list and seed produce.",
  totalTime: "PT2M",
  url: url("/verify"),
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Collect the three public values",
      text: "You need the entry list as it was drawn, the seed shown with the result, and the winners as announced, in draw order.",
      url: url("/verify"),
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Check the list is the right one",
      text: "Join the trimmed entry lines with newlines and confirm the SHA-256 of that text matches the list hash published with the draw.",
      url: url("/verify#method"),
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Recompute the shuffle",
      text: "Expand the seed into a keystream with SHA-256 and run a partial Fisher-Yates shuffle with rejection sampling, or paste the values into the verifier to do it in the browser.",
      url: url("/verify#method"),
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Compare the winners",
      text: "The recomputed winners must match the announced ones in the same order. If they do not, the list, the seed or the announced winners is not what the draw ran on.",
      url: url("/verify"),
    },
  ],
});

export const breadcrumbSchema = (trail) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: trail.map((crumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: crumb.name,
    item: url(crumb.path),
  })),
});

/**
 * Renders one or more schema objects into a single script tag.
 * `<` is escaped so a name inside the data can never close the script element.
 */
export function JsonLd({ schema }) {
  const payload = Array.isArray(schema) ? schema : [schema];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(payload.length === 1 ? payload[0] : payload).replace(
          /</g,
          "\\u003c"
        ),
      }}
    />
  );
}
