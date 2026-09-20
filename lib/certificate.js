/**
 * Draw certificates: a whole draw packed into a link.
 *
 * The payload rides in the URL *fragment*, never the query string. A fragment is
 * not sent to the server, so handing someone proof of a draw does not upload the
 * entrants' names to us, to Netlify, or into any access log. It also means a
 * certificate needs no database behind it — the link is the record, and the site
 * stays a static export.
 *
 * Anyone opening the link gets the entry list, the seed and the claimed winners,
 * which is exactly what is needed to recompute the draw and disagree with it.
 */

import { SITE_URL } from "./site";

const VERSION = 1;
const SEED = /^[0-9a-f]{32}$/;

const decoder = new TextDecoder();
const encoder = new TextEncoder();

function toBase64Url(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text) {
  const padded = text.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

/** Pack a draw result into a fragment payload. */
export function encodeCertificate({ seed, entries, winners }) {
  const payload = {
    v: VERSION,
    s: seed,
    e: entries,
    w: winners.map((winner) => (typeof winner === "string" ? winner : winner.name)),
  };
  return toBase64Url(encoder.encode(JSON.stringify(payload)));
}

/**
 * Unpack a certificate. Accepts a full URL, a bare `#fragment`, or the payload
 * on its own, because people paste all three.
 *
 * Returns null rather than throwing on anything malformed: a link truncated by
 * an email client is the common case, not an exceptional one, and the page needs
 * to say so plainly instead of blowing up.
 */
export function decodeCertificate(input) {
  const text = String(input ?? "");
  const payload = text.includes("#") ? text.slice(text.indexOf("#") + 1) : text;
  if (!payload) return null;

  let parsed;
  try {
    parsed = JSON.parse(decoder.decode(fromBase64Url(payload)));
  } catch {
    return null;
  }

  const { v, s: seed, e: entries, w: winners } = parsed ?? {};
  const wellFormed =
    v === VERSION &&
    typeof seed === "string" &&
    SEED.test(seed) &&
    Array.isArray(entries) &&
    entries.length > 0 &&
    entries.every((entry) => typeof entry === "string") &&
    Array.isArray(winners) &&
    winners.length > 0 &&
    winners.length <= entries.length &&
    winners.every((winner) => typeof winner === "string");

  if (!wellFormed) return null;

  return {
    seed,
    entries,
    winners: winners.map((name, index) => ({ position: index + 1, name })),
  };
}

/** The shareable link for a draw result. */
export function certificateUrl(result, entries) {
  const fragment = encodeCertificate({
    seed: result.seed,
    entries,
    winners: result.winners,
  });
  return `${SITE_URL}/verify#${fragment}`;
}
