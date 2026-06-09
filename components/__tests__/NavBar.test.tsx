import { render, screen } from '@testing-library/react';
import NavBar from '@/components/NavBar';

// Mock Clerk components
jest.mock('@clerk/nextjs', () => ({
  SignInButton: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  UserButton: () => <div data-testid="user-button" />,
  Show: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('NavBar', () => {
  it('renders site logo link', () => {
    render(<NavBar />);
    expect(screen.getByRole('link', { name: /luckydraw/i })).toBeInTheDocument();
  });

  it('renders nav links', () => {
    render(<NavBar />);
    expect(screen.getByRole('link', { name: /pricing/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /faq/i })).toBeInTheDocument();
  });
});
