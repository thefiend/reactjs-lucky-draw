import {
  generateSeed,
  hashEntries,
  normaliseEntries,
  runDraw,
  serialFor,
  verifyDraw,
} from "./draw";

const NAMES = [
  "Ada Lovelace",
  "Grace Hopper",
  "Katherine Johnson",
  "Alan Turing",
  "Radia Perlman",
];

describe("normaliseEntries", () => {
  it("trims lines and drops blanks", () => {
    expect(normaliseEntries("  Ada  \n\n Grace\n   \n")).toEqual(["Ada", "Grace"]);
  });

  it("keeps duplicate names as separate chances", () => {
    expect(normaliseEntries("Ada\nAda")).toEqual(["Ada", "Ada"]);
  });

  it("accepts an array as well as pasted text", () => {
    expect(normaliseEntries([" Ada ", ""])).toEqual(["Ada"]);
  });
});

describe("generateSeed", () => {
  it("returns 16 bytes of hex", () => {
    expect(generateSeed()).toMatch(/^[0-9a-f]{32}$/);
  });

  it("does not repeat", () => {
    const seeds = new Set(Array.from({ length: 50 }, generateSeed));
    expect(seeds.size).toBe(50);
  });
});

describe("runDraw", () => {
  it("is reproducible from the list and the seed", async () => {
    const first = await runDraw({ entries: NAMES, seed: "a1b2c3", count: 3 });
    const second = await runDraw({ entries: NAMES, seed: "a1b2c3", count: 3 });
    expect(second.winners).toEqual(first.winners);
    expect(second.serial).toBe(first.serial);
  });

  it("gives a different result for a different seed", async () => {
    const a = await runDraw({ entries: NAMES, seed: "seed-one", count: 5 });
    const b = await runDraw({ entries: NAMES, seed: "seed-two", count: 5 });
    expect(b.winners.map((w) => w.name)).not.toEqual(a.winners.map((w) => w.name));
  });

  it("numbers winners in draw order without repeating an entry", async () => {
    const { winners } = await runDraw({ entries: NAMES, count: 5 });
    expect(winners.map((w) => w.position)).toEqual([1, 2, 3, 4, 5]);
    expect(new Set(winners.map((w) => w.name)).size).toBe(5);
  });

  it("draws every entry when asked for more winners than there are entries", async () => {
    const { winners } = await runDraw({ entries: ["Ada", "Grace"], count: 9 });
    expect(winners).toHaveLength(2);
  });

  it("reports the list it drew from", async () => {
    const result = await runDraw({ entries: "Ada\n\nGrace\n" });
    expect(result.entryCount).toBe(2);
    expect(result.listHash).toBe(await hashEntries(["Ada", "Grace"]));
  });

  it("refuses to draw from an empty list", async () => {
    await expect(runDraw({ entries: "   \n\n" })).rejects.toThrow(
      "Add at least one entry"
    );
  });

  it("can pick a duplicated name twice, because those are two entries", async () => {
    const { winners } = await runDraw({ entries: ["Ada", "Ada"], count: 2 });
    expect(winners.map((w) => w.name)).toEqual(["Ada", "Ada"]);
  });

  it("does not favour any position in the list", async () => {
    const pool = ["a", "b", "c", "d"];
    const wins = { a: 0, b: 0, c: 0, d: 0 };
    for (let run = 0; run < 400; run += 1) {
      const { winners } = await runDraw({ entries: pool, seed: `run-${run}` });
      wins[winners[0].name] += 1;
    }
    // 400 draws over 4 entries: 100 each in expectation. A biased shuffle (a
    // modulo with no rejection sampling, or an off-by-one range) shows up here
    // as one entry far outside this band.
    Object.values(wins).forEach((count) => {
      expect(count).toBeGreaterThan(60);
      expect(count).toBeLessThan(140);
    });
  });
});

describe("serialFor", () => {
  it("formats as two groups of four uppercase hex characters", async () => {
    expect(await serialFor("seed", "hash")).toMatch(/^[0-9A-F]{4}-[0-9A-F]{4}$/);
  });

  it("changes when the list changes, even on the same seed", async () => {
    const a = await serialFor("seed", await hashEntries(["Ada"]));
    const b = await serialFor("seed", await hashEntries(["Grace"]));
    expect(a).not.toBe(b);
  });
});

describe("verifyDraw", () => {
  it("confirms a draw from its own record", async () => {
    const result = await runDraw({ entries: NAMES, count: 2 });
    await expect(
      verifyDraw({ entries: NAMES, seed: result.seed, winners: result.winners })
    ).resolves.toBe(true);
  });

  it("rejects a swapped winner", async () => {
    const result = await runDraw({ entries: NAMES, count: 2 });
    const tampered = [
      { ...result.winners[0], name: "Mallory" },
      result.winners[1],
    ];
    await expect(
      verifyDraw({ entries: NAMES, seed: result.seed, winners: tampered })
    ).resolves.toBe(false);
  });

  it("rejects winners reported in the wrong order", async () => {
    const result = await runDraw({ entries: NAMES, count: 2 });
    const reordered = [
      { position: 1, name: result.winners[1].name },
      { position: 2, name: result.winners[0].name },
    ];
    await expect(
      verifyDraw({ entries: NAMES, seed: result.seed, winners: reordered })
    ).resolves.toBe(false);
  });

  it("rejects a draw replayed against a different list", async () => {
    const result = await runDraw({ entries: NAMES, count: 2 });
    await expect(
      verifyDraw({
        entries: [...NAMES, "Mallory"],
        seed: result.seed,
        winners: result.winners,
      })
    ).resolves.toBe(false);
  });
});
