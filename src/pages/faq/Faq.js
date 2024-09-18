import React, { Component } from "react";
import { APP_NAME } from "../../constants.js";
import { Helmet } from "react-helmet";
import SiteWrapper from "../../SiteWrapper";

import { Card } from "tabler-react";
import { FAQ, REVIEW } from "../Json-ld";

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
        <h1>Frequently Asked Questions (FAQ)</h1>
        <Card>
          <Card.Body>
            <Card>
              <Card.Status color="blue" />
              <Card.Header>
                <Card.Title>
                  What tools can I use to do a lucky draw?
                </Card.Title>
              </Card.Header>
              <Card.Body>
                <b>
                  <a href="http://luckydraw.me/">Lucky Draw Simulator</a>
                </b>{" "}
                is a great tool which many companies and individuals trust and
                use to ensure a fair and transparent drawing process. It is free
                and easy to use which requires only a few configurations to get
                started right away.
              </Card.Body>
            </Card>
            <Card>
              <Card.Status color="blue" />
              <Card.Header>
                <Card.Title>How does a lucky draw work?</Card.Title>
              </Card.Header>
              <Card.Body>
                A lucky draw is a gambling competition in which people randomly
                obtain numbered tickets and each tickets have a chance of
                winning a prize. A numbered ticket is selected at random and the
                selected winner walks away with a prize.
              </Card.Body>
            </Card>
            <Card>
              <Card.Status color="blue" />
              <Card.Header>
                <Card.Title>How do you hold a lucky draw?</Card.Title>
              </Card.Header>
              <Card.Body>
                Any company or individuals can easily host a lucky draw online
                simply by setting a certain requirements and prepare rewards for
                the winners. Tools such as{" "}
                <b>
                  <a href="http://luckydraw.me/">Lucky Draw Simulator</a>
                </b>{" "}
                is then used to select the winners, ensuring a fair and
                transparent drawing process.
              </Card.Body>
            </Card>
            <Card>
              <Card.Status color="blue" />
              <Card.Header>
                <Card.Title>What is a good lucky draw prize?</Card.Title>
              </Card.Header>
              <Card.Body>
                Prizes such as Electronic Devices, Gift Baskets, Seasonal
                Products, Television, Gift Vouchers and Travel Voucher are
                popular lucky draw prize ideas.
              </Card.Body>
            </Card>
          </Card.Body>
        </Card>
      </SiteWrapper>
    );
  }
}

export default Faq;
