import {
  MAX_CHANCES,
  hasHandles,
  keepHandles,
  oddsFor,
  parseEntries,
} from "./entries";

const names = (text, options) => parseEntries(text, options).entries;

describe("a plain list", () => {
  it("takes one name per line", () => {
    expect(names("Ada\nGrace\nKatherine")).toEqual(["Ada", "Grace", "Katherine"]);
  });

  it("drops blank lines and surrounding spaces", () => {
    expect(names("  Ada  \n\n\n Grace\n")).toEqual(["Ada", "Grace"]);
  });

  it("keeps a repeated name, because that is how people weight a draw", () => {
    const list = parseEntries("Ada\nGrace\nAda");
    expect(list.entries).toEqual(["Ada", "Grace", "Ada"]);
    expect(list.duplicates).toBe(1);
    expect(list.names).toEqual([
      { name: "Ada", chances: 2 },
      { name: "Grace", chances: 1 },
    ]);
  });

  it("collapses repeats when asked to", () => {
    expect(names("Ada\nGrace\nAda", { dedupe: true })).toEqual(["Ada", "Grace"]);
  });

  it("reads nothing out of nothing", () => {
    expect(parseEntries("")).toMatchObject({ entries: [], names: [], lineCount: 0 });
    expect(parseEntries(null).entries).toEqual([]);
  });
});

describe("a pasted list", () => {
  it("strips numbering from a numbered list", () => {
    expect(names("1. Ada\n2. Grace\n10) Katherine")).toEqual([
      "Ada",
      "Grace",
      "Katherine",
    ]);
  });

  it("strips bullets", () => {
    expect(names("- Ada\n• Grace\n– Katherine")).toEqual(["Ada", "Grace", "Katherine"]);
  });

  it("leaves a name that merely starts with a number alone", () => {
    expect(names("42\n3.14\nStudio 54")).toEqual(["42", "3.14", "Studio 54"]);
  });

  it("takes the first cell of a spreadsheet column", () => {
    expect(names("Ada\tada@example.com\t3\nGrace\tgrace@example.com\t1")).toEqual([
      "Ada",
      "Grace",
    ]);
  });

  it("splits a single line of comma-separated names", () => {
    expect(names("Ada, Grace, Katherine")).toEqual(["Ada", "Grace", "Katherine"]);
  });

  // `Smith, John` on its own line is one person. Splitting every comma would
  // turn a list of 30 people into 60 half-people.
  it("leaves commas alone once there is more than one line", () => {
    expect(names("Smith, John\nHopper, Grace")).toEqual([
      "Smith, John",
      "Hopper, Grace",
    ]);
  });

  it("unwraps quoted names", () => {
    expect(names('"Ada"\n“Grace”')).toEqual(["Ada", "Grace"]);
  });

  it("squashes runs of spaces inside a name", () => {
    expect(names("Ada    Lovelace")).toEqual(["Ada Lovelace"]);
  });
});

describe("extra chances", () => {
  it("reads x3 as three chances", () => {
    const list = parseEntries("Ada x3\nGrace");
    expect(list.entries).toEqual(["Ada", "Ada", "Ada", "Grace"]);
    expect(list.weighted).toBe(true);
  });

  it("accepts × and * as well", () => {
    expect(names("Ada ×2\nGrace*2")).toEqual(["Ada", "Ada", "Grace", "Grace"]);
  });

  it("adds up chances when the same name appears twice", () => {
    expect(parseEntries("Ada x2\nAda x3").names).toEqual([{ name: "Ada", chances: 5 }]);
  });

  it("leaves a trailing number that is not a weight alone", () => {
    expect(names("Room 12\nMalcolm X")).toEqual(["Room 12", "Malcolm X"]);
  });

  it("treats a bare weight as the entry itself", () => {
    expect(names("x3")).toEqual(["x3"]);
  });

  it("caps a single line so one typo cannot hang the page", () => {
    expect(parseEntries("Ada x9999").entries).toHaveLength(MAX_CHANCES);
  });

  it("can be switched off for lists whose names really do end in x2", () => {
    const list = parseEntries("Ada x3", { weights: false });
    expect(list.entries).toEqual(["Ada x3"]);
    expect(list.weighted).toBe(false);
  });
});

describe("odds", () => {
  it("reports each name's share, heaviest first", () => {
    expect(oddsFor(parseEntries("Ada\nGrace x3"))).toEqual([
      { name: "Grace", chances: 3, share: 0.75 },
      { name: "Ada", chances: 1, share: 0.25 },
    ]);
  });

  it("has nothing to report for an empty list", () => {
    expect(oddsFor(parseEntries(""))).toEqual([]);
  });
});

describe("comment threads", () => {
  const THREAD = [
    "@ada_l Count me in! 🎉",
    "@grace.hopper me me me",
    "@ada_l commenting again for luck",
    "no handle on this one",
  ].join("\n");

  it("keeps the handles, first mention only", () => {
    expect(keepHandles(THREAD)).toEqual(["@ada_l", "@grace.hopper"]);
  });

  it("matches handles case-insensitively when deduplicating", () => {
    expect(keepHandles("@Ada\n@ada")).toEqual(["@Ada"]);
  });

  it("knows when there is nothing to pull out", () => {
    expect(hasHandles("Ada\nGrace")).toBe(false);
    expect(hasHandles(THREAD)).toBe(true);
  });
});
