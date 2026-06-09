import type { Metadata } from 'next';
import NavBar from '@/components/NavBar';

export const metadata: Metadata = {
  title: 'List Your Business | Get High-Quality Backlinks | LuckyDraw.me',
  description: 'Get your company listed on LuckyDraw.me for premium SEO backlinks. Join 689,840+ monthly visitors and boost your search rankings.',
  alternates: { canonical: 'https://luckydraw.me/list' },
};

const TIERS = [
  { name: 'Gold', price: '$99', description: 'Listed entry with nofollow link to your site.', envKey: 'NEXT_PUBLIC_STRIPE_GOLD_URL' as const },
  { name: 'Platinum', price: '$299', description: 'Do-follow link + logo + company description. Most popular.', badge: true, envKey: 'NEXT_PUBLIC_STRIPE_PLATINUM_URL' as const },
  { name: 'Featured', price: '$599', description: 'Above-the-fold placement + press mention.', envKey: 'NEXT_PUBLIC_STRIPE_FEATURED_URL' as const },
];

export default function ListPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-blue-600 mb-3">Get Your Company Listed on LuckyDraw.me</h1>
          <h2 className="text-xl text-gray-600 mb-8">Boost Your SEO with High-Quality Backlinks</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-10">
            LuckyDraw.me attracts over <strong>689,840 monthly users</strong>. A listing gives your site a high-quality backlink from a trusted domain in the events and giveaway niche. Platinum and Featured listings include do-follow links.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIERS.map((tier) => (
              <div key={tier.name} className="bg-white rounded-2xl p-8 border-2 border-gray-200 relative">
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-semibold px-4 py-1 rounded-full">Most Popular</div>
                )}
                <div className="text-xl font-bold mb-1">{tier.name}</div>
                <div className="text-3xl font-extrabold text-gray-900 mb-3">{tier.price}<span className="text-sm text-gray-400 font-normal"> one-time</span></div>
                <p className="text-gray-500 text-sm mb-6">{tier.description}</p>
                <a
                  href={process.env[tier.envKey] ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700"
                >
                  Get {tier.name} Listing
                </a>
              </div>
            ))}
          </div>
          <p className="text-gray-400 text-sm mt-8">After payment, email hello@luckydraw.me with your details. Listing added within 48 hours.</p>
        </div>
      </main>
    </>
  );
}
