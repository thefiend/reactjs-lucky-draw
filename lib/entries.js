/**
 * Turning what people paste into a list the draw can run on.
 *
 * Almost nobody arrives with one clean name per line. They paste a numbered
 * list, a column out of Sheets, a row of comma-separated names, or a wall of
 * Instagram comments. Making them tidy that by hand is the tool's job, not
 * theirs.
 *
 * Everything here happens *before* the draw engine sees anything. The expanded
 * list this returns is what gets shuffled and what gets fingerprinted, so the
 * published hash covers exactly the entries that were in play — including the
 * extra chances.
 */

// `Ada x3`, `Ada ×3`, `Ada *3`. A trailing number needs one of those markers
// before it, so `Unit 4` and `Studio 54` are names, not weights.
const WEIGHT = /[ \t]*[x×*][ \t]*(\d{1,4})$/i;

// `1.`, `2)`, `-`, `•` — list furniture from a numbered or bulleted paste. The
// trailing space is required, so `3.14` and `42` survive as names.
const MARKER = /^(?:\d{1,4}[.)\]:]|[-–—*•·])[ \t]+/;

const QUOTED = /^["“'‘](.+)["”'’]$/;

const HANDLE = /@[A-Za-z0-9._]+/g;

/** One line cannot be worth more than this many chances. */
export const MAX_CHANCES = 1000;

/** Hard ceiling on the expanded list, so a stray `x1000` cannot hang the tab. */
export const MAX_ENTRIES = 100000;

function clean(line) {
  const value = String(line).trim().replace(MARKER, "").trim();
  const quoted = value.match(QUOTED);
  return (quoted ? quoted[1] : value).replace(/[ \t]+/g, " ").trim();
}

/**
 * Split a paste into candidate lines.
 *
 * A tab means a spreadsheet: the first cell is the name and the rest is whatever
 * else was in the row. Commas only split a single line, because `Smith, John` on
 * a line of its own is one person, not two.
 */
function splitLines(text) {
  const lines = String(text ?? "")
    .split(/\r?\n/)
    .filter((line) => line.trim());

  if (lines.length === 1 && /[\t,;]/.test(lines[0])) {
    return lines[0].split(/[\t,;]+/);
  }

  return lines.map((line) => (line.includes("\t") ? line.split("\t")[0] : line));
}

function chancesFor(line, weights) {
  if (!weights) return { name: clean(line), chances: 1 };

  const match = String(line).match(WEIGHT);
  if (!match) return { name: clean(line), chances: 1 };

  const name = clean(String(line).slice(0, match.index));
  // A line that is only a weight (`x3`) is somebody's actual entry, not a
  // weight on nothing.
  if (!name) return { name: clean(line), chances: 1 };

  return { name, chances: Math.min(Math.max(1, Number(match[1])), MAX_CHANCES) };
}

/**
 * Read a pasted list.
 *
 * Returns the expanded `entries` the draw runs on, plus a `names` summary for
 * showing each entrant's odds, and enough counts to explain what was done to
 * the paste.
 */
export function parseEntries(text, { weights = true, dedupe = false } = {}) {
  const seen = new Map();
  const entries = [];
  let lineCount = 0;
  let duplicates = 0;
  let weighted = false;
  let truncated = false;

  splitLines(text).forEach((line) => {
    const { name, chances } = chancesFor(line, weights);
    if (!name) return;

    lineCount += 1;
    if (chances > 1) weighted = true;

    const already = seen.get(name);
    if (already) {
      duplicates += 1;
      if (dedupe) return;
      already.chances += chances;
    } else {
      seen.set(name, { name, chances });
    }

    for (let repeat = 0; repeat < chances; repeat += 1) {
      if (entries.length >= MAX_ENTRIES) {
        truncated = true;
        return;
      }
      entries.push(name);
    }
  });

  return {
    entries,
    names: [...seen.values()],
    lineCount,
    duplicates,
    weighted,
    truncated,
  };
}

/**
 * Drop names from a pasted list, keeping the rest — how a second round starts.
 *
 * The remaining lines come back tidied and with their weights written out, so a
 * `Grace x3` line still carries three chances into the next round. Rewriting the
 * box is the point of the button, so normalising while we are in there is honest
 * rather than surprising.
 */
export function removeNames(text, remove, { weights = true } = {}) {
  const gone = new Set(remove);

  return splitLines(text)
    .map((line) => chancesFor(line, weights))
    .filter(({ name }) => name && !gone.has(name))
    .map(({ name, chances }) => (chances > 1 ? `${name} x${chances}` : name))
    .join("\n");
}

/** Each name's share of the draw, biggest first. For showing, not for drawing. */
export function oddsFor({ entries, names }) {
  if (entries.length === 0) return [];

  return [...names]
    .sort((a, b) => b.chances - a.chances || a.name.localeCompare(b.name))
    .map((entrant) => ({
      ...entrant,
      share: entrant.chances / entries.length,
    }));
}

/**
 * Pull the @handles out of a block of comments, keeping the first mention of
 * each. Pasting an Instagram or TikTok comment thread is the single most common
 * way a giveaway list arrives.
 */
export function keepHandles(text) {
  const handles = String(text ?? "").match(HANDLE) ?? [];
  const unique = [];
  const seen = new Set();

  handles.forEach((handle) => {
    const key = handle.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    unique.push(handle);
  });

  return unique;
}

/** True when there is anything in the text that looks like a handle to keep. */
export function hasHandles(text) {
  return keepHandles(text).length > 0;
}
