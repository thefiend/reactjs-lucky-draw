import Link from "next/link";

import { NAV_LINKS, SITE_NAME } from "../lib/site";

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-rule">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 text-sm text-slate sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          {SITE_NAME} — draws run in your browser. Nothing you paste leaves the page.
        </p>
        <nav aria-label="Footer" className="flex flex-wrap gap-4">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-ink">
              {link.label}
            </Link>
          ))}
          <a href="https://www.facebook.com/luckydraw.me/" rel="noopener noreferrer">
            Facebook
          </a>
        </nav>
      </div>
    </footer>
  );
}
