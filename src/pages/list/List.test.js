import React from 'react';
import { render, screen } from '@testing-library/react';
import List from './List';

jest.mock('../../SiteWrapper', () => {
  return function MockSiteWrapper({ children }) {
    return <div data-testid="site-wrapper">{children}</div>;
  };
});

describe('List page', () => {
  it('shows Gold tier button', () => {
    render(<List />);
    expect(screen.getAllByText(/Gold/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/\$99/)).toBeInTheDocument();
  });

  it('shows Platinum tier button', () => {
    render(<List />);
    expect(screen.getAllByText(/Platinum/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/\$299/)).toBeInTheDocument();
  });

  it('shows Featured tier button', () => {
    render(<List />);
    expect(screen.getAllByText(/Featured/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/\$599/)).toBeInTheDocument();
  });

  it('does not render the old Google Form iframe', () => {
    const { container } = render(<List />);
    expect(container.querySelector('iframe')).not.toBeInTheDocument();
  });
});
