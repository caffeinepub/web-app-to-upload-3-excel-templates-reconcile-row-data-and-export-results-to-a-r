import { ensureXLSXLoaded, getXLSX } from './xlsx';
import { TEMPLATE_SPECS, TemplateKey } from '../features/reconcile/templateSpec';

/**
 * Generates Excel template files with proper headers and sheet names.
 * Creates actual .xlsx binaries that can be opened in Microsoft Excel.
 */
export async function generateTemplate(templateKey: TemplateKey): Promise<Blob> {
  await ensureXLSXLoaded();
  const XLSX = getXLSX();
  const spec = TEMPLATE_SPECS[templateKey];
  
  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Create worksheet with headers as first row
  const ws = XLSX.utils.aoa_to_sheet([spec.requiredHeaders]);
  
  // Add the worksheet with the correct sheet name
  XLSX.utils.book_append_sheet(wb, ws, spec.sheetName);
  
  // Generate binary XLSX file
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  
  // Return as Blob
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/**
 * Triggers download of a template file
 */
export async function downloadTemplate(templateKey: TemplateKey): Promise<void> {
  const spec = TEMPLATE_SPECS[templateKey];
  const blob = await generateTemplate(templateKey);
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = spec.fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
