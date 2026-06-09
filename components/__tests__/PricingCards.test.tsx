import { render, screen, fireEvent } from '@testing-library/react';
import PricingCards from '@/components/PricingCards';

describe('PricingCards', () => {
  it('shows all three tiers', () => {
    render(<PricingCards />);
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('Business')).toBeInTheDocument();
  });

  it('shows monthly prices by default', () => {
    render(<PricingCards />);
    expect(screen.getByText('$9')).toBeInTheDocument();
    expect(screen.getByText('$49')).toBeInTheDocument();
  });

  it('toggles to annual pricing', () => {
    render(<PricingCards />);
    fireEvent.click(screen.getByRole('button', { name: /annual/i }));
    expect(screen.getByText('$79')).toBeInTheDocument();
    expect(screen.getByText('$399')).toBeInTheDocument();
  });

  it('Pro card has Popular badge', () => {
    render(<PricingCards />);
    expect(screen.getByText(/popular/i)).toBeInTheDocument();
  });
});
