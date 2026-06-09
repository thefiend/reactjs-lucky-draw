import React from 'react';
import { render } from '@testing-library/react';
import StickyAd from './StickyAd';

describe('StickyAd', () => {
  it('renders the ad container with correct id', () => {
    render(<StickyAd />);
    expect(document.getElementById('ezoic-pub-ad-placeholder-sticky-footer')).toBeInTheDocument();
  });

  it('applies sticky footer styles', () => {
    const { container } = render(<StickyAd />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveStyle({ position: 'fixed' });
    expect(wrapper).toHaveStyle({ bottom: '0' });
  });
});
