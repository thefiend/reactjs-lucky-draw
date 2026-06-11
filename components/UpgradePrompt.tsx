import Link from 'next/link';
import { Feature } from '@/lib/plan';

const MESSAGES: Record<Feature, string> = {
  unlimited: "You've reached the 50-entry limit. Go Pro for unlimited entries.",
  'multi-winner': 'Draw multiple winners at once — available on Pro and above.',
  export: 'Export results as PDF or CSV — available on Pro and above.',
  history: 'Save and revisit your draw history — available on Pro and above.',
  noad: 'Enjoy an ad-free experience — available on Pro and above.',
  whitelabel: 'Remove LuckyDraw.me branding — available on Business plan.',
  api: 'API access is available on the Business plan.',
};

interface UpgradePromptProps {
  feature: Feature;
  onClose: () => void;
}

export default function UpgradePrompt({ feature, onClose }: UpgradePromptProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Upgrade to Pro</h2>
        <p className="text-gray-600 mb-6">{MESSAGES[feature]}</p>
        <div className="flex gap-3">
          <Link
            href="/pricing"
            className="flex-1 bg-indigo-600 text-white text-center py-3 rounded-xl font-semibold hover:bg-indigo-700"
          >
            See Pricing
          </Link>
          <button
            onClick={onClose}
            aria-label="Close"
            className="px-4 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
