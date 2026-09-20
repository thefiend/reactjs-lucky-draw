/**
 * The draw engine.
 *
 * Every draw is reproducible from two public values: the list of entries and a
 * seed. The seed comes from the platform CSPRNG at draw time, is shown to the
 * user, and is the only source of randomness — so anybody holding the seed and
 * the list can recompute the winners and confirm nothing was steered. That is
 * what `verifyDraw` does, and what the /fairness page walks through.
 *
 * Runs unchanged in the browser and in Node (both expose Web Crypto).
 */

const SEED_BYTES = 16;
const encoder = new TextEncoder();

function subtle() {
  const { crypto } = globalThis;
  if (!crypto?.subtle) {
    throw new Error("Web Crypto is unavailable, so draws cannot be verified");
  }
  return crypto.subtle;
}

function toHex(bytes) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** A fresh seed. The only place randomness enters a draw. */
export function generateSeed() {
  const bytes = new Uint8Array(SEED_BYTES);
  globalThis.crypto.getRandomValues(bytes);
  return toHex(bytes);
}

async function sha256Hex(input) {
  const digest = await subtle().digest("SHA-256", encoder.encode(input));
  return toHex(new Uint8Array(digest));
}

/**
 * Normalise entries the way the draw sees them: trimmed, blanks dropped.
 * Duplicates are kept — two people can share a name and each deserves a slot.
 */
export function normaliseEntries(entries) {
  const list = Array.isArray(entries) ? entries : String(entries ?? "").split("\n");
  return list.map((entry) => String(entry).trim()).filter(Boolean);
}

/** Fingerprint of the exact list a draw ran against. */
export function hashEntries(entries) {
  return sha256Hex(normaliseEntries(entries).join("\n"));
}

/**
 * Deterministic keystream: sha256(seed:counter) chunked into uint32s.
 * Rejection sampling keeps the mapping onto 0..bound-1 uniform — taking a
 * modulo instead would bias the low indices, which is exactly the kind of quiet
 * unfairness the proof is meant to rule out.
 */
async function createRandomInt(seed) {
  let counter = 0;
  let buffer = new DataView(new ArrayBuffer(0));
  let offset = 0;

  async function nextUint32() {
    if (offset + 4 > buffer.byteLength) {
      const digest = await subtle().digest("SHA-256", encoder.encode(`${seed}:${counter}`));
      buffer = new DataView(digest);
      offset = 0;
      counter += 1;
    }
    const value = buffer.getUint32(offset);
    offset += 4;
    return value;
  }

  return async function randomInt(bound) {
    const limit = Math.floor(0x100000000 / bound) * bound;
    let value = await nextUint32();
    while (value >= limit) {
      value = await nextUint32();
    }
    return value % bound;
  };
}

/**
 * Pick `count` distinct entries, in draw order.
 *
 * Partial Fisher-Yates: position 1 is drawn from the whole list, position 2
 * from what is left, and so on, so no entry can win twice in one draw.
 */
export async function runDraw({ entries, seed = generateSeed(), count = 1 }) {
  const pool = normaliseEntries(entries);
  if (pool.length === 0) {
    throw new Error("Add at least one entry before drawing");
  }

  const picks = Math.min(Math.max(1, Math.trunc(count)), pool.length);
  const randomInt = await createRandomInt(seed);
  const shuffling = pool.slice();
  const winners = [];

  for (let position = 0; position < picks; position += 1) {
    const remaining = shuffling.length - position;
    const chosen = position + (await randomInt(remaining));
    [shuffling[position], shuffling[chosen]] = [shuffling[chosen], shuffling[position]];
    winners.push({ position: position + 1, name: shuffling[position] });
  }

  const listHash = await hashEntries(pool);

  return {
    winners,
    seed,
    listHash,
    entryCount: pool.length,
    serial: await serialFor(seed, listHash),
  };
}

/** Human-quotable draw reference, e.g. `A7F2-3C91`. Derived, never stored. */
export async function serialFor(seed, listHash) {
  const digest = await sha256Hex(`${seed}/${listHash}`);
  const slug = digest.slice(0, 8).toUpperCase();
  return `${slug.slice(0, 4)}-${slug.slice(4)}`;
}

/**
 * Recompute a draw from its public record. True only if the same list and seed
 * produce exactly the same winners in the same order.
 */
export async function verifyDraw({ entries, seed, winners }) {
  const expected = await runDraw({ entries, seed, count: winners.length });
  return (
    expected.winners.length === winners.length &&
    expected.winners.every(
      (winner, index) =>
        winner.name === winners[index].name && winner.position === winners[index].position
    )
  );
}
