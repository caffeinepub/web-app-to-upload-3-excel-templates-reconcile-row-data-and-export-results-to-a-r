export function normalizeValue(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  
  const str = String(value).trim();
  return str === '' ? null : str;
}

export function buildKey(row: Record<string, string | null>, keyColumns: string[]): string {
  return keyColumns
    .map(col => normalizeValue(row[col]) || '')
    .join('|');
}
