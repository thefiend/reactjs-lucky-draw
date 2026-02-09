import React from 'react';
import { render, screen } from '@testing-library/react';
import NavBar from './NavBar';

describe('NavBar Component', () => {
  it('renders without crashing', () => {
    render(<NavBar />);
  });

  it('renders FAQ link', () => {
    render(<NavBar />);
    const faqLink = screen.getByText('FAQ');
    expect(faqLink).toBeInTheDocument();
    expect(faqLink).toHaveAttribute('href', './faq');
  });

  it('renders LIST link', () => {
    render(<NavBar />);
    const listLink = screen.getByText('LIST');
    expect(listLink).toBeInTheDocument();
    expect(listLink).toHaveAttribute('href', './list');
  });

  it('renders Source code button', () => {
    render(<NavBar />);
    const sourceButton = screen.getByText('Source code');
    expect(sourceButton).toBeInTheDocument();
    expect(sourceButton).toHaveAttribute('href', 'https://github.com/thefiend/random-draw');
  });

  it('Source code button opens in correct location', () => {
    render(<NavBar />);
    const sourceButton = screen.getByText('Source code');
    expect(sourceButton.tagName).toBe('A');
  });
});
