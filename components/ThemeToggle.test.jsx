import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";

import ThemeToggle from "./ThemeToggle";

const systemPrefers = (scheme) => {
  window.matchMedia = (query) => ({
    matches: query.includes("prefers-color-scheme: dark") && scheme === "dark",
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
};

beforeEach(() => {
  window.localStorage.clear();
  delete document.documentElement.dataset.theme;
  systemPrefers("light");
});

it("starts from the system setting when nothing has been chosen", async () => {
  systemPrefers("dark");
  render(<ThemeToggle />);

  expect(await screen.findByRole("button", { name: "Light paper" })).toBeInTheDocument();
  expect(document.documentElement.dataset.theme).toBe("dark");
});

it("starts from the stored choice when there is one, system setting or not", async () => {
  systemPrefers("dark");
  window.localStorage.setItem("luckydraw-theme", "light");
  render(<ThemeToggle />);

  expect(await screen.findByRole("button", { name: "Dark paper" })).toBeInTheDocument();
  expect(document.documentElement.dataset.theme).toBe("light");
});

it("ignores a stored value that is not a theme", async () => {
  window.localStorage.setItem("luckydraw-theme", "sepia");
  render(<ThemeToggle />);

  await screen.findByRole("button");
  expect(document.documentElement.dataset.theme).toBe("light");
});

it("switches the page and remembers the choice for next time", async () => {
  const user = userEvent.setup();
  render(<ThemeToggle />);

  await user.click(await screen.findByRole("button", { name: "Dark paper" }));

  expect(document.documentElement.dataset.theme).toBe("dark");
  expect(window.localStorage.getItem("luckydraw-theme")).toBe("dark");
  expect(screen.getByRole("button", { name: "Light paper" })).toBeInTheDocument();
});

// The stored theme is only readable in the browser, so the prerendered markup
// cannot know it. Rendering a button labelled for the wrong theme would flip it
// under the reader on hydration; a placeholder holds the space instead.
it("renders no button until it knows which theme applies", () => {
  const prerendered = renderToStaticMarkup(<ThemeToggle />);

  expect(prerendered).not.toContain("<button");
  expect(prerendered).toContain('aria-hidden="true"');
});
