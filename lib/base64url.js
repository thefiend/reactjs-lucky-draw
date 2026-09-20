/**
 * base64url, the encoding everything that rides in a URL fragment uses.
 *
 * Shared by draw certificates and shared lists: both pack JSON into a fragment,
 * and a fragment has to survive being pasted into a chat window, so `+`, `/` and
 * `=` are out.
 */

const decoder = new TextDecoder();
const encoder = new TextEncoder();

export function toBase64Url(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function fromBase64Url(text) {
  const padded = text.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

/** Pack an object into a fragment payload. */
export function packJson(value) {
  return toBase64Url(encoder.encode(JSON.stringify(value)));
}

/**
 * Unpack a fragment payload. Accepts a full URL, a bare `#fragment`, or the
 * payload on its own, because people paste all three. Returns null rather than
 * throwing: a link truncated by an email client is the common case, not an
 * exceptional one.
 */
export function unpackJson(input, prefix = "") {
  const text = String(input ?? "");
  let payload = text.includes("#") ? text.slice(text.indexOf("#") + 1) : text;
  if (prefix) {
    if (!payload.startsWith(prefix)) return null;
    payload = payload.slice(prefix.length);
  }
  if (!payload) return null;

  try {
    return JSON.parse(decoder.decode(fromBase64Url(payload)));
  } catch {
    return null;
  }
}
