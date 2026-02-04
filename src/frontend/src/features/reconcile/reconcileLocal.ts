import { ParsedSheet, ReconcileConfig, ReconcileResultRow, ReconciliationResults, ReconcileStatus } from './types';
import { normalizeValue } from './normalize';
import { findMismatchedColumns } from './mismatch';

export function reconcileData(
  sheetA: ParsedSheet,
  sheetB: ParsedSheet,
  sheetC: ParsedSheet,
  config: ReconcileConfig
): ReconciliationResults {
  // Determine the maximum row count across all three sheets
  const maxRowCount = Math.max(sheetA.rows.length, sheetB.rows.length, sheetC.rows.length);
  
  const results: ReconcileResultRow[] = [];
  const summary = {
    total: 0,
    matched: 0,
    mismatch: 0,
    missingInA: 0,
    missingInB: 0,
    missingInC: 0
  };
  
  // Process each row index
  for (let i = 0; i < maxRowCount; i++) {
    const rowA = sheetA.rows[i];
    const rowB = sheetB.rows[i];
    const rowC = sheetC.rows[i];
    
    const presentInA = !!rowA;
    const presentInB = !!rowB;
    const presentInC = !!rowC;
    
    // Extract values for compare columns with normalization
    const valuesA: Record<string, string | null> = {};
    const valuesB: Record<string, string | null> = {};
    const valuesC: Record<string, string | null> = {};
    
    config.compareColumns.forEach(col => {
      valuesA[col] = rowA ? normalizeValue(rowA[col]) : null;
      valuesB[col] = rowB ? normalizeValue(rowB[col]) : null;
      valuesC[col] = rowC ? normalizeValue(rowC[col]) : null;
    });
    
    // Determine status and mismatches
    let status: ReconcileStatus;
    let mismatches: string[] = [];
    
    // Check if any sheet is missing this row
    if (!presentInA) {
      status = 'Missing in A';
    } else if (!presentInB) {
      status = 'Missing in B';
    } else if (!presentInC) {
      status = 'Missing in C';
    } else {
      // All present in all three sheets, check for mismatches using shared helper
      mismatches = findMismatchedColumns(rowA, rowB, rowC, config.compareColumns);
      
      if (mismatches.length > 0) {
        status = 'Mismatch';
      } else {
        status = 'Matched';
      }
    }
    
    // Update summary counts
    summary.total++;
    if (status === 'Missing in A') {
      summary.missingInA++;
    } else if (status === 'Missing in B') {
      summary.missingInB++;
    } else if (status === 'Missing in C') {
      summary.missingInC++;
    } else if (status === 'Mismatch') {
      summary.mismatch++;
    } else if (status === 'Matched') {
      summary.matched++;
    }
    
    // Create result row with row index (1-based for display)
    results.push({
      rowIndex: i + 1,
      status,
      presentInA,
      presentInB,
      presentInC,
      valuesA,
      valuesB,
      valuesC,
      mismatches
    });
  }
  
  return {
    rows: results,
    summary,
    config,
    sheets: {
      a: sheetA,
      b: sheetB,
      c: sheetC
    }
  };
}
