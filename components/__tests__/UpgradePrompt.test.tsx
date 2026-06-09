import { render, screen, fireEvent } from '@testing-library/react';
import UpgradePrompt from '@/components/UpgradePrompt';

describe('UpgradePrompt', () => {
  it('renders the upgrade message', () => {
    render(<UpgradePrompt feature="unlimited" onClose={() => {}} />);
    expect(screen.getByText(/upgrade to pro/i)).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = jest.fn();
    render(<UpgradePrompt feature="unlimited" onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('has a link to /pricing', () => {
    render(<UpgradePrompt feature="export" onClose={() => {}} />);
    expect(screen.getByRole('link', { name: /see pricing/i })).toHaveAttribute('href', '/pricing');
  });
});
