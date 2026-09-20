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
          <title>List Your Business | Get High-Quality Backlinks | LuckyDraw.me</title>
          <meta name="description" content="Get listed on LuckyDraw.me for premium SEO backlinks. Reach 689,840+ monthly visitors and boost your search rankings with high-quality do-follow links." />
          <link rel="canonical" href="https://www.luckydraw.me/list" />
          <meta property="og:title" content="List Your Business on LuckyDraw.me" />
          <meta property="og:description" content="Premium SEO backlinks from a high-traffic lucky draw website." />
          <meta property="og:url" content="https://www.luckydraw.me/list" />
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

        <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "40px" }}>
          After payment, email <strong>hello@luckydraw.me</strong> with your company details
          (name, URL, logo, description) and we'll add your listing within 48 hours.
        </p>

        <article style={{ lineHeight: "1.8" }}>
          <h2 style={{ color: "#198BCA", marginBottom: "15px" }}>What a LuckyDraw.me Listing Includes</h2>
          <p style={{ marginBottom: "20px" }}>
            Every paid listing is a permanent, hand-placed entry in the sponsors section that appears on
            the homepage of our <strong>lucky draw online generator</strong> — the page visitors land on
            before they run a draw. Listings are not rotated out of an ad slot and do not expire, so the
            link keeps accruing value long after the one-time payment. <strong>Gold</strong> listings
            carry a <code>nofollow</code> link, while <strong>Platinum</strong> and{" "}
            <strong>Featured</strong> listings include a do-follow link, your logo, and a short company
            description you write yourself.
          </p>

          <h3 style={{ color: "#198BCA", marginTop: "25px", marginBottom: "15px" }}>Who Lists With Us</h3>
          <p style={{ marginBottom: "15px" }}>
            Our audience is made up of event organisers, marketing teams, community managers, teachers,
            and social media creators — people actively running raffles, giveaways, and contests. That
            makes a listing especially relevant for:
          </p>
          <ul style={{ lineHeight: "2", paddingLeft: "40px", marginBottom: "20px" }}>
            <li><strong>Giveaway and contest platforms</strong> — reach organisers at the moment they pick winners</li>
            <li><strong>Event management and ticketing tools</strong> — audience overlap is close to total</li>
            <li><strong>Marketing agencies</strong> — buyers looking for campaign and promotion services</li>
            <li><strong>SaaS and productivity tools</strong> — teams already comfortable adopting web tools</li>
            <li><strong>Print, prize, and merchandise suppliers</strong> — the people fulfilling the prizes</li>
          </ul>

          <h3 style={{ color: "#198BCA", marginTop: "25px", marginBottom: "15px" }}>How the Process Works</h3>
          <ol style={{ lineHeight: "2", paddingLeft: "40px", marginBottom: "20px" }}>
            <li>Pick the tier that matches the link and placement you want and complete checkout.</li>
            <li>Email us your company name, destination URL, logo, and a one- to two-sentence description.</li>
            <li>We review the site, place the listing, and confirm the live URL — usually within 48 hours.</li>
          </ol>

          <h3 style={{ color: "#198BCA", marginTop: "25px", marginBottom: "15px" }}>Editorial Guidelines</h3>
          <p style={{ marginBottom: "15px" }}>
            We review every submission before it goes live, because a sponsors section full of low-quality
            links helps nobody — least of all the companies already listed. We decline gambling and real-money
            casino sites, adult content, pharmaceutical and supplement offers, link farms and private blog
            networks, and any site serving malware or deceptive downloads. If we decline your submission we
            refund the payment in full.
          </p>

          <h3 style={{ color: "#198BCA", marginTop: "25px", marginBottom: "15px" }}>Common Questions</h3>
          <p style={{ marginBottom: "15px" }}>
            <strong>Is the payment recurring?</strong> No. Every tier is a single one-time payment and the
            listing stays up.
          </p>
          <p style={{ marginBottom: "15px" }}>
            <strong>Can I change the destination URL later?</strong> Yes — email us and we'll update it at
            no cost.
          </p>
          <p style={{ marginBottom: "15px" }}>
            <strong>Can I upgrade tiers?</strong> Yes. Pay the difference between what you paid and the
            higher tier, and we'll move the listing.
          </p>
          <p style={{ marginBottom: "15px" }}>
            <strong>Do you guarantee rankings?</strong> No, and nobody honestly can. What we can state
            plainly is what you get: a do-follow link on Platinum and Featured tiers from a live, indexed
            page in the random picker and lucky draw niche.
          </p>
        </article>
      </SiteWrapper>
    );
  }
}

export default List;
