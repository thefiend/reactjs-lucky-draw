import { Component } from "react";
import { APP_NAME } from "../../constants.js";
import { Helmet } from "react-helmet";
import SiteWrapper from "../../SiteWrapper";

import { FAQ, REVIEW } from "../Json-ld";
import FaqSection from "../../components/FaqSection/index.jsx";

class Faq extends Component {
  render() {
    return (
      <SiteWrapper>
        <Helmet>
          <meta charSet="utf-8" />
          <title>{APP_NAME} - Frequently Asked Questions (FAQ)</title>
          <script type="application/ld+json">{FAQ}</script>
          <script type="application/ld+json">{REVIEW}</script>
        </Helmet>
        <FaqSection />
      </SiteWrapper>
    );
  }
}

export default Faq;
