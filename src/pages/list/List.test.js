import React from 'react';
import { render, screen } from '@testing-library/react';
import List from './List';

jest.mock('../../SiteWrapper', () => {
  return function MockSiteWrapper({ children }) {
    return <div data-testid="site-wrapper">{children}</div>;
  };
});

describe('List Component', () => {
  it('renders without crashing', () => {
    render(<List />);
    expect(screen.getByTestId('site-wrapper')).toBeInTheDocument();
  });

  it('displays the main heading', () => {
    render(<List />);
    expect(screen.getByText(/Get Your Company Listed on LuckyDraw.me/i)).toBeInTheDocument();
  });

  it('displays SEO backlinks subheading', () => {
    render(<List />);
    expect(screen.getByText(/Boost Your SEO with High-Quality Backlinks/i)).toBeInTheDocument();
  });

  it('renders the Google Form iframe', () => {
    const { container } = render(<List />);
    const iframe = container.querySelector('iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('title', 'List on LuckyDraw.me');
  });

  it('mentions user count in description', () => {
    render(<List />);
    expect(screen.getByText(/689,840 satisfied users/i)).toBeInTheDocument();
  });
});
