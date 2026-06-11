import { parseEntries, expandPool } from '@/lib/parseEntries';

describe('parseEntries', () => {
  it('parses plain names with weight 1', () => {
    expect(parseEntries('Alice\nBob')).toEqual([
      { name: 'Alice', weight: 1 },
      { name: 'Bob', weight: 1 },
    ]);
  });

  it('parses weighted entries with x syntax', () => {
    expect(parseEntries('Alice x3')).toEqual([{ name: 'Alice', weight: 3 }]);
  });

  it('is case-insensitive for x syntax', () => {
    expect(parseEntries('Alice X2')).toEqual([{ name: 'Alice', weight: 2 }]);
  });

  it('trims whitespace from names', () => {
    expect(parseEntries('  Alice  \n  Bob  ')).toEqual([
      { name: 'Alice', weight: 1 },
      { name: 'Bob', weight: 1 },
    ]);
  });

  it('filters empty lines', () => {
    expect(parseEntries('Alice\n\nBob\n')).toEqual([
      { name: 'Alice', weight: 1 },
      { name: 'Bob', weight: 1 },
    ]);
  });

  it('treats "Name x0" as weight 1', () => {
    expect(parseEntries('Alice x0')).toEqual([{ name: 'Alice', weight: 1 }]);
  });

  it('caps weight at 100', () => {
    expect(parseEntries('Alice x999')).toEqual([{ name: 'Alice', weight: 100 }]);
  });

  it('returns empty array for empty string', () => {
    expect(parseEntries('')).toEqual([]);
  });
});

describe('expandPool', () => {
  it('expands weighted entries into flat array', () => {
    const parsed = [
      { name: 'Alice', weight: 3 },
      { name: 'Bob', weight: 1 },
    ];
    expect(expandPool(parsed)).toEqual(['Alice', 'Alice', 'Alice', 'Bob']);
  });

  it('returns single entry for weight 1', () => {
    expect(expandPool([{ name: 'Alice', weight: 1 }])).toEqual(['Alice']);
  });

  it('returns empty array for empty input', () => {
    expect(expandPool([])).toEqual([]);
  });
});
