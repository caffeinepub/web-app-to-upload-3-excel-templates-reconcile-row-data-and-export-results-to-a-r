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
    
    // Use first row from each sheet for comparison
    const rowA = rowsA[0] || {};
    const rowB = rowsB[0] || {};
    const rowC = rowsC[0] || {};
    
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
      summary.duplicate++;
    } else if (!presentInA) {
      status = 'Missing in A';
      summary.missingInA++;
    } else if (!presentInB) {
      status = 'Missing in B';
      summary.missingInB++;
    } else if (!presentInC) {
      status = 'Missing in C';
      summary.missingInC++;
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
        summary.mismatch++;
      } else {
        status = 'Matched';
        summary.matched++;
      }
    }
    
    summary.total++;
    
    results.push({
      key,
      status,
      presentInA,
      presentInB,
      presentInC,
      valuesA,
      valuesB,
      valuesC,
      mismatches
    });
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
