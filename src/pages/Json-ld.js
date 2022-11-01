export let FAQ = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What tools can I use to do a lucky draw?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "<strong><a href=http://luckydraw.me/>Lucky Draw Simulator</a></strong> is a great tool which many companies and individuals trust and use to ensure a fair and transparent drawing process. It is free and easy to use which requires only a few configurations to get sstarted right away.",
      },
    },
    {
      "@type": "Question",
      name: "How does a lucky draw work?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "A lucky draw is a gambling competition in which people randomly obtain numbered tickets and each tickets have a chance of winning a prize. A numbered ticket is selected at random and the selected winner walks away with a prize.",
      },
    },
    {
      "@type": "Question",
      name: "How do you hold a lucky draw?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Any company or individuals can easily host a lucky draw online simply by setting a certain requirements and prepare rewards for the winners. Tools such as <strong><a href=http://luckydraw.me/>Lucky Draw Simulator</a></strong> is then used to select the winners, ensuring a fair and transparent drawing process.",
      },
    },
    {
      "@type": "Question",
      name: "What is a good lucky draw prize?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Prizes such as Electronic Devices, Gift Baskets, Seasonal Products, Television, Gift Vouchers and Travel Voucher are popular lucky draw prize ideas.",
      },
    },
  ],
});

export let REVIEW = JSON.stringify({
  "@context": "https://schema.org/",
  "@type": "CreativeWorkSeries",
  name: "Lucky Draw Random Generator Tool",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5",
    bestRating: "5",
    ratingCount: "689840",
  },
});
