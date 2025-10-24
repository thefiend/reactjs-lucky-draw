import React, { Component } from "react";
import { Helmet } from "react-helmet";
import { REVIEW, ORGANIZATION } from "../Json-ld";
import SiteWrapper from "../../SiteWrapper";

class Faq extends Component {
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
          <script type="application/ld+json">{REVIEW}</script>
          <script type="application/ld+json">{ORGANIZATION}</script>
        </Helmet>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#198BCA', marginBottom: '15px' }}>Get Your Company Listed on LuckyDraw.me</h1>
          <h2 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '20px', fontWeight: 'normal' }}>Boost Your SEO with High-Quality Backlinks</h2>
        </div>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '20px' }}>LuckyDraw.me is one of the world's most visited <strong>lucky draw websites</strong> with over <strong>689,840 satisfied users</strong>. We help companies improve their <strong>Search Engine Optimization (SEO)</strong> through high-quality, do-follow backlinks.<br /><br />
        <strong>List your website today</strong> to benefit from our massive organic traffic and authority in the random picker and lucky draw niche. Perfect for businesses looking to improve their Google rankings!</p>
        <div className="w-full mx-auto">
        <iframe title="List on LuckyDraw.me" src="https://docs.google.com/forms/d/e/1FAIpQLSfXWCTYTY5nD6IRVUTgRr0QZRSk2_2JDgSqoPpA1HaTHUS5Dw/viewform?embedded=true" width="640" height="1524" frameBorder="0" marginHeight={0} marginWidth={0}>Loading…</iframe>
        </div>
      </SiteWrapper>
    );
  }
}

export default Faq;
