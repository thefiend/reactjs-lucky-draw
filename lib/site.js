// www is the canonical host: the live site answers www with 200 and 301s the
// apex domain to it, so an apex URL anywhere in metadata is a canonical that
// points at a redirect. Build every absolute URL from here.
export const SITE_URL = "https://www.luckydraw.me";

export const SITE_NAME = "LuckyDraw.me";

export const SHARE_IMAGE = `${SITE_URL}/images/luckydraw-share.png`;

export const url = (path = "/") => (path === "/" ? SITE_URL : `${SITE_URL}${path}`);

export const NAV_LINKS = [
  { label: "Draw", href: "/" },
  { label: "FAQ", href: "/faq" },
  { label: "Sponsor us", href: "/list" },
];

/** Routes in the sitemap, most important first. */
export const ROUTES = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.8 },
  { path: "/list", changeFrequency: "monthly", priority: 0.5 },
];
