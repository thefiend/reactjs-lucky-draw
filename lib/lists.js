/**
 * Lists people come back to: a class register, a monthly giveaway, a team.
 *
 * Saving is opt-in and local. A saved list is written to this browser's own
 * localStorage and nowhere else — no account, no upload, nothing that leaves the
 * device. That is a change from "the list is gone when you close the tab", so the
 * pad says what saving does and offers a way to delete, and the privacy copy on
 * the site says the same.
 *
 * Every read is defensive. localStorage can be absent, blocked outright (Safari
 * with cookies denied throws on access rather than returning null), full, or hold
 * whatever an older version of this code or another tab wrote. None of that is
 * worth breaking the draw over, so a failure means "no saved lists" and, when
 * writing, an honest no.
 */

import { packJson, unpackJson } from "./base64url";
import { SITE_URL } from "./site";

const VERSION = 1;
export const STORAGE_KEY = "luckydraw.lists.v1";

/** Oldest saves fall off the end past this. */
export const MAX_LISTS = 24;

export const MAX_NAME_LENGTH = 60;

function storage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function isSaved(entry) {
  return (
    entry &&
    typeof entry.name === "string" &&
    entry.name.trim() !== "" &&
    typeof entry.text === "string"
  );
}

/** Saved lists, newest first. An empty array for every kind of failure. */
export function loadLists() {
  const store = storage();
  if (!store) return [];

  try {
    const parsed = JSON.parse(store.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSaved).slice(0, MAX_LISTS);
  } catch {
    return [];
  }
}

function write(lists) {
  const store = storage();
  if (!store) return null;

  try {
    store.setItem(STORAGE_KEY, JSON.stringify(lists));
    return lists;
  } catch {
    // Out of quota, or a browser that pretends to have localStorage and refuses
    // to write to it. Either way the caller has to tell the user.
    return null;
  }
}

/**
 * Save a list under a name, replacing any earlier save with that name. Returns
 * the new set of lists, or null if this browser would not store it.
 */
export function saveList(name, text, savedAt = new Date().toISOString()) {
  const label = String(name ?? "").trim().slice(0, MAX_NAME_LENGTH);
  if (!label) return null;

  const kept = loadLists().filter((entry) => entry.name !== label);
  return write([{ name: label, text: String(text ?? ""), savedAt }, ...kept].slice(0, MAX_LISTS));
}

/** Forget one saved list. Returns what is left, or null if nothing could be written. */
export function deleteList(name) {
  const remaining = loadLists().filter((entry) => entry.name !== name);
  return write(remaining);
}

/**
 * A link that carries a list in its fragment, for handing a register to a
 * colleague or moving one between devices. Like a draw certificate, the fragment
 * never reaches a server — but it does contain the names, which is the point and
 * worth saying before someone posts one publicly.
 */
export function listUrl(name, text) {
  return `${SITE_URL}/#list=${packJson({ v: VERSION, n: String(name ?? ""), t: String(text ?? "") })}`;
}

/** Read a shared list back. Null on anything malformed. */
export function decodeListLink(input) {
  const { v, n: name, t: text } = unpackJson(input, "list=") ?? {};
  if (v !== VERSION || typeof text !== "string" || text.trim() === "") return null;

  return {
    name: typeof name === "string" ? name.slice(0, MAX_NAME_LENGTH) : "",
    text,
  };
}
