import { render, screen, within } from "@testing-library/react";

import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";
import { NAV_LINKS, SITE_NAME } from "../lib/site";

beforeEach(() => {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
});

// Every nav entry is an internal crawlable link. A route that exists but is
// linked from nowhere gets crawled late and ranked worse, so the two navs are
// driven from ROUTES' sibling list rather than hand-written per component.
it.each([
  ["header", SiteHeader, "Main"],
  ["footer", SiteFooter, "Footer"],
])("the %s links to every page in the nav", (_, Component, label) => {
  render(<Component />);
  const nav = screen.getByRole("navigation", { name: label });

  NAV_LINKS.forEach((link) => {
    expect(within(nav).getByRole("link", { name: link.label })).toHaveAttribute(
      "href",
      link.href
    );
  });
});

it("puts the site name in the header as a link home", () => {
  render(<SiteHeader />);

  expect(screen.getByRole("link", { name: SITE_NAME })).toHaveAttribute("href", "/");
});

it("repeats the privacy claim in the footer, where it is checkable", () => {
  render(<SiteFooter />);

  expect(screen.getByText(/Nothing you paste leaves the page/)).toBeInTheDocument();
});
