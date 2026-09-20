import {
  MAX_LISTS,
  STORAGE_KEY,
  decodeListLink,
  deleteList,
  listUrl,
  loadLists,
  saveList,
} from "./lists";
import { SITE_URL } from "./site";

const REGISTER = "Ada Lovelace\nGrace Hopper";

beforeEach(() => {
  window.localStorage.clear();
});

describe("saving a list", () => {
  it("keeps it under the name it was given", () => {
    saveList("Form 4B", REGISTER);
    expect(loadLists()).toEqual([
      { name: "Form 4B", text: REGISTER, savedAt: expect.any(String) },
    ]);
  });

  it("puts the most recent save first", () => {
    saveList("Form 4B", REGISTER);
    saveList("Monthly giveaway", "@ada_l");
    expect(loadLists().map((entry) => entry.name)).toEqual([
      "Monthly giveaway",
      "Form 4B",
    ]);
  });

  it("replaces an earlier save under the same name rather than piling up", () => {
    saveList("Form 4B", REGISTER);
    saveList("Form 4B", `${REGISTER}\nKatherine Johnson`);

    const lists = loadLists();
    expect(lists).toHaveLength(1);
    expect(lists[0].text).toContain("Katherine Johnson");
  });

  it("trims the name and refuses an empty one", () => {
    expect(saveList("   ", REGISTER)).toBeNull();
    saveList("  Form 4B  ", REGISTER);
    expect(loadLists()[0].name).toBe("Form 4B");
  });

  it("drops the oldest once there are too many", () => {
    for (let index = 0; index <= MAX_LISTS; index += 1) {
      saveList(`List ${index}`, REGISTER);
    }

    const lists = loadLists();
    expect(lists).toHaveLength(MAX_LISTS);
    expect(lists.map((entry) => entry.name)).not.toContain("List 0");
  });

  it("says no when the browser will not store anything", () => {
    // jsdom's localStorage is a proxy, so the spy has to go on the prototype.
    const setItem = jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    expect(saveList("Form 4B", REGISTER)).toBeNull();
    setItem.mockRestore();
  });
});

describe("reading what is stored", () => {
  it("has nothing to show before anything is saved", () => {
    expect(loadLists()).toEqual([]);
  });

  it("ignores stored junk instead of breaking the page", () => {
    window.localStorage.setItem(STORAGE_KEY, "not json at all");
    expect(loadLists()).toEqual([]);

    window.localStorage.setItem(STORAGE_KEY, '{"name":"Form 4B"}');
    expect(loadLists()).toEqual([]);

    window.localStorage.setItem(STORAGE_KEY, '[{"name":"Form 4B"},{"nope":1}]');
    expect(loadLists()).toEqual([]);
  });
});

describe("deleting a list", () => {
  it("leaves the others alone", () => {
    saveList("Form 4B", REGISTER);
    saveList("Monthly giveaway", "@ada_l");

    deleteList("Form 4B");
    expect(loadLists().map((entry) => entry.name)).toEqual(["Monthly giveaway"]);
  });

  it("does nothing for a name that was never saved", () => {
    saveList("Form 4B", REGISTER);
    deleteList("Form 9Z");
    expect(loadLists()).toHaveLength(1);
  });
});

describe("a shared list link", () => {
  it("carries the list in the fragment, where no server sees it", () => {
    const url = listUrl("Form 4B", REGISTER);
    expect(url.startsWith(`${SITE_URL}/#list=`)).toBe(true);
    expect(decodeListLink(url)).toEqual({ name: "Form 4B", text: REGISTER });
  });

  it("survives non-ASCII names", () => {
    const text = "小明\nJosé\nЖанна";
    expect(decodeListLink(listUrl("班級", text))).toEqual({ name: "班級", text });
  });

  it("reads a bare fragment as well as a whole URL", () => {
    const fragment = listUrl("Form 4B", REGISTER).split("#")[1];
    expect(decodeListLink(`#${fragment}`).text).toBe(REGISTER);
  });

  it("turns down anything that is not a list link", () => {
    expect(decodeListLink("")).toBeNull();
    expect(decodeListLink("#method")).toBeNull();
    expect(decodeListLink(`${SITE_URL}/#list=notbase64url!!`)).toBeNull();
    expect(decodeListLink(listUrl("Form 4B", REGISTER).slice(0, 40))).toBeNull();
    expect(decodeListLink(listUrl("Empty", "   "))).toBeNull();
  });
});
