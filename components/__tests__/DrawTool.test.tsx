import { render, screen, fireEvent } from '@testing-library/react';
import DrawTool from '@/components/DrawTool';

describe('DrawTool', () => {
  it('renders the entry textarea', () => {
    render(<DrawTool plan="free" />);
    expect(screen.getByPlaceholderText(/enter names/i)).toBeInTheDocument();
  });

  it('shows upgrade prompt when free user has more than 50 entries', () => {
    render(<DrawTool plan="free" />);
    const textarea = screen.getByPlaceholderText(/enter names/i);
    const entries = Array.from({ length: 51 }, (_, i) => `Person ${i + 1}`).join('\n');
    fireEvent.change(textarea, { target: { value: entries } });
    fireEvent.click(screen.getByRole('button', { name: /draw/i }));
    expect(screen.getByText(/upgrade to pro/i)).toBeInTheDocument();
  });

  it('draws a winner from entries for pro user', () => {
    render(<DrawTool plan="pro" />);
    const textarea = screen.getByPlaceholderText(/enter names/i);
    fireEvent.change(textarea, { target: { value: 'Alice\nBob\nCharlie' } });
    fireEvent.click(screen.getByRole('button', { name: /draw/i }));
    const winner = screen.getByTestId('winner-display');
    expect(['Alice', 'Bob', 'Charlie']).toContain(winner.textContent);
  });

  it('does not show ads for pro user', () => {
    const { container } = render(<DrawTool plan="pro" />);
    expect(container.querySelector('[data-ad]')).not.toBeInTheDocument();
  });
});
