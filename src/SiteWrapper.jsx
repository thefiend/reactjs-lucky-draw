// @flow

import * as React from "react";
import "./SiteWrapper.css";
import { Site, Nav, Grid, List, Button } from "tabler-react";

const navBarItems = [
  {
    value: "Home",
    to: "/",
    icon: "home",
    useExact: true,
  },
  {
    value: "Lucky Draw",
    icon: "box",
    to: "/",
  },
];

class SiteWrapper extends React.Component {
  render() {
    return (
      <Site.Wrapper
        headerProps={{
          href: "/",
          alt: "Lucky Draw Simulator",
          imageURL: "images/luckydraw-logo.svg",
          navItems: (
            <Nav.Item type="div" className="d-none d-md-flex">
              <Button
                href="https://github.com/thefiend/random-draw"
                target="_blank"
                outline
                size="sm"
                RootComponent="a"
                color="primary"
              >
                Source code
              </Button>
              <Button
                className="donate-button"
                pill
                icon="heart"
                href="https://www.buymeacoffee.com/jasonkam"
                target="_blank"
                size="md"
                RootComponent="a"
                color="orange"
              >
                Donate
              </Button>
            </Nav.Item>
          ),
        }}
        navProps={{ itemsObjects: navBarItems }}
        footerProps={{
          links: [],
          note:
            "Raffle draw tool created to make random selecting winners much easier.",
          copyright: (
            <React.Fragment>
              Copyright © 2019 - {(new Date().getFullYear())}
              <a href="/"> Lucky Draw Simulator</a>. Powered by
              <a
                href="https://jasys.xyz"
                target="_blank"
                rel="noopener noreferrer"
              >
                {" "}
                Jasys Technologies
              </a>
              {". "}
              All rights reserved.
            </React.Fragment>
          ),
          nav: (
            <React.Fragment>
              <Grid.Col auto={true}>
                <List className="list-inline list-inline-dots mb-0">
                  <List.Item className="list-inline-item">
                    <a href="./docs/index.html">Documentation</a>
                  </List.Item>
                  <List.Item className="list-inline-item">
                    <a href="./faq.html">FAQ</a>
                  </List.Item>
                </List>
              </Grid.Col>
              <Grid.Col auto={true}>
                <Button
                  href="https://github.com/thefiend/random-draw"
                  size="sm"
                  outline
                  color="primary"
                  RootComponent="a"
                >
                  Source code
                </Button>
              </Grid.Col>
            </React.Fragment>
          ),
        }}
      >
        {this.props.children}
      </Site.Wrapper>
    );
  }
}

export default SiteWrapper;
