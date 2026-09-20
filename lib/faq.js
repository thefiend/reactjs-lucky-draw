/**
 * One source for the FAQ: the /faq page renders these and the FAQPage JSON-LD is
 * generated from the same array. Google requires the marked-up answer to be
 * visible on the page, and two copies of this content drift apart within a
 * release or two.
 *
 * `answer` is plain text so it can go into JSON-LD unaltered.
 */
export const FAQS = [
  {
    id: "what-is-a-lucky-draw-generator",
    question: "What is a lucky draw online generator?",
    answer:
      "A lucky draw online generator is a free web tool that picks winners at random from a list of entries. You paste the names, it selects the winners, and every entry has the same chance of being picked. LuckyDraw.me runs the draw in your browser and publishes the seed it used, so anyone can recompute the result and check it was not steered.",
  },
  {
    id: "how-does-it-work",
    question: "How does the lucky draw tool work?",
    answer:
      "Paste your entries one per line, choose how many winners you need, and press Draw a winner. The tool takes a random seed from your browser's cryptographic random number generator, uses it to shuffle the list, and shows the winners with the seed, a fingerprint of the list, and a draw serial number.",
  },
  {
    id: "is-it-fair",
    question: "How do I know the draw was fair?",
    answer:
      "Every draw publishes three values: the seed, a SHA-256 fingerprint of your list, and a serial number derived from both. The seed is the only source of randomness, and the shuffle is a standard Fisher-Yates shuffle driven by SHA-256 output with rejection sampling, so no position in the list is favoured. Given the same list and seed, anybody gets the same winners — which is what makes the result checkable rather than just claimed.",
  },
  {
    id: "multiple-winners",
    question: "Can I pick more than one winner?",
    answer:
      "Yes. Set the number of winners before you draw and the tool returns them in draw order, first place first. No entry can win twice in the same draw. You can also remove the winners from the list afterwards to run a further round.",
  },
  {
    id: "is-it-free",
    question: "Is the lucky draw generator free?",
    answer:
      "Yes. It is free with no account, no sign-up, and no limit on the number of draws or the size of your list. The site is paid for by sponsor listings.",
  },
  {
    id: "data-privacy",
    question: "Do you store the names I enter?",
    answer:
      "No. The draw runs entirely in your browser and your list is never sent to a server. Nothing is stored, and the list is gone when you close or reload the page.",
  },
  {
    id: "instagram-giveaways",
    question: "Can I use it for an Instagram or Facebook giveaway?",
    answer:
      "Yes. Copy the commenters or entrants into the tool, one per line, and draw. Screen-record the draw or share the seed and serial number with your followers, and anybody can reproduce the result themselves — stronger proof than a video, which can be re-recorded until a preferred name comes up.",
  },
  {
    id: "corporate-events",
    question: "Does it work for a company event or classroom?",
    answer:
      "Yes. It is used at annual dinners, team-building sessions, conference stages, and in classrooms. It works with a handful of names or several thousand, and the stage area stays readable when projected.",
  },
  {
    id: "duplicate-names",
    question: "What happens if two entries have the same name?",
    answer:
      "Both are kept and both get their own chance. Two people can genuinely share a name, so entries are matched line by line rather than deduplicated. Blank lines and surrounding spaces are ignored.",
  },
  {
    id: "weighted-entries",
    question: "Can one entry get more chances than another?",
    answer:
      "Add that entry on more than one line — five lines for five chances. Each line is one slot in the draw, so repeating a name is how you weight it.",
  },
  {
    id: "good-prizes",
    question: "What makes a good lucky draw prize?",
    answer:
      "Prizes that a large part of your audience actually wants: gift cards and vouchers, electronics such as earbuds or tablets, travel credit, hampers, or cash. Broad appeal matters more than headline value, because it is what drives entries.",
  },
  {
    id: "no-javascript",
    question: "Does it need an app or an internet connection?",
    answer:
      "No app and no download. It runs in any modern browser on phone, tablet, or desktop. Once the page has loaded, the draw itself needs no connection, because the randomness comes from your own device.",
  },
];
