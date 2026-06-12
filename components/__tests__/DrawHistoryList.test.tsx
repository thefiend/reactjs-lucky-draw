import { render, screen, fireEvent, act } from '@testing-library/react';
import DrawHistoryList from '@/components/DrawHistoryList';

jest.mock('canvas-confetti', () => jest.fn());
jest.mock('@/lib/downloadCertificate', () => ({ downloadCertificate: jest.fn() }));
jest.mock('html2canvas', () => jest.fn());

afterEach(() => {
  jest.useRealTimers();
});

const DRAWS = [
  {
    id: 'draw-1',
    title: 'Team Raffle',
    entries: ['Alice', 'Bob', 'Carol'],
    winners: ['Alice'],
    drawn_at: '2026-06-12T10:00:00Z',
  },
  {
    id: 'draw-2',
    title: 'Prize Draw',
    entries: ['Dave', 'Eve'],
    winners: ['Eve'],
    drawn_at: '2026-06-11T10:00:00Z',
  },
];

describe('DrawHistoryList', () => {
  it('renders draw titles and winners', () => {
    render(<DrawHistoryList draws={DRAWS} />);
    expect(screen.getByText('Team Raffle')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Prize Draw')).toBeInTheDocument();
    expect(screen.getByText('Eve')).toBeInTheDocument();
  });

  it('renders empty state when draws is empty', () => {
    render(<DrawHistoryList draws={[]} />);
    expect(screen.getByText(/no draws yet/i)).toBeInTheDocument();
  });

  it('renders Replay and Download Certificate buttons for each draw', () => {
    render(<DrawHistoryList draws={DRAWS} />);
    expect(screen.getAllByRole('button', { name: /replay/i })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /download certificate/i })).toHaveLength(2);
  });

  it('shows "Replaying..." and disables Replay button during animation', async () => {
    jest.useFakeTimers();
    render(<DrawHistoryList draws={DRAWS} />);
    const [replayBtn] = screen.getAllByRole('button', { name: /replay/i });
    fireEvent.click(replayBtn);
    expect(screen.getByRole('button', { name: /replaying/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /replay/i })[0]).toBeDisabled();
  });

  it('clears replaying state after animation completes', async () => {
    jest.useFakeTimers();
    render(<DrawHistoryList draws={DRAWS} />);
    const [replayBtn] = screen.getAllByRole('button', { name: /replay/i });
    fireEvent.click(replayBtn);
    await act(async () => { jest.advanceTimersByTime(3000); });
    expect(screen.queryByRole('button', { name: /replaying/i })).not.toBeInTheDocument();
  });

  it('fires confetti after replay completes', async () => {
    jest.useFakeTimers();
    const confetti = require('canvas-confetti') as jest.Mock;
    confetti.mockClear();
    render(<DrawHistoryList draws={DRAWS} />);
    const [replayBtn] = screen.getAllByRole('button', { name: /replay/i });
    fireEvent.click(replayBtn);
    await act(async () => { jest.advanceTimersByTime(3000); });
    expect(confetti).toHaveBeenCalledTimes(1);
  });

  it('calls downloadCertificate when Download Certificate is clicked', async () => {
    const { downloadCertificate } = require('@/lib/downloadCertificate') as { downloadCertificate: jest.Mock };
    downloadCertificate.mockClear();
    downloadCertificate.mockResolvedValue(undefined);
    render(<DrawHistoryList draws={DRAWS} />);
    const [downloadBtn] = screen.getAllByRole('button', { name: /download certificate/i });
    fireEvent.click(downloadBtn);
    // Wait for useEffect to fire after state update
    await act(async () => {});
    expect(downloadCertificate).toHaveBeenCalledTimes(1);
  });
});
