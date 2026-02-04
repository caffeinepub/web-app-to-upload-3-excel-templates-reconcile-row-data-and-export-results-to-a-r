import { normalizeValue } from './normalize';

/**
 * Determines which compare columns are mismatched across three sheets for a single invoice.
 * Returns an array of column names where values differ across any pair of sheets (A, B, or C).
 */
export function findMismatchedColumns(
  rowA: Record<string, string | null>,
  rowB: Record<string, string | null>,
  rowC: Record<string, string | null>,
  compareColumns: string[]
): string[] {
  const mismatches: string[] = [];

  compareColumns.forEach(col => {
    const vA = normalizeValue(rowA[col]);
    const vB = normalizeValue(rowB[col]);
    const vC = normalizeValue(rowC[col]);

    // Flag as mismatch if ANY pair differs (A≠B or B≠C or A≠C)
    if (vA !== vB || vB !== vC || vA !== vC) {
      mismatches.push(col);
    }
  });

  return mismatches;
}
