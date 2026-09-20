"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "luckydraw-theme";

/**
 * The page already follows the operating system through
 * `prefers-color-scheme`; this is the manual override for someone whose system
 * setting is wrong for the room they are presenting in.
 *
 * Renders nothing until mounted, because the server has no way to know which
 * theme is stored locally and a wrong first paint would flip under the reader.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const system = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    setTheme(stored === "dark" || stored === "light" ? stored : system);
  }, []);

  useEffect(() => {
    if (!theme) return;
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  if (!theme) {
    return <span className="ms-auto h-8 w-24" aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="ms-auto border border-rule px-2.5 py-1 text-sm hover:border-marigold"
    >
      {theme === "dark" ? "Light paper" : "Dark paper"}
    </button>
  );
}
