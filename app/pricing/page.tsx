import type { Metadata } from 'next';
import NavBar from '@/components/NavBar';
import PricingCards from '@/components/PricingCards';

export const metadata: Metadata = {
  title: 'Pricing | LuckyDraw.me',
  description: 'Free, Pro ($9/mo), and Business ($49/mo) plans. Start with a 7-day free trial.',
  alternates: { canonical: 'https://luckydraw.me/pricing' },
};

export default function PricingPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-50 py-20 px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">Simple, honest pricing</h1>
          <p className="text-xl text-gray-500">Start free. Upgrade when you need more.</p>
        </div>
        <PricingCards />
      </main>
    </>
  );
}
