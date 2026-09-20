require("@testing-library/jest-dom");

// jsdom ships no matchMedia. Components read it to honour prefers-reduced-motion.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}

// jsdom leaves out two web globals that every real browser has and the draw
// engine relies on: TextEncoder, and `crypto.subtle` for SHA-256.
const { TextDecoder, TextEncoder } = require("node:util");
const { webcrypto } = require("node:crypto");

globalThis.TextEncoder ??= TextEncoder;
globalThis.TextDecoder ??= TextDecoder;

if (!globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, "crypto", {
    value: webcrypto,
    configurable: true,
  });
}
