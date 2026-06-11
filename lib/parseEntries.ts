export interface ParsedEntry {
  name: string;
  weight: number;
}

const WEIGHT_REGEX = /^(.+?)\s+x(\d+)$/i;

export function parseEntries(text: string): ParsedEntry[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(WEIGHT_REGEX);
      if (match) {
        const weight = parseInt(match[2], 10);
        return { name: match[1].trim(), weight: Math.min(weight > 0 ? weight : 1, 100) };
      }
      return { name: line, weight: 1 };
    });
}

export function expandPool(entries: ParsedEntry[]): string[] {
  return entries.flatMap(({ name, weight }) => Array(weight).fill(name) as string[]);
}
