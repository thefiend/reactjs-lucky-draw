import React, { Component } from "react";
import { APP_NAME } from "../../constants.js";
import { Helmet } from "react-helmet";
import { REVIEW } from "../Json-ld";
import SiteWrapper from "../../SiteWrapper";

class Faq extends Component {
  render() {
    return (
      <SiteWrapper>
        <Helmet>
          <meta charSet="utf-8" />
          <title>{APP_NAME} - Best SEO Rank Listing</title>
          <script type="application/ld+json">{REVIEW}</script>
        </Helmet>
        <h1>Get your Company Listed on LuckyDraw.me for best SEO rank.</h1>
        <p>We are one of the world's biggest lucky draw website that helped many companies with Search Engine Optimization (SEO) with high quality backlink.<br />
        List your website today for the best seo results.</p>
        <div className="w-full mx-auto">
        <iframe title="List on LuckyDraw.me" src="https://docs.google.com/forms/d/e/1FAIpQLSfXWCTYTY5nD6IRVUTgRr0QZRSk2_2JDgSqoPpA1HaTHUS5Dw/viewform?embedded=true" width="640" height="1524" frameBorder="0" marginHeight={0} marginWidth={0}>Loading…</iframe>
        </div>
      </SiteWrapper>
    );
  }
}

export default Faq;
