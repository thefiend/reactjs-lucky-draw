import { certificateUrl, decodeCertificate, encodeCertificate } from "./certificate";
import { runDraw, verifyDraw } from "./draw";
import { SITE_URL } from "./site";

const ENTRIES = ["Ada Lovelace", "Grace Hopper", "Katherine Johnson", "Alan Turing"];
const SEED = "0123456789abcdef0123456789abcdef";

const certificate = () => ({
  seed: SEED,
  entries: ENTRIES,
  winners: [
    { position: 1, name: "Grace Hopper" },
    { position: 2, name: "Alan Turing" },
  ],
});

it("survives a round trip", () => {
  expect(decodeCertificate(encodeCertificate(certificate()))).toEqual(certificate());
});

it("accepts a whole URL, a bare fragment, or the payload alone", () => {
  const payload = encodeCertificate(certificate());
  const forms = [payload, `#${payload}`, `${SITE_URL}/verify#${payload}`];

  forms.forEach((form) => expect(decodeCertificate(form)).toEqual(certificate()));
});

it("keeps names that need more than ASCII intact", () => {
  const entries = ["Zoë Washburne", "陈伟", "Müller & Sons", "🎟 ticket 3"];
  const decoded = decodeCertificate(
    encodeCertificate({ seed: SEED, entries, winners: ["陈伟"] })
  );

  expect(decoded.entries).toEqual(entries);
  expect(decoded.winners).toEqual([{ position: 1, name: "陈伟" }]);
});

it("numbers the winners by their place in the list, so draw order survives", () => {
  const decoded = decodeCertificate(
    encodeCertificate({ seed: SEED, entries: ENTRIES, winners: ["Alan Turing", "Ada Lovelace"] })
  );

  expect(decoded.winners).toEqual([
    { position: 1, name: "Alan Turing" },
    { position: 2, name: "Ada Lovelace" },
  ]);
});

// A link truncated by an email client is the normal failure, so the page needs a
// null to report rather than an exception to survive.
describe("refuses anything that is not a certificate", () => {
  const rejected = {
    "an empty fragment": "#",
    "nothing at all": "",
    "undefined": undefined,
    "text that is not base64": "#not a certificate!",
    "base64 that is not JSON": `#${btoa("plain text")}`,
    "a truncated payload": encodeCertificate(certificate()).slice(0, 20),
  };

  Object.entries(rejected).forEach(([description, input]) => {
    it(description, () => expect(decodeCertificate(input)).toBeNull());
  });

  const malformed = {
    "an unknown version": { v: 99, s: SEED, e: ENTRIES, w: ["Ada Lovelace"] },
    "a seed of the wrong length": { v: 1, s: "abc123", e: ENTRIES, w: ["Ada Lovelace"] },
    "a seed that is not hex": { v: 1, s: "z".repeat(32), e: ENTRIES, w: ["Ada Lovelace"] },
    "no entries": { v: 1, s: SEED, e: [], w: ["Ada Lovelace"] },
    "no winners": { v: 1, s: SEED, e: ENTRIES, w: [] },
    "more winners than entries": { v: 1, s: SEED, e: ["Solo"], w: ["Solo", "Solo"] },
    "entries that are not strings": { v: 1, s: SEED, e: [{ name: "Ada" }], w: ["Ada"] },
  };

  Object.entries(malformed).forEach(([description, payload]) => {
    it(description, () => {
      const fragment = btoa(JSON.stringify(payload)).replace(/=+$/, "");
      expect(decodeCertificate(fragment)).toBeNull();
    });
  });
});

describe("the shareable link", () => {
  it("points at the verifier on the canonical host, with the draw in the fragment", async () => {
    const result = await runDraw({ entries: ENTRIES, seed: SEED, count: 2 });
    const link = certificateUrl(result, ENTRIES);

    expect(link.startsWith(`${SITE_URL}/verify#`)).toBe(true);
    // The fragment is the whole point: it is not sent to the server, so sharing
    // a draw does not upload the entrants' names.
    expect(new URL(link).search).toBe("");
  });

  it("carries everything a sceptic needs to reproduce the draw", async () => {
    const result = await runDraw({ entries: ENTRIES, seed: SEED, count: 2 });
    const decoded = decodeCertificate(certificateUrl(result, ENTRIES));

    expect(decoded.seed).toBe(result.seed);
    expect(decoded.entries).toEqual(ENTRIES);
    expect(decoded.winners).toEqual(result.winners);
    expect(await verifyDraw(decoded)).toBe(true);
  });

  it("fails verification once a winner's name is edited", async () => {
    const result = await runDraw({ entries: ENTRIES, seed: SEED, count: 2 });
    const decoded = decodeCertificate(certificateUrl(result, ENTRIES));

    decoded.winners[0] = { position: 1, name: "Somebody Else" };
    expect(await verifyDraw(decoded)).toBe(false);
  });

  // Renaming an entry that did not win leaves the winners untouched: the shuffle
  // picks indices, and an index it never landed on can hold any name. So
  // recomputing the winners is not on its own a check that the list is
  // unaltered — the serial is, because it is derived from the list hash. This is
  // why the verifier shows the serial it recomputed and asks for a comparison
  // against the one announced at the time.
  it("keeps the winners but changes the serial when a non-winner is edited", async () => {
    const result = await runDraw({ entries: ENTRIES, seed: SEED, count: 2 });
    const decoded = decodeCertificate(certificateUrl(result, ENTRIES));
    const won = new Set(result.winners.map((winner) => winner.name));
    const untouched = decoded.entries.findIndex((entry) => !won.has(entry));

    decoded.entries[untouched] = `${decoded.entries[untouched]} (withdrawn)`;
    const recomputed = await runDraw({
      entries: decoded.entries,
      seed: decoded.seed,
      count: decoded.winners.length,
    });

    expect(await verifyDraw(decoded)).toBe(true);
    expect(recomputed.serial).not.toBe(result.serial);
    expect(recomputed.listHash).not.toBe(result.listHash);
  });
});
