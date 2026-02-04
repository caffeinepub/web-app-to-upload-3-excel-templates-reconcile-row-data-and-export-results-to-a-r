export interface ParsedSheet {
  name: string;
  headers: string[];
  rows: Record<string, string | null>[];
  fileName: string;
}

export interface ReconcileConfig {
  keyColumnsA: string[];
  keyColumnsB: string[];
  keyColumnsC: string[];
  compareColumns: string[];
}

export type ReconcileStatus = 'Matched' | 'Mismatch' | 'Missing in A' | 'Missing in B' | 'Missing in C' | 'Duplicate';

export interface ReconcileResultRow {
  key: string;
  status: ReconcileStatus;
  presentInA: boolean;
  presentInB: boolean;
  presentInC: boolean;
  valuesA: Record<string, string | null>;
  valuesB: Record<string, string | null>;
  valuesC: Record<string, string | null>;
  mismatches: string[];
  occurrenceIndex?: number;
  totalOccurrences?: number;
}

export interface ReconciliationResults {
  rows: ReconcileResultRow[];
  summary: {
    total: number;
    matched: number;
    mismatch: number;
    missingInA: number;
    missingInB: number;
    missingInC: number;
    duplicate: number;
  };
  config: ReconcileConfig;
  sheets: {
    a: ParsedSheet;
    b: ParsedSheet;
    c: ParsedSheet;
  };
}
