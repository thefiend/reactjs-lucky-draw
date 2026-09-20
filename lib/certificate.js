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

import { packJson, unpackJson } from "./base64url";
import { SITE_URL } from "./site";

const VERSION = 1;
const SEED = /^[0-9a-f]{32}$/;

/** Pack a draw result into a fragment payload. */
export function encodeCertificate({ seed, entries, winners }) {
  return packJson({
    v: VERSION,
    s: seed,
    e: entries,
    w: winners.map((winner) => (typeof winner === "string" ? winner : winner.name)),
  });
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
  const { v, s: seed, e: entries, w: winners } = unpackJson(input) ?? {};
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
