import Link from "next/link";

import ThemeToggle from "./ThemeToggle";
import { NAV_LINKS, SITE_NAME } from "../lib/site";

export default function SiteHeader() {
  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight">
          {SITE_NAME}
        </Link>
        <nav aria-label="Main" className="flex items-center gap-5 text-sm">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-stamp">
              {link.label}
            </Link>
          ))}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
