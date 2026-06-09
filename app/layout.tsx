import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lucky Draw Online Generator | Free Random Winner Picker Tool',
  description: 'Use our free lucky draw online generator to pick random winners instantly. Best random name picker, raffle generator & contest draw tool.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
