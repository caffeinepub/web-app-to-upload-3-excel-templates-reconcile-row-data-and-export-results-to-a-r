import { ParsedSheet, ReconcileConfig, ReconcileResultRow, ReconciliationResults, ReconcileStatus } from './types';
import { buildKey } from './normalize';

export function reconcileData(
  sheetA: ParsedSheet,
  sheetB: ParsedSheet,
  sheetC: ParsedSheet,
  config: ReconcileConfig
): ReconciliationResults {
  // Build maps for each sheet
  const mapA = new Map<string, Record<string, string | null>[]>();
  const mapB = new Map<string, Record<string, string | null>[]>();
  const mapC = new Map<string, Record<string, string | null>[]>();
  
  // Populate maps
  sheetA.rows.forEach(row => {
    const key = buildKey(row, config.keyColumnsA);
    if (!mapA.has(key)) mapA.set(key, []);
    mapA.get(key)!.push(row);
  });
  
  sheetB.rows.forEach(row => {
    const key = buildKey(row, config.keyColumnsB);
    if (!mapB.has(key)) mapB.set(key, []);
    mapB.get(key)!.push(row);
  });
  
  sheetC.rows.forEach(row => {
    const key = buildKey(row, config.keyColumnsC);
    if (!mapC.has(key)) mapC.set(key, []);
    mapC.get(key)!.push(row);
  });
  
  // Get all unique keys
  const allKeys = new Set([...mapA.keys(), ...mapB.keys(), ...mapC.keys()]);
  
  const results: ReconcileResultRow[] = [];
  const summary = {
    total: 0,
    matched: 0,
    mismatch: 0,
    missingInA: 0,
    missingInB: 0,
    missingInC: 0,
    duplicate: 0
  };
  
  allKeys.forEach(key => {
    const rowsA = mapA.get(key) || [];
    const rowsB = mapB.get(key) || [];
    const rowsC = mapC.get(key) || [];
    
    const presentInA = rowsA.length > 0;
    const presentInB = rowsB.length > 0;
    const presentInC = rowsC.length > 0;
    
    // Check for duplicates
    const isDuplicate = rowsA.length > 1 || rowsB.length > 1 || rowsC.length > 1;
    
    // Find the maximum number of occurrences across all sheets for this key
    const maxOccurrences = Math.max(rowsA.length, rowsB.length, rowsC.length);
    
    // Create one result entry per occurrence
    for (let i = 0; i < maxOccurrences; i++) {
      const rowA = rowsA[i] || {};
      const rowB = rowsB[i] || {};
      const rowC = rowsC[i] || {};
      
      // Determine if this specific occurrence is present in each sheet
      const thisOccurrenceInA = i < rowsA.length;
      const thisOccurrenceInB = i < rowsB.length;
      const thisOccurrenceInC = i < rowsC.length;
      
      // Extract values for compare columns
      const valuesA: Record<string, string | null> = {};
      const valuesB: Record<string, string | null> = {};
      const valuesC: Record<string, string | null> = {};
      
      config.compareColumns.forEach(col => {
        valuesA[col] = rowA[col] || null;
        valuesB[col] = rowB[col] || null;
        valuesC[col] = rowC[col] || null;
      });
      
      // Determine status and mismatches
      let status: ReconcileStatus;
      const mismatches: string[] = [];
      
      if (isDuplicate) {
        status = 'Duplicate';
      } else if (!thisOccurrenceInA) {
        status = 'Missing in A';
      } else if (!thisOccurrenceInB) {
        status = 'Missing in B';
      } else if (!thisOccurrenceInC) {
        status = 'Missing in C';
      } else {
        // All present, check for mismatches
        let hasMismatch = false;
        
        config.compareColumns.forEach(col => {
          const vA = valuesA[col];
          const vB = valuesB[col];
          const vC = valuesC[col];
          
          if (vA !== vB || vB !== vC || vA !== vC) {
            hasMismatch = true;
            mismatches.push(col);
          }
        });
        
        if (hasMismatch) {
          status = 'Mismatch';
        } else {
          status = 'Matched';
        }
      }
      
      // Update summary counts
      summary.total++;
      if (status === 'Duplicate') {
        summary.duplicate++;
      } else if (status === 'Missing in A') {
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
      
      results.push({
        key,
        status,
        presentInA: thisOccurrenceInA,
        presentInB: thisOccurrenceInB,
        presentInC: thisOccurrenceInC,
        valuesA,
        valuesB,
        valuesC,
        mismatches,
        occurrenceIndex: maxOccurrences > 1 ? i + 1 : undefined,
        totalOccurrences: maxOccurrences > 1 ? maxOccurrences : undefined
      });
    }
  });
  
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
