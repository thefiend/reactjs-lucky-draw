import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

export default function NavBar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
      <Link href="/" className="font-bold text-xl text-blue-600">
        LuckyDraw.me
      </Link>
      <div className="flex items-center gap-6">
        <Link href="/pricing" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
          Pricing
        </Link>
        <Link href="/faq" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
          FAQ
        </Link>
        <Link href="/list" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
          Get Listed
        </Link>
        <SignedIn>
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
            Dashboard
          </Link>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </nav>
  );
}
