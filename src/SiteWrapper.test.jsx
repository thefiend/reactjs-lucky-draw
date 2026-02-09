import React from 'react';
import { render, screen } from '@testing-library/react';
import SiteWrapper from './SiteWrapper';

jest.mock('./components/Copyright', () => {
  return function MockCopyright() {
    return <div data-testid="copyright">Copyright</div>;
  };
});

jest.mock('./components/FooterNote', () => {
  return function MockFooterNote() {
    return <div data-testid="footer-note">Footer Note</div>;
  };
});

jest.mock('./components/NavBar', () => {
  return function MockNavBar() {
    return <div data-testid="navbar">NavBar</div>;
  };
});

jest.mock('./components/NavItems', () => {
  return function MockNavItems() {
    return <div data-testid="nav-items">NavItems</div>;
  };
});

describe('SiteWrapper Component', () => {
  it('renders without crashing', () => {
    render(
      <SiteWrapper>
        <div>Test Content</div>
      </SiteWrapper>
    );
  });

  it('renders children content', () => {
    render(
      <SiteWrapper>
        <div data-testid="child-content">Test Content</div>
      </SiteWrapper>
    );
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('wraps children in container with main-section class', () => {
    const { container } = render(
      <SiteWrapper>
        <div>Test Content</div>
      </SiteWrapper>
    );
    const mainSection = container.querySelector('.main-section');
    expect(mainSection).toBeInTheDocument();
    expect(mainSection.classList.contains('container')).toBeTruthy();
  });
});
