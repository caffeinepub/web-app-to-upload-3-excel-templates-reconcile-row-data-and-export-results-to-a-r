import { ReconciliationResults } from './types';
import { ensureXLSXLoaded, getXLSX } from '@/lib/xlsx';

export async function exportToXlsx(results: ReconciliationResults) {
  // Ensure XLSX library is loaded
  await ensureXLSXLoaded();
  const XLSX = getXLSX();

  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Prepare data for the Results sheet
  const data: any[][] = [];

  // Add summary section
  data.push(['Reconciliation Summary']);
  data.push(['Total Records', results.summary.total]);
  data.push(['Matched', results.summary.matched]);
  data.push(['Mismatch', results.summary.mismatch]);
  data.push(['Missing in A', results.summary.missingInA]);
  data.push(['Missing in B', results.summary.missingInB]);
  data.push(['Missing in C', results.summary.missingInC]);
  data.push(['Duplicate Keys', results.summary.duplicate]);
  data.push([]); // Empty row

  // Add results table header
  const headerRow = [
    'Key',
    'Status',
    'Present in A',
    'Present in B',
    'Present in C',
    'Mismatched Columns'
  ];

  // Add compare column headers for each sheet
  results.config.compareColumns.forEach(col => {
    headerRow.push(`${col} (A)`, `${col} (B)`, `${col} (C)`);
  });

  data.push(headerRow);

  // Add results data
  results.rows.forEach(row => {
    const dataRow: any[] = [
      row.key,
      row.status,
      row.presentInA ? 'Yes' : 'No',
      row.presentInB ? 'Yes' : 'No',
      row.presentInC ? 'Yes' : 'No',
      row.mismatches.join(', ') || 'None'
    ];

    // Add compare column values
    results.config.compareColumns.forEach(col => {
      dataRow.push(
        row.valuesA[col] || '',
        row.valuesB[col] || '',
        row.valuesC[col] || ''
      );
    });

    data.push(dataRow);
  });

  // Create worksheet from data
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Results');

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const filename = `Reconciliation_Results_${timestamp}.xlsx`;

  // Write and download the file
  XLSX.writeFile(wb, filename);
}
