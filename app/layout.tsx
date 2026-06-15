import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Jost, DM_Sans } from 'next/font/google';
import './globals.css';

const jost = Jost({
  subsets: ['latin'],
  variable: '--font-jost',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Lucky Draw Online Generator | Free Random Winner Picker Tool',
  description: 'Use our free lucky draw online generator to pick random winners instantly. Best random name picker, raffle generator & contest draw tool.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${jost.variable} ${dmSans.variable}`}>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
