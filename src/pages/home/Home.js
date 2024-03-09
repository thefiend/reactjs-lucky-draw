import "./Home.css";
import "tabler-react/dist/Tabler.css";

import { Button, Card, Grid } from "tabler-react";
import React, { Component } from "react";

import Confetti from "react-dom-confetti";
import DrawForm from "../../components/DrawForm";
import { Helmet } from "react-helmet";
import PreviouslyDrawnItemsBlock from "../../components/PreviouslyDrawnItemsBlock";
import { REVIEW } from "../Json-ld";
import SiteWrapper from "../../SiteWrapper";
import SponsorsSection from "../../components/SponsorsSection";
import TextLoop from "react-text-loop";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      items: [],
      drawItems: [],
      currentItems: [],
      pastDrawnItems: [],
      result: "",
      showTextAnimation: true,
      removeDrawnItem: false,
      animationInterval: 150,
      showResult: false,
      disableDrawButton: false,
      value: "",
      placeholder: "Please enter the draw items here. One item per line.",
      valid: false,
      touched: false,
      validationRules: {
        minLength: 3,
        isRequired: true,
      },
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSkipAnimationChange = this.handleSkipAnimationChange.bind(this);
    this.handleRemoveDrawnItemChange =
      this.handleRemoveDrawnItemChange.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    if (this.state.drawItems.length > 2) {
      let formInputItems = this.state.drawItems;
      let itemList = formInputItems.split("\n");
      this.setState({
        ...this.state,
        items: itemList,
        currentItems: itemList,
      });
    }
  }

  handleChange(e) {
    this.setState({ [e.name]: e.value });
  }

  handleSkipAnimationChange = () => {
    this.setState({ showTextAnimation: !this.state.showTextAnimation });
  };

  handleRemoveDrawnItemChange = () => {
    this.setState({ removeDrawnItem: !this.state.removeDrawnItem });
  };

  sleep = (time) => {
    return new Promise((resolve) => setTimeout(resolve, time));
  };

  randomDrawItem = () => {
    const { currentItems, showTextAnimation, removeDrawnItem } = this.state;
    this.setState({
      ...this.state,
      showResult: false,
      disableDrawButton: true,
    });

    let maxItemIndex = currentItems.length;
    const randomIndex = Math.floor(Math.random() * maxItemIndex);
    this.sleep(showTextAnimation ? 3000 : 0).then(() => {
      this.setState({
        ...this.state,
        result: currentItems[randomIndex],
        pastDrawnItems: [
          ...this.state.pastDrawnItems,
          currentItems[randomIndex],
        ],
        showResult: true,
        disableDrawButton: false,
      });
    });
    if (removeDrawnItem) {
      const copyCurrentItems = [...this.state.currentItems];
      copyCurrentItems.splice(randomIndex, 1);
      this.setState({
        currentItems: copyCurrentItems,
      });
    }
  };

  render() {
    const {
      items,
      drawItems,
      currentItems,
      result,
      disableDrawButton,
      pastDrawnItems,
      placeholder,
      showResult,
    } = this.state;
    return (
      <SiteWrapper>
        <Helmet>
          <meta charSet="utf-8" />
          <script type="application/ld+json">{REVIEW}</script>
        </Helmet>
        <Grid.Row>
          <h1>Welcome to Our Lucky Draw Random Name Picker Tool</h1>
          <p>
            Are you looking for a reliable and efficient "lucky draw random name picker"
            tool for your activities? Look no further! Our Lucky Draw Random Name Picker
            tool is designed to simplify the process of making random
            selections, whether it's for games, contests, or any other scenario
            where a random choice is required.
          </p>
        </Grid.Row>
        <hr />
        {items.length !== 0 && (
          <div className="draw-block">
            <Grid.Row>
              <Grid.Col md={5} sm={12}>
                <div className="draw-section">
                  {!showResult && items && (
                    <TextLoop
                      className="draw-text"
                      interval={100}
                      springConfig={{ stiffness: 180, damping: 8 }}
                      children={items}
                    />
                  )}
                  <Confetti active={this.state.showResult} />
                  {showResult && result}
                </div>
                <Button
                  pill
                  block
                  name="drawButton"
                  color="primary"
                  onClick={this.randomDrawItem}
                  disabled={disableDrawButton || currentItems.length <= 1}
                >
                  {disableDrawButton ? "Drawing..." : "Draw"}
                </Button>
              </Grid.Col>
              <Grid.Col md={4} sm={12}>
                <PreviouslyDrawnItemsBlock pastDrawnItems={pastDrawnItems} />
              </Grid.Col>
            </Grid.Row>
          </div>
        )}
        <Grid.Row>
          <Grid.Col xs={12} md={8}>
            <DrawForm
              className="draw-form"
              drawItems={drawItems}
              onSubmit={this.handleSubmit}
              handleSkipAnimationChange={this.handleSkipAnimationChange}
              handleRemoveDrawnItemChange={this.handleRemoveDrawnItemChange}
              onChange={this.handleChange}
              placeholder={placeholder}
            />
          </Grid.Col>
        </Grid.Row>
        <hr />
        <SponsorsSection />

        <hr />
        <Grid.Row>
          <h2>Why Choose Our Lucky Draw Random Name Picker Tool?</h2>
          <ol>
            <li>
              <h3>User-Friendly "Random Name Picker" Tool</h3>
              <p>
                Our "random name picker" tool features a user-friendly
                interface, making it easy for you to input a list of names and
                swiftly obtain a random selection.
              </p>
            </li>
            <li>
              <h3>Versatile Applications for "Random Name Picker"</h3>
              <p>
                Whether you're a teacher, event organizer, or business owner,
                our "random name picker" tool is suitable for a wide range of
                scenarios where random selections are needed.
              </p>
            </li>
            <li>
              <h3>Quick and Reliable "Random Name Picker"</h3>
              <p>
                Tool With our advanced algorithm, you can trust that the "random
                name picker" process is both quick and reliable, saving you time
                and effort.
              </p>
            </li>
            <li>
              <h3>No Registration Required for "Random Name Picker"</h3>
              <p>
                We understand the importance of convenience, which is why our
                "random name picker" tool does not require any registration.
                Simply input your names and get started!
              </p>
            </li>
          </ol>
        </Grid.Row>
        <hr />
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
        <hr />
        <Grid.Row>
          <Grid.Col xs={12} md={6} className="review-section">
            <h2>What Our Users Say</h2>
            <div className="powr-reviews" id="83081483_1602856389"></div>
          </Grid.Col>
          <Grid.Col xs={12} md={6}>
            <div
              className="fb-page"
              data-href="https://www.facebook.com/luckydraw.me/"
              data-tabs="timeline"
              data-width=""
              data-height=""
              data-small-header="true"
              data-adapt-container-width="true"
              data-hide-cover="false"
              data-show-facepile="true"
            >
              <blockquote
                cite="https://www.facebook.com/luckydraw.me/"
                className="fb-xfbml-parse-ignore"
              >
                <a href="https://www.facebook.com/luckydraw.me/">
                  LuckyDraw.me
                </a>
              </blockquote>
            </div>
          </Grid.Col>
        </Grid.Row>
      </SiteWrapper>
    );
  }
}

export default App;
