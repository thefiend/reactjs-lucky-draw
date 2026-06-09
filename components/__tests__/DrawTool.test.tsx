import { render, screen, fireEvent, act } from '@testing-library/react';
import DrawTool from '@/components/DrawTool';

jest.mock('@/app/actions', () => ({
  saveDrawAction: jest.fn(),
}));

jest.mock('canvas-confetti', () => jest.fn());

afterEach(() => {
  jest.useRealTimers();
});

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

  it('draws a winner from entries for pro user', async () => {
    jest.useFakeTimers();
    render(<DrawTool plan="pro" />);
    const textarea = screen.getByPlaceholderText(/enter names/i);
    fireEvent.change(textarea, { target: { value: 'Alice\nBob\nCharlie' } });
    fireEvent.click(screen.getByRole('button', { name: /draw winner/i }));

    // advance past full 2s animation
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    const winner = screen.getByTestId('winner-display');
    expect(['Alice', 'Bob', 'Charlie']).toContain(winner.textContent);
    jest.useRealTimers();
  });

  it('does not show ads for pro user', () => {
    const { container } = render(<DrawTool plan="pro" />);
    expect(container.querySelector('[data-ad]')).not.toBeInTheDocument();
  });

  it('disables draw button while animating', async () => {
    jest.useFakeTimers();
    render(<DrawTool plan="pro" />);
    const textarea = screen.getByPlaceholderText(/enter names/i);
    fireEvent.change(textarea, { target: { value: 'Alice\nBob\nCharlie' } });
    const drawButton = screen.getByRole('button', { name: /draw winner/i });
    fireEvent.click(drawButton);

    expect(drawButton).toBeDisabled();

    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    expect(drawButton).not.toBeDisabled();
  });

  it('does not show winner-display during animation', async () => {
    jest.useFakeTimers();
    render(<DrawTool plan="pro" />);
    const textarea = screen.getByPlaceholderText(/enter names/i);
    fireEvent.change(textarea, { target: { value: 'Alice\nBob\nCharlie' } });
    fireEvent.click(screen.getByRole('button', { name: /draw winner/i }));

    expect(screen.queryByTestId('winner-display')).not.toBeInTheDocument();

    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    expect(screen.getByTestId('winner-display')).toBeInTheDocument();
  });

  it('fires confetti when winner is revealed', async () => {
    jest.useFakeTimers();
    const confetti = require('canvas-confetti') as jest.Mock;
    confetti.mockClear();

    render(<DrawTool plan="pro" />);
    const textarea = screen.getByPlaceholderText(/enter names/i);
    fireEvent.change(textarea, { target: { value: 'Alice\nBob\nCharlie' } });
    fireEvent.click(screen.getByRole('button', { name: /draw winner/i }));

    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    expect(confetti).toHaveBeenCalledTimes(1);
    expect(confetti).toHaveBeenCalledWith(
      expect.objectContaining({ particleCount: 120, spread: 70 })
    );
    jest.useRealTimers();
  });
});
