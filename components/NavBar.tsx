'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Show, SignInButton, UserButton } from '@clerk/nextjs';

export default function NavBar() {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5 border-b border-[#9CD6EF]/30" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: '0 1px 16px rgba(13,73,114,0.06)' }}>
      <Link href="/" className="flex items-center">
        <Image
          src="/luckydraw-generator-tool-app-logo.svg"
          alt="LuckyDraw.me"
          width={182}
          height={32}
          priority
        />
      </Link>

      <div className="flex items-center gap-6">
        <Link
          href="/pricing"
          className="text-[#4A4A4A]/60 hover:text-[#198BCA] text-sm font-medium transition-colors"
        >
          Pricing
        </Link>
        <Link
          href="/faq"
          className="text-[#4A4A4A]/60 hover:text-[#198BCA] text-sm font-medium transition-colors"
        >
          FAQ
        </Link>
        <Link
          href="/list"
          className="text-[#4A4A4A]/60 hover:text-[#198BCA] text-sm font-medium transition-colors"
        >
          Get Listed
        </Link>
        <Show when="signed-in">
          <Link
            href="/dashboard"
            className="text-[#4A4A4A]/60 hover:text-[#198BCA] text-sm font-medium transition-colors"
          >
            Dashboard
          </Link>
          <UserButton />
        </Show>
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="bg-[#198BCA] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#139DD9] transition-colors">
              Sign In
            </button>
          </SignInButton>
        </Show>
      </div>
    </nav>
  );
}
