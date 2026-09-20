import { Bricolage_Grotesque, IBM_Plex_Mono, Public_Sans } from "next/font/google";

import "./globals.css";

import Analytics from "../components/Analytics";
import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";
import { JsonLd, organizationSchema, websiteSchema } from "../lib/schema";
import { SHARE_IMAGE, SITE_NAME, SITE_URL } from "../lib/site";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
});

const sans = Public_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-public-sans",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-mono",
});

export const metadata = {
  // Every canonical and og:url in the app resolves against the www host.
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Lucky Draw Online Generator | Free Random Winner Picker",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Free lucky draw online generator. Paste your names, pick random winners, and keep the seed so anyone can check the draw was fair. No sign-up.",
  applicationName: SITE_NAME,
  authors: [{ name: "Jason Kam" }],
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    images: [
      {
        url: SHARE_IMAGE,
        width: 1200,
        height: 630,
        alt: "LuckyDraw.me — free lucky draw online generator",
      },
    ],
  },
  twitter: { card: "summary_large_image", images: [SHARE_IMAGE] },
  icons: { icon: "/favicon.ico" },
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: "black-translucent" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfaf4" },
    { media: "(prefers-color-scheme: dark)", color: "#141b34" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#draw"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-stock focus:px-3 focus:py-2"
        >
          Skip to the draw
        </a>
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <JsonLd schema={[organizationSchema(), websiteSchema()]} />
        <Analytics />
      </body>
    </html>
  );
}
