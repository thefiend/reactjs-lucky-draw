// @flow

import * as React from 'react';
import './SiteWrapper.css';
import { APP_NAME, NAVBAR_ITEMS } from './constants.js';
import { Site } from 'tabler-react';
import Copyright from './components/Copyright';
import FooterNote from './components/FooterNote';
import NavBar from './components/NavBar';
import NavItems from './components/NavItems';

class SiteWrapper extends React.Component {
  render() {
    return (
      <Site.Wrapper
        headerProps={{
          href: '/',
          alt: APP_NAME,
          imageURL: 'images/luckydraw-logo.svg',
          navItems: <NavItems />,
        }}
        navProps={{ itemsObjects: NAVBAR_ITEMS }}
        footerProps={{
          note: <FooterNote />,
          copyright: <Copyright />,
          nav: <NavBar />,
        }}
      >
        <div className="container main-section">{this.props.children}</div>
      </Site.Wrapper>
    );
  }
}

export default SiteWrapper;
