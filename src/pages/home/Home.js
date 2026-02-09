import "./Home.css";
import "tabler-react/dist/Tabler.css";

import { Button, Grid } from "tabler-react";
import React, { Component } from "react";

import Confetti from "react-dom-confetti";
import DrawForm from "../../components/DrawForm";
import { Helmet } from "react-helmet";
import PreviouslyDrawnItemsBlock from "../../components/PreviouslyDrawnItemsBlock";
import { FAQ, REVIEW, WEB_APPLICATION, ORGANIZATION, BREADCRUMB_HOME, SOFTWARE_APP } from "../Json-ld";
import SiteWrapper from "../../SiteWrapper";
import SponsorsSection from "../../components/SponsorsSection";
import TextLoop from "react-text-loop";
import FaqSection from "../../components/FaqSection";

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
      const formInputItems = this.state.drawItems;
      const itemList = formInputItems.split("\n");
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

    const maxItemIndex = currentItems.length;
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
          <title>Lucky Draw Online | Free Random Picker & Winner Selector Tool</title>
          <meta name="description" content="Free lucky draw online tool & random picker for instant winner selection. Best random name picker, raffle generator, and contest draw tool. Fast, fair & transparent for events, giveaways & competitions." />
          <link rel="canonical" href="https://luckydraw.me" />
          <script type="application/ld+json">{FAQ}</script>
          <script type="application/ld+json">{REVIEW}</script>
          <script type="application/ld+json">{WEB_APPLICATION}</script>
          <script type="application/ld+json">{ORGANIZATION}</script>
          <script type="application/ld+json">{BREADCRUMB_HOME}</script>
          <script type="application/ld+json">{SOFTWARE_APP}</script>
        </Helmet>
        {items.length === 0 && (
          <div className="hero-section" style={{ textAlign: 'center', padding: '40px 20px', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '2.5rem', color: '#198BCA', marginBottom: '20px', fontWeight: 'bold' }}>
              Free Lucky Draw Online Tool & Random Picker
            </h1>
            <h2 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '20px', fontWeight: 'normal' }}>
              Best Random Name Picker, Raffle Generator & Winner Selector
            </h2>
            <p style={{ fontSize: '1.1rem', color: '#666', maxWidth: '800px', margin: '0 auto 20px', lineHeight: '1.6' }}>
              The world's most trusted <strong>lucky draw tool</strong> and <strong>random picker</strong> for selecting winners instantly. 
              Perfect for <strong>raffles</strong>, <strong>giveaways</strong>, <strong>contests</strong>, and <strong>events</strong>. 
              Fast, fair, transparent, and completely <strong>free to use</strong>. Trusted by over 689,840 users worldwide!
            </p>
            <div style={{ marginTop: '25px' }}>
              <span style={{ fontSize: '1rem', color: '#888', fontStyle: 'italic' }}>
                ⭐⭐⭐⭐⭐ Rated 5/5 by 689,840+ users | No registration required | 100% Free
              </span>
            </div>
          </div>
        )}
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
          <Grid.Col xs={12} md={4}>
            <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
              <h3 style={{ color: '#198BCA', marginBottom: '15px' }}>Why Choose Our Lucky Draw Tool?</h3>
              <ul style={{ lineHeight: '2', paddingLeft: '20px' }}>
                <li><strong>100% Free</strong> - No registration or payment required</li>
                <li><strong>Fair & Random</strong> - Truly random winner selection</li>
                <li><strong>Fast Results</strong> - Instant lucky draw outcomes</li>
                <li><strong>Multiple Winners</strong> - Select as many winners as you need</li>
                <li><strong>Transparent</strong> - Clear and visible drawing process</li>
                <li><strong>No Limits</strong> - Unlimited lucky draws</li>
              </ul>
            </div>
          </Grid.Col>
        </Grid.Row>
        <Grid.Row style={{ marginTop: '40px', marginBottom: '40px' }}>
          <Grid.Col xs={12}>
            <div style={{ padding: '30px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h2 style={{ color: '#198BCA', marginBottom: '20px' }}>How to Use Our Random Picker Tool</h2>
              <Grid.Row>
                <Grid.Col xs={12} md={3}>
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <h3 style={{ color: '#198BCA', fontSize: '2rem' }}>1</h3>
                    <h4>Enter Names</h4>
                    <p>Add participant names or items, one per line</p>
                  </div>
                </Grid.Col>
                <Grid.Col xs={12} md={3}>
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <h3 style={{ color: '#198BCA', fontSize: '2rem' }}>2</h3>
                    <h4>Configure</h4>
                    <p>Choose your draw settings and preferences</p>
                  </div>
                </Grid.Col>
                <Grid.Col xs={12} md={3}>
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <h3 style={{ color: '#198BCA', fontSize: '2rem' }}>3</h3>
                    <h4>Click Draw</h4>
                    <p>Press the draw button to select random winner</p>
                  </div>
                </Grid.Col>
                <Grid.Col xs={12} md={3}>
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <h3 style={{ color: '#198BCA', fontSize: '2rem' }}>4</h3>
                    <h4>Get Results</h4>
                    <p>See your lucky draw winner instantly</p>
                  </div>
                </Grid.Col>
              </Grid.Row>
            </div>
          </Grid.Col>
        </Grid.Row>
        <hr />
        <SponsorsSection />
        <hr />
        <FaqSection />
        <hr />
        <Grid.Row>
          <Grid.Col xs={12}>
            <article style={{ padding: '30px', background: '#fff', borderRadius: '8px', marginBottom: '40px' }}>
              <h2 style={{ color: '#198BCA', marginBottom: '20px' }}>About Our Lucky Draw & Random Picker Tool</h2>
              <p style={{ lineHeight: '1.8', marginBottom: '15px' }}>
                <strong>LuckyDraw.me</strong> is the world's leading <strong>online lucky draw tool</strong> and <strong>random picker</strong> designed to help you select winners fairly and transparently. Whether you're organizing a <strong>raffle</strong>, <strong>giveaway</strong>, <strong>contest</strong>, or any <strong>random selection event</strong>, our tool provides instant, unbiased results that everyone can trust.
              </p>
              <h3 style={{ color: '#198BCA', marginTop: '25px', marginBottom: '15px' }}>Perfect for Every Occasion</h3>
              <p style={{ lineHeight: '1.8', marginBottom: '15px' }}>
                Our <strong>random name picker</strong> is ideal for businesses, event organizers, teachers, social media influencers, and individuals who need to conduct fair lucky draws. From small classroom activities to large corporate events, our tool scales to meet your needs. Use it for:
              </p>
              <ul style={{ lineHeight: '2', paddingLeft: '40px', marginBottom: '20px' }}>
                <li><strong>Social Media Giveaways</strong> - Pick Instagram, Facebook, or Twitter contest winners</li>
                <li><strong>Corporate Events</strong> - Select raffle winners at company gatherings</li>
                <li><strong>Classroom Activities</strong> - Randomly choose students for presentations</li>
                <li><strong>Online Contests</strong> - Draw winners from participant lists</li>
                <li><strong>Team Building</strong> - Random team assignments and ice breakers</li>
                <li><strong>Prize Draws</strong> - Fair selection for promotional campaigns</li>
              </ul>
              <h3 style={{ color: '#198BCA', marginTop: '25px', marginBottom: '15px' }}>Advanced Features</h3>
              <p style={{ lineHeight: '1.8', marginBottom: '15px' }}>
                Unlike basic <strong>random picker wheels</strong> or simple name generators, LuckyDraw.me offers professional-grade features including multiple winner selection, animation controls, and the option to remove drawn items for truly unique results. Our <strong>random winner picker</strong> algorithm ensures complete fairness in every draw.
              </p>
              <h3 style={{ color: '#198BCA', marginTop: '25px', marginBottom: '15px' }}>Trusted Worldwide</h3>
              <p style={{ lineHeight: '1.8', marginBottom: '15px' }}>
                With over <strong>689,840 satisfied users</strong> worldwide and a perfect <strong>5-star rating</strong>, LuckyDraw.me has become the go-to <strong>lucky draw simulator</strong> for individuals and organizations across the globe. Our commitment to transparency, fairness, and ease of use has made us the #1 choice for <strong>online lucky draws</strong> and <strong>random selections</strong>.
              </p>
              <p style={{ lineHeight: '1.8', marginBottom: '15px' }}>
                Start your <strong>free lucky draw</strong> today - no registration, no downloads, no hassle. Just instant, fair, and transparent winner selection at your fingertips!
              </p>
            </article>
          </Grid.Col>
        </Grid.Row>
        <hr />
        <Grid.Row>
          <Grid.Col xs={12} md={6} className="review-section">
            <h2>What Our Users Say</h2>
            <div className="powr-reviews" id="83081483_1602856389" />
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
