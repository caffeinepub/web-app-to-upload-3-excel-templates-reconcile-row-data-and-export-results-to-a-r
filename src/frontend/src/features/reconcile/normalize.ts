export function normalizeValue(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  
  const str = String(value).trim();
  return str === '' ? null : str;
}
