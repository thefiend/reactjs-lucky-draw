import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import WinnerCard from '@/components/WinnerCard';

describe('WinnerCard', () => {
  it('renders all winner names', () => {
    const ref = createRef<HTMLDivElement>();
    render(<WinnerCard winners={['Alice', 'Bob']} title="Team Raffle" date="Jun 12 2026" plan="pro" cardRef={ref} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('renders title and date', () => {
    const ref = createRef<HTMLDivElement>();
    render(<WinnerCard winners={['Alice']} title="My Draw" date="Jun 12 2026" plan="pro" cardRef={ref} />);
    expect(screen.getByText(/My Draw/)).toBeInTheDocument();
    expect(screen.getByText(/Jun 12 2026/)).toBeInTheDocument();
  });

  it('shows watermark for free plan', () => {
    const ref = createRef<HTMLDivElement>();
    render(<WinnerCard winners={['Alice']} title="Draw" date="Jun 12 2026" plan="free" cardRef={ref} />);
    expect(screen.getByTestId('watermark')).toBeInTheDocument();
  });

  it('does not show watermark for pro plan', () => {
    const ref = createRef<HTMLDivElement>();
    render(<WinnerCard winners={['Alice']} title="Draw" date="Jun 12 2026" plan="pro" cardRef={ref} />);
    expect(screen.queryByTestId('watermark')).not.toBeInTheDocument();
  });

  it('does not show watermark for business plan', () => {
    const ref = createRef<HTMLDivElement>();
    render(<WinnerCard winners={['Alice']} title="Draw" date="Jun 12 2026" plan="business" cardRef={ref} />);
    expect(screen.queryByTestId('watermark')).not.toBeInTheDocument();
  });

  it('renders luckydraw.me branding', () => {
    const ref = createRef<HTMLDivElement>();
    render(<WinnerCard winners={['Alice']} title="Draw" date="Jun 12 2026" plan="pro" cardRef={ref} />);
    expect(screen.getByText('luckydraw.me')).toBeInTheDocument();
  });
});
