"use client";

import { useCallback, useEffect, useState } from "react";

import { parseEntries } from "../lib/entries";
import { MAX_NAME_LENGTH, deleteList, listUrl, loadLists, saveList } from "../lib/lists";

const ACTION = "border border-rule px-2 py-1 hover:border-marigold";

export default function SavedLists({ text, suggestedName = "", onLoad }) {
  const [lists, setLists] = useState([]);
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(null);
  const [blocked, setBlocked] = useState(false);

  // Storage is read after mount: the server has no localStorage, and starting
  // from an empty list on both sides keeps the markup identical either way.
  useEffect(() => {
    setLists(loadLists());
  }, []);

  useEffect(() => {
    if (suggestedName) setName(suggestedName);
  }, [suggestedName]);

  const save = useCallback(() => {
    const saved = saveList(name, text);
    if (!saved) {
      setBlocked(Boolean(name.trim()));
      return;
    }
    setLists(saved);
    setBlocked(false);
    setCopied(null);
  }, [name, text]);

  const forget = useCallback((listName) => {
    const remaining = deleteList(listName);
    if (remaining) setLists(remaining);
  }, []);

  const copy = useCallback(async (entry) => {
    await navigator.clipboard.writeText(listUrl(entry.name, entry.text));
    setCopied(entry.name);
  }, []);

  return (
    <div className="mt-8 border-t border-rule pt-4">
      <h3 className="font-display text-lg">Saved lists</h3>
      <p className="mt-1 max-w-[60ch] text-sm text-slate">
        A list you save stays in this browser and nowhere else — no account, nothing
        uploaded. Clearing your browser data removes it, as does Forget below.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <label htmlFor="list-name" className="sr-only">
          Name for this list
        </label>
        <input
          id="list-name"
          value={name}
          maxLength={MAX_NAME_LENGTH}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            // Enter inside the draw form would otherwise run a draw.
            if (event.key !== "Enter") return;
            event.preventDefault();
            save();
          }}
          placeholder="Form 4B, October giveaway…"
          className="paper w-48 px-2 py-1"
        />
        <button type="button" onClick={save} disabled={!name.trim()} className={ACTION}>
          Save this list
        </button>
      </div>

      {blocked && (
        <p role="alert" className="mt-2 text-sm text-stamp">
          This browser is not letting the page store anything, so the list cannot be
          kept here. A link keeps it instead.
        </p>
      )}

      {lists.length === 0 ? (
        <p className="mt-3 text-sm text-slate">
          Nothing saved yet. Name a list to keep it for next time.
        </p>
      ) : (
        <ul className="mt-3 text-sm">
          {lists.map((entry) => {
            const count = parseEntries(entry.text).entries.length;
            return (
              <li
                key={entry.name}
                className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-rule py-2"
              >
                <button
                  type="button"
                  onClick={() => onLoad(entry.text)}
                  className="underline hover:text-marigold"
                >
                  {entry.name}
                </button>
                <span className="font-mono text-xs text-slate">
                  {count} {count === 1 ? "chance" : "chances"}
                </span>
                <span className="ml-auto flex gap-2">
                  <button
                    type="button"
                    onClick={() => copy(entry)}
                    className={ACTION}
                    aria-label={`Copy a link to ${entry.name}`}
                  >
                    {copied === entry.name ? "Link copied" : "Copy link"}
                  </button>
                  <button
                    type="button"
                    onClick={() => forget(entry.name)}
                    className={ACTION}
                    aria-label={`Forget ${entry.name}`}
                  >
                    Forget
                  </button>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
