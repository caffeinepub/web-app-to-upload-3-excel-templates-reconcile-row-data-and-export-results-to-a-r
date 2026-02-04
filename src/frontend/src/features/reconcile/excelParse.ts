import { ParsedSheet } from './types';
import { normalizeValue } from './normalize';
import { ensureXLSXLoaded, getXLSX } from '@/lib/xlsx';

export async function parseExcelFile(file: File, expectedSheetName: string): Promise<ParsedSheet> {
  // Ensure XLSX library is loaded
  await ensureXLSXLoaded();
  const XLSX = getXLSX();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('Failed to read file'));
          return;
        }
        
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Find the expected sheet
        const sheet = workbook.Sheets[expectedSheetName];
        if (!sheet) {
          reject(new Error(`Sheet "${expectedSheetName}" not found`));
          return;
        }
        
        // Convert to JSON with header row
        const jsonData = XLSX.utils.sheet_to_json(sheet, { 
          header: 1,
          defval: null,
          raw: false
        }) as (string | null)[][];
        
        if (jsonData.length === 0) {
          reject(new Error('Sheet is empty'));
          return;
        }
        
        // Extract headers (first row)
        const headers = (jsonData[0] || []).map(h => normalizeValue(h) || '');
        
        // Extract and normalize data rows
        const rows = jsonData.slice(1).map(row => {
          const rowObj: Record<string, string | null> = {};
          headers.forEach((header, index) => {
            rowObj[header] = normalizeValue(row[index]);
          });
          return rowObj;
        }).filter(row => {
          // Filter out completely empty rows
          return Object.values(row).some(val => val !== null && val !== '');
        });
        
        resolve({
          name: expectedSheetName,
          headers,
          rows,
          fileName: file.name
        });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

export async function getSheetNames(file: File): Promise<string[]> {
  // Ensure XLSX library is loaded
  await ensureXLSXLoaded();
  const XLSX = getXLSX();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('Failed to read file'));
          return;
        }
        
        const workbook = XLSX.read(data, { type: 'array' });
        resolve(workbook.SheetNames);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}
