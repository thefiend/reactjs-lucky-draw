'use client';

import { useState } from 'react';
import Link from 'next/link';

const TIERS = [
  {
    name: 'Free',
    monthly: 0,
    annual: 0,
    description: 'For casual use',
    features: ['50 entries per draw', '1 winner per draw', 'Basic draw tool'],
    missing: ['Export PDF/CSV', 'Draw history', 'Ad-free'],
    cta: 'Current plan',
    ctaHref: '/',
    highlight: false,
  },
  {
    name: 'Pro',
    monthly: 9,
    annual: 79,
    description: 'For power users & creators',
    badge: 'Popular',
    features: ['Unlimited entries', 'Unlimited winners', 'Export PDF/CSV', '30-day draw history', 'Ad-free experience'],
    missing: [] as string[],
    cta: 'Start free trial',
    ctaHrefMonthly: process.env.NEXT_PUBLIC_LS_PRO_MONTHLY_URL ?? '/pricing',
    ctaHrefAnnual: process.env.NEXT_PUBLIC_LS_PRO_ANNUAL_URL ?? '/pricing',
    highlight: true,
  },
  {
    name: 'Business',
    monthly: 49,
    annual: 399,
    description: 'For teams & enterprises',
    features: ['Everything in Pro', 'White-label branding', 'Shareable private URL', 'API access', '5 team seats', '1-year draw history'],
    missing: [] as string[],
    cta: 'Start free trial',
    ctaHrefMonthly: process.env.NEXT_PUBLIC_LS_BUSINESS_MONTHLY_URL ?? '/pricing',
    ctaHrefAnnual: process.env.NEXT_PUBLIC_LS_BUSINESS_ANNUAL_URL ?? '/pricing',
    highlight: false,
  },
];

export default function PricingCards() {
  const [annual, setAnnual] = useState(false);

  return (
    <div>
      <div className="flex justify-center gap-3 mb-10">
        <button
          onClick={() => setAnnual(false)}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${!annual ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          Monthly
        </button>
        <button
          onClick={() => setAnnual(true)}
          aria-label="Annual"
          className={`px-4 py-2 rounded-lg text-sm font-medium ${annual ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          Annual <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Save 27%</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {TIERS.map((tier) => {
          const price = annual ? tier.annual : tier.monthly;
          const ctaHref = tier.name === 'Free'
            ? tier.ctaHref
            : annual
            ? (tier as { ctaHrefAnnual: string }).ctaHrefAnnual
            : (tier as { ctaHrefMonthly: string }).ctaHrefMonthly;

          return (
            <div
              key={tier.name}
              className={`relative rounded-2xl p-8 border-2 ${tier.highlight ? 'border-indigo-500 shadow-lg' : 'border-gray-200'}`}
            >
              {(tier as { badge?: string }).badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                  {(tier as { badge: string }).badge}
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
                <p className="text-gray-500 text-sm mt-1">{tier.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900">${price}</span>
                  {price > 0 && <span className="text-gray-400 text-sm ml-1">/{annual ? 'yr' : 'mo'}</span>}
                  {price === 0 && <span className="text-gray-400 text-sm ml-1">/forever</span>}
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-500 font-bold mt-0.5">✓</span> {f}
                  </li>
                ))}
                {tier.missing?.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-400">
                    <span className="mt-0.5">✗</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href={ctaHref ?? '/pricing'}
                className={`block text-center py-3 rounded-xl font-semibold text-sm transition ${
                  tier.highlight ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : tier.name === 'Business' ? 'bg-gray-900 text-white hover:bg-gray-800'
                  : 'bg-gray-100 text-gray-600 cursor-default'
                }`}
              >
                {tier.cta}
              </Link>
              {tier.name !== 'Free' && (
                <p className="text-center text-xs text-gray-400 mt-2">7-day free trial, card required</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
