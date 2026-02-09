import { Component } from "react";
import { Helmet } from "react-helmet";
import SiteWrapper from "../../SiteWrapper";

import { FAQ, REVIEW, ORGANIZATION, BREADCRUMB_HOME } from "../Json-ld";
import FaqSection from "../../components/FaqSection/index.jsx";

class Faq extends Component {
  render() {
    return (
      <SiteWrapper>
        <Helmet>
          <meta charSet="utf-8" />
          <title>Lucky Draw FAQ | Random Picker Questions & Answers</title>
          <meta name="description" content="Frequently asked questions about lucky draw tools, random pickers, and raffle generators. Learn how to use our free online lucky draw tool effectively." />
          <link rel="canonical" href="https://luckydraw.me/faq" />
          <meta property="og:title" content="Lucky Draw FAQ | Random Picker Questions & Answers" />
          <meta property="og:description" content="Get answers to common questions about our lucky draw tool and random picker." />
          <meta property="og:url" content="https://luckydraw.me/faq" />
          <script type="application/ld+json">{FAQ}</script>
          <script type="application/ld+json">{REVIEW}</script>
          <script type="application/ld+json">{ORGANIZATION}</script>
          <script type="application/ld+json">{BREADCRUMB_HOME}</script>
        </Helmet>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#198BCA', marginBottom: '15px' }}>Frequently Asked Questions</h1>
          <p style={{ fontSize: '1.1rem', color: '#666' }}>Everything you need to know about our lucky draw tool and random picker</p>
        </div>
        <FaqSection />
      </SiteWrapper>
    );
  }
}

export default Faq;
