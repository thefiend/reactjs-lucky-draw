import React, { Component } from "react";
import { Helmet } from "react-helmet";
import { ORGANIZATION } from "../Json-ld";
import SiteWrapper from "../../SiteWrapper";

// Replace these with your actual Stripe Payment Link URLs from dashboard.stripe.com
const STRIPE_GOLD_URL = "https://buy.stripe.com/REPLACE_WITH_GOLD_URL";
const STRIPE_PLATINUM_URL = "https://buy.stripe.com/REPLACE_WITH_PLATINUM_URL";
const STRIPE_FEATURED_URL = "https://buy.stripe.com/REPLACE_WITH_FEATURED_URL";

const tiers = [
  {
    name: "Gold",
    price: "$99",
    description: "Listed entry with nofollow link to your site.",
    url: STRIPE_GOLD_URL,
    style: { background: "#fff", border: "2px solid #d4af37", color: "#d4af37" },
  },
  {
    name: "Platinum",
    price: "$299",
    description: "Do-follow link + logo + company description. Most popular.",
    url: STRIPE_PLATINUM_URL,
    style: { background: "#6366f1", border: "2px solid #6366f1", color: "#fff" },
    badge: "Most Popular",
  },
  {
    name: "Featured",
    price: "$599",
    description: "Above-the-fold placement + press mention on homepage.",
    url: STRIPE_FEATURED_URL,
    style: { background: "#0f172a", border: "2px solid #0f172a", color: "#fff" },
  },
];

class List extends Component {
  render() {
    return (
      <SiteWrapper>
        <Helmet>
          <meta charSet="utf-8" />
          <title>List Your Business | Get High-Quality Backlinks | LuckyDraw.me</title>
          <meta name="description" content="Get your company listed on LuckyDraw.me for premium SEO backlinks. Join 689,840+ monthly visitors and boost your search rankings with high-quality do-follow links." />
          <link rel="canonical" href="https://luckydraw.me/list" />
          <meta property="og:title" content="List Your Business on LuckyDraw.me" />
          <meta property="og:description" content="Premium SEO backlinks from a high-traffic lucky draw website." />
          <meta property="og:url" content="https://luckydraw.me/list" />
          <script type="application/ld+json">{ORGANIZATION}</script>
        </Helmet>

        <div style={{ marginBottom: "30px" }}>
          <h1 style={{ fontSize: "2.5rem", color: "#198BCA", marginBottom: "15px" }}>
            Get Your Company Listed on LuckyDraw.me
          </h1>
          <h2 style={{ fontSize: "1.5rem", color: "#333", marginBottom: "20px", fontWeight: "normal" }}>
            Boost Your SEO with High-Quality Backlinks
          </h2>
        </div>

        <p style={{ fontSize: "1.1rem", lineHeight: "1.8", marginBottom: "30px" }}>
          LuckyDraw.me is one of the world's most visited <strong>lucky draw websites</strong> with over{" "}
          <strong>689,840 satisfied users</strong>. We help companies improve their{" "}
          <strong>Search Engine Optimization (SEO)</strong> through high-quality backlinks. Platinum and Featured listings include do-follow links.
          <br /><br />
          <strong>List your website today</strong> to benefit from our massive organic traffic and authority
          in the random picker and lucky draw niche.
        </p>

        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "40px" }}>
          {tiers.map((tier) => (
            <div
              key={tier.name}
              style={{
                flex: "1 1 220px",
                border: "2px solid #e2e8f0",
                borderRadius: "12px",
                padding: "24px",
                position: "relative",
                background: "#fff",
              }}
            >
              {tier.badge && (
                <div style={{
                  position: "absolute",
                  top: "-12px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "#6366f1",
                  color: "#fff",
                  fontSize: "0.75rem",
                  padding: "2px 12px",
                  borderRadius: "12px",
                  whiteSpace: "nowrap",
                }}>
                  {tier.badge}
                </div>
              )}
              <div style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "6px" }}>{tier.name}</div>
              <div style={{ fontSize: "2rem", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>
                {tier.price}
                <span style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: "400" }}> one-time</span>
              </div>
              <p style={{ color: "#475569", fontSize: "0.9rem", marginBottom: "20px", lineHeight: "1.5" }}>
                {tier.description}
              </p>
              <a
                href={tier.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontWeight: "600",
                  textDecoration: "none",
                  ...tier.style,
                }}
              >
                Get {tier.name} Listing
              </a>
            </div>
          ))}
        </div>

        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
          After payment, email <strong>hello@luckydraw.me</strong> with your company details
          (name, URL, logo, description) and we'll add your listing within 48 hours.
        </p>
      </SiteWrapper>
    );
  }
}

export default List;
