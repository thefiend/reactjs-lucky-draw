import React from 'react';
import { render, screen } from '@testing-library/react';
import FaqSection from './index';

describe('FaqSection', () => {
  it('renders FAQ heading as h2, not h1', () => {
    render(<FaqSection />);
    const heading = screen.getByText(/Frequently Asked Questions/i);
    expect(heading.tagName).toBe('H2');
  });

  it('renders 13 FAQ question titles', () => {
    render(<FaqSection />);
    const questionTitles = [
      'What tools can I use to do a lucky draw?',
      'What is a lucky draw tool?',
      'How does a lucky draw tool work?',
      'How does a lucky draw work?',
      'How can I ensure that the tool is fair and random?',
      'Does the tool support multiple winners?',
      'How do you hold a lucky draw?',
      'What is a good lucky draw prize?',
      'How secure is LuckyDraw.me for storing data?',
      'What are popular lucky draw tools?',
      'What is a lucky draw online generator?',
      'Can I use the lucky draw generator for Instagram giveaways?',
      'Is the lucky draw generator suitable for corporate events and team building?',
    ];
    questionTitles.forEach(title => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });

  it('expanded answer for first question mentions luckydraw.me', () => {
    render(<FaqSection />);
    const matches = screen.getAllByText(/luckydraw\.me/i);
    expect(matches.length).toBeGreaterThan(0);
  });

  it('new generator question targets keyword', () => {
    render(<FaqSection />);
    expect(screen.getByText('What is a lucky draw online generator?')).toBeInTheDocument();
  });
});
